import os
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config import config
from models import db


migrate = Migrate()
jwt = JWTManager()


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
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('SERVER_PORT', 5000)),
        debug=os.getenv('FLASK_ENV') == 'development'
    )
