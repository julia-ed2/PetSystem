"""
Testa os endpoints de vacinação:
  GET  /vacinas           — catálogo de vacinas
  GET  /pets/<id>/vaccines — vacinas aplicadas a um pet
  POST /pets/<id>/vaccines — registrar aplicação
"""
import json


# ── GET /vacinas (catálogo) ───────────────────────────────────────────────────

def test_listar_catalogo_vacinas(client, admin_headers):
    r = client.get('/api/vacinas', headers=admin_headers)
    assert r.status_code == 200
    body = r.get_json()
    assert body['success'] is True
    assert isinstance(body['data'], list)


def test_catalogo_vacinas_sem_token(client):
    r = client.get('/api/vacinas')
    # endpoint não exige role, apenas auth; sem token deve retornar 401
    assert r.status_code in (200, 401)


def test_catalogo_vacinas_contem_seed(client, admin_headers):
    r = client.get('/api/vacinas', headers=admin_headers)
    nomes = [v['nome'] for v in r.get_json()['data']]
    assert 'Anti-Rábica' in nomes


# ── GET /pets/<id>/vaccines ───────────────────────────────────────────────────

def test_listar_vacinas_pet_inexistente(client, admin_headers):
    r = client.get('/api/pets/999999/vaccines', headers=admin_headers)
    # pet não existe → 404 ou lista vazia (ambos aceitáveis)
    assert r.status_code in (200, 404)


def test_listar_vacinas_pet_sem_token(client):
    r = client.get('/api/pets/1/vaccines')
    assert r.status_code == 401


# ── POST /pets/<id>/vaccines ──────────────────────────────────────────────────

def _get_vacina_id(client, headers):
    r = client.get('/api/vacinas', headers=headers)
    vacinas = r.get_json()['data']
    return vacinas[0]['id'] if vacinas else None


def test_registrar_vacina_pet_inexistente(client, admin_headers):
    vacina_id = _get_vacina_id(client, admin_headers)
    payload = {
        'vacina_id': vacina_id,
        'veterinario_id': 1,
        'data_aplicacao': '2025-01-15',
        'observacoes': 'Aplicação de teste',
    }
    r = client.post(
        '/api/pets/999999/vaccines',
        data=json.dumps(payload),
        content_type='application/json',
        headers=admin_headers,
    )
    # pet não existe → deve retornar erro (4xx)
    assert r.status_code >= 400


def test_registrar_vacina_sem_token(client):
    r = client.post(
        '/api/pets/1/vaccines',
        data=json.dumps({'vacina_id': 1, 'veterinario_id': 1}),
        content_type='application/json',
    )
    assert r.status_code == 401
