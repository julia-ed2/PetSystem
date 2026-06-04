import pytest
from datetime import date

from app import create_app
from models import db as _db, User, LancamentoFinanceiro, Produto, Vacina, Veterinario, Tutor, Pet
from auth import hash_password, create_tokens


@pytest.fixture(scope='session')
def app():
    test_app = create_app('testing')
    test_app.config['PROPAGATE_EXCEPTIONS'] = True
    with test_app.app_context():
        _db.create_all()
        _seed_test_data()
        yield test_app
        _db.drop_all()


def _seed_test_data():
    admin = User(
        nome='Admin Teste',
        login='admin_test',
        senha_hash=hash_password('senha123'),
        tipo_usuario='admin',
        ativo=True,
    )
    atendente = User(
        nome='Atendente Teste',
        login='atendente_test',
        senha_hash=hash_password('senha123'),
        tipo_usuario='atendente',
        ativo=True,
    )
    veterinario = User(
        nome='Veterinario Teste',
        login='vet_test',
        senha_hash=hash_password('senha123'),
        tipo_usuario='veterinario',
        ativo=True,
    )
    _db.session.add_all([admin, atendente, veterinario])
    _db.session.flush()

    vacina = Vacina(nome='Anti-Rábica', fabricante='LabTest', intervalo_dias=365, ativa=True)
    _db.session.add(vacina)

    produto_ok = Produto(
        nome='Ração Premium',
        categoria='Alimentação',
        quantidade_estoque=50,
        estoque_minimo=10,
        valor_unitario=89.90,
        ativo=True,
    )
    produto_alerta = Produto(
        nome='Shampoo Pet',
        categoria='Higiene',
        quantidade_estoque=3,
        estoque_minimo=10,
        valor_unitario=29.90,
        ativo=True,
    )
    _db.session.add_all([produto_ok, produto_alerta])

    lancamento = LancamentoFinanceiro(
        tipo_lancamento='receita',
        categoria='Consulta',
        descricao='Consulta veterinária',
        valor=150.00,
        data_lancamento=date.today(),
        forma_pagamento='pix',
        status='Pago',
    )
    _db.session.add(lancamento)

    # Veterinário, tutor e pet usados pelos testes de correções
    vet_model = Veterinario(nome='Dr. Seed', crmv='CRMV/SP 0001', ativo=True)
    tutor_model = Tutor(nome='Tutor Seed', cpf='12345678901', ativo=True)
    _db.session.add_all([vet_model, tutor_model])
    _db.session.flush()

    pet_model = Pet(nome='Rex', especie='Cachorro', id_tutor=tutor_model.id_tutor, ativo=True)
    _db.session.add(pet_model)
    _db.session.commit()


@pytest.fixture(scope='session')
def client(app):
    return app.test_client()


def _auth_header(app, login):
    with app.app_context():
        user = User.query.filter_by(login=login).first()
        tokens = create_tokens(user.id_usuario)
        return {'Authorization': f'Bearer {tokens["access_token"]}'}


@pytest.fixture(scope='session')
def admin_headers(app):
    return _auth_header(app, 'admin_test')


@pytest.fixture(scope='session')
def atendente_headers(app):
    return _auth_header(app, 'atendente_test')


@pytest.fixture(scope='session')
def cliente_headers(app):
    # veterinario não tem permissão de escrita em estoque/financeiro
    return _auth_header(app, 'vet_test')


@pytest.fixture(scope='session')
def entities(app):
    """IDs de Veterinario, Tutor e Pet criados no seed."""
    with app.app_context():
        vet = Veterinario.query.filter_by(crmv='CRMV/SP 0001').first()
        tutor = Tutor.query.filter_by(cpf='12345678901').first()
        pet = Pet.query.filter_by(nome='Rex').first()
        produto = Produto.query.filter_by(nome='Ração Premium').first()
        vacina = Vacina.query.filter_by(nome='Anti-Rábica').first()
        return {
            'vet_id': vet.id_veterinario,
            'tutor_id': tutor.id_tutor,
            'pet_id': pet.id_pet,
            'produto_id': produto.id_produto,
            'vacina_id': vacina.id_vacina,
        }
