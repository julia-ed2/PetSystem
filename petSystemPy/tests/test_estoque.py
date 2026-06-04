import json


# ── GET /produtos ─────────────────────────────────────────────────────────────

def test_listar_produtos(client, admin_headers):
    r = client.get('/api/produtos', headers=admin_headers)
    assert r.status_code == 200
    body = r.get_json()
    assert body['success'] is True
    assert isinstance(body['data'], list)


def test_listar_produtos_sem_token(client):
    r = client.get('/api/produtos')
    assert r.status_code == 401


def test_produto_payload_tem_estoque_minimo(client, admin_headers):
    r = client.get('/api/produtos', headers=admin_headers)
    produtos = r.get_json()['data']
    assert len(produtos) > 0
    for p in produtos:
        assert 'estoque_minimo' in p
        assert 'quantidade' in p


# ── Alertas de estoque (computados client-side a partir de /produtos) ─────────

def test_alertas_estoque_identificados(client, admin_headers):
    """Produto com quantidade <= estoque_minimo deve aparecer na lista."""
    r = client.get('/api/produtos', headers=admin_headers)
    produtos = r.get_json()['data']
    alertas = [p for p in produtos if p['quantidade'] <= p['estoque_minimo']]
    # seed criou 'Shampoo Pet' com quantidade=3, estoque_minimo=10
    nomes = [p['nome'] for p in alertas]
    assert 'Shampoo Pet' in nomes


def test_produto_normal_nao_e_alerta(client, admin_headers):
    """Produto com estoque adequado não deve aparecer como alerta."""
    r = client.get('/api/produtos', headers=admin_headers)
    produtos = r.get_json()['data']
    alertas = [p for p in produtos if p['quantidade'] <= p['estoque_minimo']]
    nomes = [p['nome'] for p in alertas]
    assert 'Ração Premium' not in nomes


# ── POST /produtos ────────────────────────────────────────────────────────────

def test_criar_produto_sucesso(client, admin_headers):
    payload = {
        'nome': 'Antipulgas',
        'categoria': 'Medicamento',
        'quantidade': 20,
        'precoUnitario': 45.00,
        'estoque_minimo': 5,
    }
    r = client.post(
        '/api/produtos',
        data=json.dumps(payload),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 201
    body = r.get_json()
    assert body['success'] is True
    assert body['data']['nome'] == 'Antipulgas'


# ── POST /produtos/<id>/relancar ──────────────────────────────────────────────

def _id_produto_existente(client, headers):
    r = client.get('/api/produtos', headers=headers)
    return r.get_json()['data'][0]['id']


def test_relancar_produto_sucesso(client, admin_headers):
    pid = _id_produto_existente(client, admin_headers)
    r_antes = client.get('/api/produtos', headers=admin_headers)
    qtd_antes = next(p['quantidade'] for p in r_antes.get_json()['data'] if p['id'] == pid)

    r = client.post(
        f'/api/produtos/{pid}/relancar',
        data=json.dumps({'quantidade': 10, 'observacoes': 'Reposição teste'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 201
    body = r.get_json()
    assert body['success'] is True
    assert body['data']['produto']['quantidade'] == qtd_antes + 10
    assert body['data']['movimentacao']['tipo'] == 'entrada'


def test_relancar_produto_atualiza_preco(client, admin_headers):
    pid = _id_produto_existente(client, admin_headers)
    r = client.post(
        f'/api/produtos/{pid}/relancar',
        data=json.dumps({'quantidade': 5, 'precoUnitario': 99.90}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 201
    assert abs(r.get_json()['data']['produto']['precoUnitario'] - 99.90) < 0.01


def test_relancar_produto_quantidade_invalida(client, admin_headers):
    pid = _id_produto_existente(client, admin_headers)
    r = client.post(
        f'/api/produtos/{pid}/relancar',
        data=json.dumps({'quantidade': 0}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 400
    assert r.get_json()['code'] == 'INVALID_VALUE'


def test_relancar_produto_nao_encontrado(client, admin_headers):
    r = client.post(
        '/api/produtos/999999/relancar',
        data=json.dumps({'quantidade': 5}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 404


def test_relancar_produto_cliente_proibido(client, cliente_headers):
    r = client.post(
        '/api/produtos/1/relancar',
        data=json.dumps({'quantidade': 5}),
        content_type='application/json',
        headers=cliente_headers,
    )
    assert r.status_code == 403


def test_criar_produto_cliente_proibido(client, cliente_headers):
    payload = {'nome': 'X', 'categoria': 'Outro', 'quantidade': 1, 'precoUnitario': 1.0}
    r = client.post(
        '/api/produtos',
        data=json.dumps(payload),
        content_type='application/json',
        headers=cliente_headers,
    )
    assert r.status_code == 403


def test_criar_produto_quantidade_zero(client, admin_headers):
    payload = {'nome': 'Produto Inválido', 'categoria': 'Outro', 'quantidade': 0, 'precoUnitario': 10.0}
    r = client.post(
        '/api/produtos',
        data=json.dumps(payload),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 400


def test_criar_produto_sem_nome(client, admin_headers):
    payload = {'nome': '', 'categoria': 'Outro', 'quantidade': 5, 'precoUnitario': 10.0}
    r = client.post(
        '/api/produtos',
        data=json.dumps(payload),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 400
