import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import config
from models import db, User
from auth import gerarHashSenha


migrate = Migrate()


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

    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
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

    app.config.setdefault('ADMIN_INITIALIZED', False)
    app.config.setdefault('DB_INITIALIZED', False)

    @app.before_request
    def ensure_admin_user():
        if not app.config.get('DB_INITIALIZED'):
            try:
                db.create_all()
                app.config['DB_INITIALIZED'] = True
            except Exception:
                return

        if app.config.get('ADMIN_INITIALIZED'):
            return

        criar_usuario_admin()
        app.config['ADMIN_INITIALIZED'] = True
    
    return app


def criar_usuario_admin():
    """Create default admin user if it does not exist"""
    try:
        admin_existente = User.query.filter_by(email='admin@petsystem.com').first()

        if admin_existente:
            print('✓ Admin user já existe')
            return

        admin = User(
            nome='Administrador',
            email='admin@petsystem.com',
            senha=gerarHashSenha('admin123'),
            nivel_acesso='admin',
            status='ativo'
        )

        db.session.add(admin)
        db.session.commit()
        print('✓ Admin user criado: admin@petsystem.com / admin123')
    except Exception as e:
        db.session.rollback()
        print(f'✗ Erro ao criar admin user: {str(e)}')


if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('SERVER_PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )
