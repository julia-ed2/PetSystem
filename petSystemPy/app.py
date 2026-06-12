import os
from sqlalchemy import inspect, text
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config import config
from models import db


migrate = Migrate()
jwt = JWTManager()

_inventory_columns_checked = False

DEFAULT_VETERINARIOS = [
    {
        'nome': 'Dr. Pedro Mendes',
        'crmv': 'CRMV/SP 1234',
        'telefone': '11999995555',
        'email': 'pedro@clinica.com',
    },
    {
        'nome': 'Dra. Fernanda Lima',
        'crmv': 'CRMV/SP 5678',
        'telefone': '11999994444',
        'email': 'fernanda@clinica.com',
    },
    {
        'nome': 'Dr. Lucas Ferreira',
        'crmv': 'CRMV/SP 9012',
        'telefone': '11999993333',
        'email': 'lucas@clinica.com',
    },
]


def ensure_default_veterinarios(app):
    with app.app_context():
        try:
            from models import Veterinario

            if Veterinario.query.count() > 0:
                return

            for data in DEFAULT_VETERINARIOS:
                db.session.add(Veterinario(ativo=True, **data))

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f'⚠️  Warning: Could not seed default veterinarios: {e}')


def ensure_inventory_columns(app):
    global _inventory_columns_checked
    if _inventory_columns_checked:
        return
    with app.app_context():
        try:
            inspector = inspect(db.engine)

            produto_columns = {column['name'] for column in inspector.get_columns('PRODUTO')}
            if 'categoria' not in produto_columns:
                db.session.execute(text("ALTER TABLE PRODUTO ADD COLUMN categoria VARCHAR(50) NOT NULL DEFAULT 'Outro' AFTER marca"))
                db.session.execute(text("UPDATE PRODUTO SET categoria = 'Outro' WHERE categoria IS NULL OR categoria = ''"))

            lancamento_columns = {column['name'] for column in inspector.get_columns('LANCAMENTO_FINANCEIRO')}
            if 'status' not in lancamento_columns:
                db.session.execute(text("ALTER TABLE LANCAMENTO_FINANCEIRO ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Pago' AFTER forma_pagamento"))
                db.session.execute(text("UPDATE LANCAMENTO_FINANCEIRO SET status = 'Pago' WHERE status IS NULL OR status = ''"))

            db.session.commit()
            _inventory_columns_checked = True
        except Exception as e:
            db.session.rollback()
            print(f'⚠️  Warning: Could not ensure inventory columns: {e}')


def create_app(config_name=None):
    """
    Application factory pattern.
    Creates and configures Flask application instance.
    """
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # During local development allow all origins for convenience (no credentials)
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False
        }
    })

    try:
        from api.auth import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import auth blueprint: {e}')

    try:
        from api.medical import medical_bp
        app.register_blueprint(medical_bp, url_prefix='/api')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import medical blueprint: {e}')

    try:
        from api.pets import pets_bp
        app.register_blueprint(pets_bp, url_prefix='/api')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import pets blueprint: {e}')

    try:
        from api.tutores import tutores_bp
        app.register_blueprint(tutores_bp, url_prefix='/api')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import tutores blueprint: {e}')

    try:
        from api.agendamentos import agendamentos_bp
        app.register_blueprint(agendamentos_bp, url_prefix='/api')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import agendamentos blueprint: {e}')

    try:
        from api.usuarios import usuarios_bp
        app.register_blueprint(usuarios_bp, url_prefix='/api')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import usuarios blueprint: {e}')

    try:
        from api.estoque import estoque_bp
        app.register_blueprint(estoque_bp, url_prefix='/api')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import estoque blueprint: {e}')

    try:
        from api.veterinarios import veterinarios_bp
        app.register_blueprint(veterinarios_bp, url_prefix='/api')
    except ImportError as e:
        print(f'⚠️  Warning: Could not import veterinarios blueprint: {e}')


    ensure_default_veterinarios(app)
    ensure_inventory_columns(app)

    @app.route('/api/health', methods=['GET'])
    def health():
        return {
            'status': 'ok',
            'environment': os.getenv('FLASK_ENV', 'development')
        }, 200

    @app.errorhandler(404)
    def not_found(error):
        return {
            'success': False,
            'error': 'Recurso não encontrado'
        }, 404
    
    @app.errorhandler(500)
    def server_error(error):
        db.session.rollback()
        return {
            'success': False,
            'error': 'Erro interno do servidor'
        }, 500

    return app


if __name__ == '__main__':
    env = os.getenv('FLASK_ENV', 'development')
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('SERVER_PORT', 5000)),
        debug=env == 'development'
    )
