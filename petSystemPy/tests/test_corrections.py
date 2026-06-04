"""
Testes de regressão para as correções implementadas.
Cada bloco cobre exatamente uma mudança identificada na revisão.
"""
import json
from datetime import date


# ─────────────────────────────────────────────────────────────────────────────
# validations.py — validarIdadePet deve aceitar idade 0 (recém-nascidos)
# ─────────────────────────────────────────────────────────────────────────────

def test_validar_idade_zero_aceito():
    from validations import validarIdadePet
    assert validarIdadePet(0) is True


def test_validar_idade_positiva_aceita():
    from validations import validarIdadePet
    assert validarIdadePet(3) is True


def test_validar_idade_negativa_rejeitada():
    from validations import validarIdadePet
    assert validarIdadePet(-1) is False


def test_validar_idade_invalida_rejeitada():
    from validations import validarIdadePet
    assert validarIdadePet('abc') is False


# ─────────────────────────────────────────────────────────────────────────────
# api/auth.py — POST /api/auth/register requer role admin
# ─────────────────────────────────────────────────────────────────────────────

def test_register_sem_token_retorna_401(client):
    r = client.post(
        '/api/auth/register',
        data=json.dumps({'nome': 'X', 'login': 'x_test', 'password': 'abc123'}),
        content_type='application/json',
    )
    assert r.status_code == 401


def test_register_com_veterinario_retorna_403(client, cliente_headers):
    r = client.post(
        '/api/auth/register',
        data=json.dumps({'nome': 'X', 'login': 'x_vet', 'password': 'abc123'}),
        content_type='application/json',
        headers=cliente_headers,
    )
    assert r.status_code == 403


def test_register_com_admin_cria_usuario(client, admin_headers):
    payload = {
        'nome': 'Novo Via Register',
        'login': 'register_test_user',
        'password': 'senha123',
        'tipo': 'atendente',
    }
    r = client.post(
        '/api/auth/register',
        data=json.dumps(payload),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 201
    body = r.get_json()
    assert body['success'] is True
    assert body['user']['login'] == 'register_test_user'


# ─────────────────────────────────────────────────────────────────────────────
# api/agendamentos.py — hora aceita formato "HH:MM" (string de time, não datetime)
# ─────────────────────────────────────────────────────────────────────────────

def _criar_agendamento(client, headers, entities, hora):
    return client.post(
        '/api/agendamentos',
        data=json.dumps({
            'pet_id': entities['pet_id'],
            'veterinario_id': entities['vet_id'],
            'data': date.today().isoformat(),
            'hora': hora,
            'tipo': 'consulta',
        }),
        content_type='application/json',
        headers=headers,
    )


def test_agendamento_hora_hhmm(client, admin_headers, entities):
    r = _criar_agendamento(client, admin_headers, entities, '14:30')
    assert r.status_code == 201, r.get_json()


def test_agendamento_hora_hhmmss(client, admin_headers, entities):
    r = _criar_agendamento(client, admin_headers, entities, '09:00:00')
    assert r.status_code == 201, r.get_json()


def test_agendamento_hora_invalida(client, admin_headers, entities):
    r = _criar_agendamento(client, admin_headers, entities, 'nao-e-hora')
    assert r.status_code == 400
    assert r.get_json()['code'] == 'INVALID_DATE_FORMAT'


def test_update_agendamento_hora_hhmm(client, admin_headers, entities):
    # cria um agendamento para depois editar
    r = _criar_agendamento(client, admin_headers, entities, '10:00')
    agendamento_id = r.get_json()['data']['id']

    r2 = client.put(
        f'/api/agendamentos/{agendamento_id}',
        data=json.dumps({'hora': '15:45'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r2.status_code == 200
    assert r2.get_json()['data']['hora'].startswith('15:45')


def test_update_agendamento_hora_invalida(client, admin_headers, entities):
    r = _criar_agendamento(client, admin_headers, entities, '11:00')
    agendamento_id = r.get_json()['data']['id']

    r2 = client.put(
        f'/api/agendamentos/{agendamento_id}',
        data=json.dumps({'hora': 'nao-hora'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r2.status_code == 400
    assert r2.get_json()['code'] == 'INVALID_TIME_FORMAT'


# ─────────────────────────────────────────────────────────────────────────────
# api/estoque.py — PATCH /produtos/:id aceita campos além de 'ativo'
# ─────────────────────────────────────────────────────────────────────────────

def test_patch_produto_atualiza_nome(client, admin_headers, entities):
    pid = entities['produto_id']
    r = client.patch(
        f'/api/produtos/{pid}',
        data=json.dumps({'nome': 'Ração Super Premium'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert r.get_json()['data']['nome'] == 'Ração Super Premium'


def test_patch_produto_atualiza_preco(client, admin_headers, entities):
    pid = entities['produto_id']
    r = client.patch(
        f'/api/produtos/{pid}',
        data=json.dumps({'precoUnitario': 99.99}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert abs(r.get_json()['data']['precoUnitario'] - 99.99) < 0.01


def test_patch_produto_atualiza_estoque_minimo(client, admin_headers, entities):
    pid = entities['produto_id']
    r = client.patch(
        f'/api/produtos/{pid}',
        data=json.dumps({'estoque_minimo': 20}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert r.get_json()['data']['estoque_minimo'] == 20


def test_patch_produto_preco_invalido(client, admin_headers, entities):
    pid = entities['produto_id']
    r = client.patch(
        f'/api/produtos/{pid}',
        data=json.dumps({'precoUnitario': -5}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 400
    assert r.get_json()['code'] == 'INVALID_VALUE'


def test_patch_produto_nome_vazio(client, admin_headers, entities):
    pid = entities['produto_id']
    r = client.patch(
        f'/api/produtos/{pid}',
        data=json.dumps({'nome': ''}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 400
    assert r.get_json()['code'] == 'INVALID_VALUE'


# ─────────────────────────────────────────────────────────────────────────────
# api/estoque.py — observacoes em movimentação sem cliente usa o valor enviado
# (bug de precedência de operador)
# ─────────────────────────────────────────────────────────────────────────────

def test_saida_estoque_observacoes_sem_cliente(client, admin_headers, entities):
    """Quando não há cliente, a observação enviada pelo usuário deve ser preservada."""
    pid = entities['produto_id']
    obs_custom = 'Saída para uso interno'
    r = client.post(
        '/api/movimentacoes-estoque',
        data=json.dumps({
            'itens': [{'produtoId': pid, 'quantidade': 1}],
            'observacoes': obs_custom,
        }),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 201
    movs = r.get_json()['data']['movimentacoes']
    assert len(movs) > 0
    assert movs[0]['observacoes'] == obs_custom


def test_saida_estoque_observacoes_padrao_sem_cliente(client, admin_headers, entities):
    """Sem cliente e sem observação, deve usar 'Saída de estoque'."""
    pid = entities['produto_id']
    r = client.post(
        '/api/movimentacoes-estoque',
        data=json.dumps({'itens': [{'produtoId': pid, 'quantidade': 1}]}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 201
    movs = r.get_json()['data']['movimentacoes']
    assert movs[0]['observacoes'] == 'Saída de estoque'


# ─────────────────────────────────────────────────────────────────────────────
# api/medical.py — criar_prontuario não lança IntegrityError na segunda chamada
# ─────────────────────────────────────────────────────────────────────────────

def test_criar_prontuario_duas_vezes_nao_falha(client, admin_headers, entities):
    pet_id = entities['pet_id']

    r1 = client.post(
        f'/api/pets/{pet_id}/records',
        data=json.dumps({'diagnosis': 'Primeira consulta'}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r1.status_code == 201

    r2 = client.post(
        f'/api/pets/{pet_id}/records',
        data=json.dumps({'diagnosis': 'Segunda consulta'}),
        content_type='application/json',
        headers=admin_headers,
    )
    # Deve atualizar (não lançar IntegrityError) e retornar sucesso
    assert r2.status_code == 201
    assert r2.get_json()['success'] is True


def test_prontuario_sem_conteudo_retorna_400(client, admin_headers, entities):
    pet_id = entities['pet_id']
    r = client.post(
        f'/api/pets/{pet_id}/records',
        data=json.dumps({}),
        content_type='application/json',
        headers=admin_headers,
    )
    assert r.status_code == 400
    assert r.get_json()['code'] == 'MISSING_REQUIRED_FIELD'


# ─────────────────────────────────────────────────────────────────────────────
# api/medical.py — item_id de vacina usa id_aplicacao_vacina (não id_vacina)
# Dois registros da mesma vacina para o mesmo pet devem ter IDs distintos
# ─────────────────────────────────────────────────────────────────────────────

def test_duas_aplicacoes_da_mesma_vacina_tem_ids_distintos(app, client, admin_headers, entities):
    """
    _query_vacinas usava id_vacina (catálogo) em vez de id_aplicacao_vacina.
    Duas aplicações da mesma vacina geravam item_id idêntico.
    Testamos a helper diretamente para não depender de tabelas raw-SQL
    (ATENDIMENTO_EXAME / ATENDIMENTO_PROCEDIMENTO) ausentes no SQLite de teste.
    """
    pet_id = entities['pet_id']
    vet_id = entities['vet_id']
    vacina_id = entities['vacina_id']

    # Registra duas aplicações da mesma vacina para o mesmo pet
    for apply_date in ('2024-02-10', '2024-08-10'):
        r = client.post(
            f'/api/pets/{pet_id}/vaccines',
            data=json.dumps({
                'vacina_id': vacina_id,
                'veterinarian_id': vet_id,
                'appDate': apply_date,
            }),
            content_type='application/json',
            headers=admin_headers,
        )
        assert r.status_code == 201, r.get_json()

    # Verifica diretamente na helper que os item_ids são distintos
    from api.medical import _query_vacinas
    with app.app_context():
        items = _query_vacinas(pet_id)
        vacinas = [i for i in items if i['tipo'] == 'Vacinação']
        assert len(vacinas) >= 2
        ids = [v['id'] for v in vacinas]
        assert len(ids) == len(set(ids)), f"item_ids duplicados: {ids}"


# ─────────────────────────────────────────────────────────────────────────────
# api/medical.py — listar_vacinas: GET /pets/<id>/vaccines retorna campos corretos
# (cobre o fix do join que eliminou N+1)
# ─────────────────────────────────────────────────────────────────────────────

def test_listar_vacinas_pet_retorna_estrutura_correta(client, admin_headers, entities):
    pet_id = entities['pet_id']
    r = client.get(f'/api/pets/{pet_id}/vaccines', headers=admin_headers)
    assert r.status_code == 200
    body = r.get_json()
    assert body['success'] is True
    for vac in body['data']:
        assert 'id' in vac
        assert 'vacina_nome' in vac
        assert 'data_aplicacao' in vac
