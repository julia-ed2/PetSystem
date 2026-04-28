from functools import wraps
from flask import session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, db


def gerarHashSenha(senha):
    """Generate password hash using werkzeug"""
    return generate_password_hash(senha, method='pbkdf2:sha256')


def verificarSenha(senha_hash, senha):
    """Verify password against hash"""
    return check_password_hash(senha_hash, senha)


def autenticarUsuario(email, senha):
    """Authenticate user by email and password"""
    usuario = User.query.filter_by(email=email).first()
    if usuario and verificarSenha(usuario.senha, senha):
        return usuario
    return None


def obterUsuarioAtual():
    """Get currently authenticated user from session"""
    if 'usuario_id' in session:
        return User.query.get(session['usuario_id'])
    return None


def require_role(roles=None):
    """
    Decorator to protect routes based on user role.
    
    Args:
        roles (list): List of allowed roles (admin, operador, cliente)
                     If None, only requires authentication
    
    Example:
        @app.route('/admin')
        @require_role(['admin'])
        def admin_panel():
            ...
    """
    if roles is None:
        roles = ['admin', 'operador', 'cliente']
    
    def decorador(f):
        @wraps(f)
        def funcao_decorada(*args, **kwargs):
            usuario = obterUsuarioAtual()
            
            if not usuario:
                return jsonify({
                    'success': False,
                    'error': 'Não autenticado. Faça login para acessar.'
                }), 401
            
            if usuario.nivel_acesso not in roles:
                return jsonify({
                    'success': False,
                    'error': f'Acesso negado. Permissões insuficientes. Níveis permitidos: {", ".join(roles)}'
                }), 403
            
            return f(*args, **kwargs)
        
        return funcao_decorada
    return decorador


def require_auth(f):
    """
    Simpler decorator - just requires authentication, no role check.
    
    Example:
        @app.route('/me')
        @require_auth
        def get_current_user():
            ...
    """
    return require_role()(f)
