from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
from models import User, db


def hash_password(senha):
    """Generate password hash using werkzeug"""
    return generate_password_hash(senha, method='pbkdf2:sha256')


def verify_password(senha_hash, senha):
    """Verify password against hash"""
    try:
        return check_password_hash(senha_hash, senha)
    except:
        return False


def authenticate_user(login, senha):
    """Authenticate user by login and password"""
    login_normalizado = (login or '').strip().lower()
    usuario = User.query.filter(func.lower(User.login) == login_normalizado).first()
    if usuario and verify_password(usuario.senha_hash, senha):
        return usuario
    return None


def get_current_user():
    """Get currently authenticated user from JWT token"""
    try:
        usuario_id_str = get_jwt_identity()
        # Convert back from string to int
        usuario_id = int(usuario_id_str)
        return User.query.get(usuario_id)
    except:
        return None


def require_auth(f):
    """
    Decorator to require JWT authentication.
    
    Example:
        @app.route('/me')
        @require_auth
        def get_current_user():
            ...
    """
    @jwt_required()
    @wraps(f)
    def decorated_function(*args, **kwargs):
        usuario = get_current_user()
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado',
                'code': 'USER_NOT_FOUND'
            }), 404
        
        # Pass current user to the endpoint
        return f(*args, current_user=usuario, **kwargs)
    
    return decorated_function


def require_role(*allowed_roles):
    """
    Decorator to require specific role(s) for access.
    
    Args:
        allowed_roles: One or more role strings (admin, veterinario, atendente, gerente)
    
    Example:
        @app.route('/admin')
        @require_role('admin', 'veterinario')
        def admin_panel():
            ...
    """
    def decorator(f):
        @jwt_required()
        @wraps(f)
        def decorated_function(*args, **kwargs):
            usuario = get_current_user()
            
            if not usuario:
                return jsonify({
                    'success': False,
                    'error': 'Não autenticado',
                    'code': 'UNAUTHORIZED'
                }), 401
            
            if usuario.tipo_usuario not in allowed_roles:
                return jsonify({
                    'success': False,
                    'error': f'Acesso negado. Papéis permitidos: {", ".join(allowed_roles)}',
                    'code': 'FORBIDDEN'
                }), 403
            
            # Pass current user to the endpoint
            return f(*args, current_user=usuario, **kwargs)
        
        return decorated_function
    return decorator


def create_tokens(usuario_id):
    """Create access and refresh tokens for a user"""
    # Convert to string for JWT (Flask-JWT-Extended requires string identity)
    usuario_id_str = str(usuario_id)
    access_token = create_access_token(identity=usuario_id_str)
    refresh_token = create_refresh_token(identity=usuario_id_str)
    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }

