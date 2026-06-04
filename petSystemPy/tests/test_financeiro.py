import json
from datetime import date


def _post(client, headers, payload):
    return client.post(
        '/api/lancamentos-financeiros',
        data=json.dumps(payload),
        content_type='application/json',
        headers=headers,
    )


# ── GET /lancamentos-financeiros ─────────────────────────────────────────────

def test_listar_lancamentos_autenticado(client, admin_headers):
    r = client.get('/api/lancamentos-financeiros', headers=admin_headers)
    assert r.status_code == 200
    body = r.get_json()
    assert body['success'] is True
    assert isinstance(body['data'], list)


def test_listar_lancamentos_sem_token(client):
    r = client.get('/api/lancamentos-financeiros')
    assert r.status_code == 401


def test_listar_lancamentos_filtro_tipo(client, admin_headers):
    r = client.get('/api/lancamentos-financeiros?tipo=receita', headers=admin_headers)
    assert r.status_code == 200
    for item in r.get_json()['data']:
        assert item['tipo'] == 'receita'


def test_listar_lancamentos_filtro_mes(client, admin_headers):
    mes = date.today().month
    r = client.get(f'/api/lancamentos-financeiros?mes={mes}', headers=admin_headers)
    assert r.status_code == 200
    assert r.get_json()['success'] is True


# ── POST /lancamentos-financeiros ─────────────────────────────────────────────

def test_criar_lancamento_sucesso(client, admin_headers):
    payload = {
        'descricao': 'Consulta teste',
        'categoria': 'Consulta',
        'tipo': 'receita',
        'valor': 200.00,
        'status': 'Pago',
        'data': date.today().isoformat(),
        'forma_pagamento': 'pix',
    }
    r = _post(client, admin_headers, payload)
    assert r.status_code == 201
    body = r.get_json()
    assert body['success'] is True
    assert body['data']['tipo'] == 'receita'
    assert body['data']['valor'] == 200.0


def test_criar_lancamento_tipo_despesa(client, atendente_headers):
    payload = {
        'descricao': 'Compra insumos',
        'categoria': 'Insumo',
        'tipo': 'despesa',
        'valor': 50.00,
        'status': 'Pago',
        'data': date.today().isoformat(),
    }
    r = _post(client, atendente_headers, payload)
    assert r.status_code == 201
    # _lancamento_payload normaliza 'despesa' → 'gasto' na resposta
    assert r.get_json()['data']['tipo'] == 'gasto'


def test_criar_lancamento_cliente_proibido(client, cliente_headers):
    payload = {
        'descricao': 'X',
        'categoria': 'Outro',
        'tipo': 'receita',
        'valor': 10.00,
        'status': 'Pago',
        'data': date.today().isoformat(),
    }
    r = _post(client, cliente_headers, payload)
    assert r.status_code == 403


def test_criar_lancamento_valor_negativo(client, admin_headers):
    payload = {
        'descricao': 'Inválido',
        'categoria': 'Outro',
        'tipo': 'receita',
        'valor': -5.00,
        'status': 'Pago',
        'data': date.today().isoformat(),
    }
    r = _post(client, admin_headers, payload)
    assert r.status_code == 400
    assert r.get_json()['code'] == 'INVALID_VALUE'


def test_criar_lancamento_sem_descricao(client, admin_headers):
    payload = {
        'descricao': '',
        'categoria': 'Consulta',
        'tipo': 'receita',
        'valor': 100.00,
        'status': 'Pago',
        'data': date.today().isoformat(),
    }
    r = _post(client, admin_headers, payload)
    assert r.status_code == 400
    assert r.get_json()['code'] == 'MISSING_REQUIRED_FIELD'


def test_criar_lancamento_tipo_invalido(client, admin_headers):
    payload = {
        'descricao': 'Teste',
        'categoria': 'Outro',
        'tipo': 'invalido',
        'valor': 10.00,
        'status': 'Pago',
        'data': date.today().isoformat(),
    }
    r = _post(client, admin_headers, payload)
    assert r.status_code == 400


# ── PATCH /lancamentos-financeiros/<id>/status ────────────────────────────────

def _criar_lancamento_e_obter_id(client, headers):
    payload = {
        'descricao': 'Para atualizar status',
        'categoria': 'Outro',
        'tipo': 'receita',
        'valor': 30.00,
        'status': 'Pendente',
        'data': date.today().isoformat(),
    }
    r = _post(client, headers, payload)
    return r.get_json()['data']['id']


def test_atualizar_status_sucesso(client, admin_headers):
    lid = _criar_lancamento_e_obter_id(client, admin_headers)
    r = client.patch(
        f'/api/lancamentos-financeiros/{lid}/status',
        data=json.dumps({'status': 'Pago'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert r.get_json()['data']['status'] == 'Pago'


def test_atualizar_status_invalido(client, admin_headers):
    lid = _criar_lancamento_e_obter_id(client, admin_headers)
    r = client.patch(
        f'/api/lancamentos-financeiros/{lid}/status',
        data=json.dumps({'status': 'Desconhecido'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 400


def test_atualizar_status_nao_encontrado(client, admin_headers):
    r = client.patch(
        '/api/lancamentos-financeiros/999999/status',
        data=json.dumps({'status': 'Pago'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 404
