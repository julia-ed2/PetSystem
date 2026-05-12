from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, db
from auth import (
    authenticate_user, 
    hash_password, 
    verify_password,
    require_auth,
    create_tokens,
    get_current_user
)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint.
    Expects JSON: { "login": "...", "password": "..." }
    Returns: { "success": true, "access_token": "...", "refresh_token": "...", "user": {...} }
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        login_field = dados.get('login', '').strip()
        senha = dados.get('password', '')
        
        if not login_field or not senha:
            return jsonify({
                'success': False,
                'error': 'Login e senha são obrigatórios',
                'code': 'MISSING_FIELDS'
            }), 400
        
        usuario = authenticate_user(login_field, senha)
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Login ou senha incorretos',
                'code': 'INVALID_CREDENTIALS'
            }), 401
        
        if not usuario.ativo:
            return jsonify({
                'success': False,
                'error': 'Usuário inativo. Entre em contato com o administrador',
                'code': 'USER_INACTIVE'
            }), 403
        
        # Create tokens
        tokens = create_tokens(usuario.id_usuario)
        
        return jsonify({
            'success': True,
            'message': f'Login bem-sucedido. Bem-vindo, {usuario.nome}!',
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'user': {
                'id': usuario.id_usuario,
                'nome': usuario.nome,
                'login': usuario.login,
                'tipo': usuario.tipo_usuario
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao fazer login: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout endpoint.
    Requires JWT token in Authorization header.
    Returns: { "success": true, "message": "..." }
    """
    try:
        usuario_id = get_jwt_identity()
        
        # Token will be invalidated on the client side
        # In production, you might want to blacklist the token
        return jsonify({
            'success': True,
            'message': 'Logout realizado com sucesso'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao fazer logout: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user_info(current_user):
    """
    Get current user information.
    Requires JWT token in Authorization header.
    Returns: { "success": true, "user": {...} }
    """
    try:
        return jsonify({
            'success': True,
            'user': {
                'id': current_user.id_usuario,
                'nome': current_user.nome,
                'login': current_user.login,
                'tipo': current_user.tipo_usuario,
                'ativo': current_user.ativo,
                'tutor_id': current_user.id_tutor
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter dados do usuário: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register new user.
    Expects JSON: { "nome": "...", "login": "...", "password": "..." }
    Returns: { "success": true, "user": {...}, "access_token": "...", "refresh_token": "..." }
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        nome = dados.get('nome', '').strip()
        login = dados.get('login', '').strip()
        senha = dados.get('password', '')
        tipo_usuario = dados.get('tipo', 'atendente')
        
        # Validate required fields
        if not nome or not login or not senha:
            return jsonify({
                'success': False,
                'error': 'Nome, login e senha são obrigatórios',
                'code': 'MISSING_FIELDS'
            }), 400
        
        # Check if login already exists
        if User.query.filter_by(login=login).first():
            return jsonify({
                'success': False,
                'error': 'Login já existe',
                'code': 'LOGIN_ALREADY_EXISTS'
            }), 409
        
        # Validate password length
        if len(senha) < 6:
            return jsonify({
                'success': False,
                'error': 'Senha deve ter pelo menos 6 caracteres',
                'code': 'WEAK_PASSWORD'
            }), 400
        
        # Create new user
        novo_usuario = User(
            nome=nome,
            login=login,
            senha_hash=hash_password(senha),
            tipo_usuario=tipo_usuario,
            ativo=True
        )
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        # Create tokens
        tokens = create_tokens(novo_usuario.id_usuario)
        
        return jsonify({
            'success': True,
            'message': 'Registro bem-sucedido!',
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'user': {
                'id': novo_usuario.id_usuario,
                'nome': novo_usuario.nome,
                'login': novo_usuario.login,
                'tipo': novo_usuario.tipo_usuario
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao registrar usuário: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500
