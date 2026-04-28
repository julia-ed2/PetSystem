from flask import Blueprint, request, jsonify, session
from models import User, db
from auth import autenticarUsuario, obterUsuarioAtual, gerarHashSenha, require_auth

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint.
    Expects JSON: { "email": "...", "password": "..." }
    Returns: { "success": true, "user": {...}, "message": "..." }
    """
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido'
            }), 400
        
        email = dados.get('email', '').strip()
        senha = dados.get('password', '')
        
        if not email or not senha:
            return jsonify({
                'success': False,
                'error': 'E-mail e senha são obrigatórios'
            }), 400
        
        usuario = autenticarUsuario(email, senha)
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'E-mail ou senha incorretos'
            }), 401
        
        if usuario.status == 'inativo':
            return jsonify({
                'success': False,
                'error': 'Usuário inativo. Entre em contato com o administrador'
            }), 403
        
        session['usuario_id'] = usuario.id
        session['usuario_email'] = usuario.email
        session['usuario_nome'] = usuario.nome
        session['usuario_nivel'] = usuario.nivel_acesso
        session.permanent = True
        
        return jsonify({
            'success': True,
            'message': f'Bem-vindo, {usuario.nome}!',
            'user': usuario.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao fazer login: {str(e)}'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout endpoint.
    Destroys user session.
    """
    try:
        session.clear()
        return jsonify({
            'success': True,
            'message': 'Desconectado com sucesso'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao desconectar: {str(e)}'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """
    Get current authenticated user info.
    Requires authentication.
    """
    try:
        usuario = obterUsuarioAtual()
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'user': usuario.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar usuário: {str(e)}'
        }), 500
