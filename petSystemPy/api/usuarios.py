from flask import Blueprint, request, jsonify

from auth import hash_password, require_role
from models import User, Tutor, db


usuarios_bp = Blueprint('usuarios', __name__)

VALID_USER_TYPES = {'admin', 'veterinario', 'atendente', 'gerente'}
USER_TYPE_ALIASES = {
    'administrador': 'admin',
    'usuario': 'atendente',
    'user': 'atendente',
}


def _serialize_user(usuario: User):
    return {
        'id': usuario.id_usuario,
        'nome': usuario.nome,
        'login': usuario.login,
        'tipo': usuario.tipo_usuario,
        'ativo': usuario.ativo,
        'tutor_id': usuario.id_tutor,
    }


def _validate_tipo(tipo_usuario):
    return tipo_usuario in VALID_USER_TYPES


def _normalize_tipo(tipo_usuario):
    tipo_normalizado = (tipo_usuario or '').strip().lower()
    return USER_TYPE_ALIASES.get(tipo_normalizado, tipo_normalizado)


@usuarios_bp.route('/usuarios', methods=['GET'])
@require_role('admin', 'atendente')
def list_usuarios(current_user):
    """Lista usuários do sistema (por padrão apenas ativos)."""
    try:
        include_inativos = request.args.get('include_inativos', 'false').lower() == 'true'

        query = User.query
        if not include_inativos:
            query = query.filter_by(ativo=True)

        usuarios = query.order_by(User.nome.asc()).all()

        return jsonify({
            'success': True,
            'data': [_serialize_user(usuario) for usuario in usuarios],
            'total': len(usuarios),
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar usuários: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@usuarios_bp.route('/usuarios/<int:user_id>', methods=['GET'])
@require_role('admin', 'atendente')
def get_usuario(user_id, current_user):
    """Retorna detalhes de um usuário do sistema."""
    try:
        usuario = User.query.get(user_id)
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado',
                'code': 'USER_NOT_FOUND',
            }), 404

        return jsonify({
            'success': True,
            'data': _serialize_user(usuario),
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao buscar usuário: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@usuarios_bp.route('/usuarios', methods=['POST'])
@require_role('admin')
def create_usuario(current_user):
    """Cria usuário interno do sistema."""
    try:
        dados = request.get_json() or {}

        nome = (dados.get('nome') or '').strip()
        login = (dados.get('login') or '').strip().lower()
        senha = dados.get('password') or ''
        tipo_usuario = _normalize_tipo(dados.get('tipo', 'atendente'))
        tutor_id = dados.get('tutor_id')

        if not nome or not login or not senha:
            return jsonify({
                'success': False,
                'error': 'Nome, login e senha são obrigatórios',
                'code': 'MISSING_FIELDS',
            }), 400

        if len(senha) < 6:
            return jsonify({
                'success': False,
                'error': 'Senha deve ter pelo menos 6 caracteres',
                'code': 'WEAK_PASSWORD',
            }), 400

        if not _validate_tipo(tipo_usuario):
            return jsonify({
                'success': False,
                'error': 'Tipo de usuário inválido',
                'code': 'INVALID_USER_TYPE',
            }), 400

        if User.query.filter_by(login=login).first():
            return jsonify({
                'success': False,
                'error': 'Login já existe',
                'code': 'LOGIN_ALREADY_EXISTS',
            }), 409

        if tutor_id is not None:
            tutor = Tutor.query.get(tutor_id)
            if not tutor:
                return jsonify({
                    'success': False,
                    'error': 'Tutor não encontrado para vincular ao usuário',
                    'code': 'TUTOR_NOT_FOUND',
                }), 404

        novo_usuario = User(
            nome=nome,
            login=login,
            senha_hash=hash_password(senha),
            tipo_usuario=tipo_usuario,
            ativo=True,
            id_tutor=tutor_id,
        )

        db.session.add(novo_usuario)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'data': _serialize_user(novo_usuario),
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar usuário: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@usuarios_bp.route('/usuarios/<int:user_id>', methods=['PUT'])
@require_role('admin')
def update_usuario(user_id, current_user):
    """Atualiza dados de um usuário interno."""
    try:
        usuario = User.query.get(user_id)
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado',
                'code': 'USER_NOT_FOUND',
            }), 404

        dados = request.get_json() or {}

        if 'nome' in dados:
            nome = (dados.get('nome') or '').strip()
            if not nome:
                return jsonify({
                    'success': False,
                    'error': 'Nome não pode ser vazio',
                    'code': 'INVALID_NAME',
                }), 400
            usuario.nome = nome

        if 'login' in dados:
            login = (dados.get('login') or '').strip().lower()
            if not login:
                return jsonify({
                    'success': False,
                    'error': 'Login não pode ser vazio',
                    'code': 'INVALID_LOGIN',
                }), 400

            existente = User.query.filter(User.login == login, User.id_usuario != user_id).first()
            if existente:
                return jsonify({
                    'success': False,
                    'error': 'Login já existe',
                    'code': 'LOGIN_ALREADY_EXISTS',
                }), 409
            usuario.login = login

        if 'tipo' in dados:
            tipo_usuario = _normalize_tipo(dados.get('tipo'))
            if not _validate_tipo(tipo_usuario):
                return jsonify({
                    'success': False,
                    'error': 'Tipo de usuário inválido',
                    'code': 'INVALID_USER_TYPE',
                }), 400
            usuario.tipo_usuario = tipo_usuario

        if 'password' in dados:
            senha = dados.get('password') or ''
            if len(senha) < 6:
                return jsonify({
                    'success': False,
                    'error': 'Senha deve ter pelo menos 6 caracteres',
                    'code': 'WEAK_PASSWORD',
                }), 400
            usuario.senha_hash = hash_password(senha)

        if 'tutor_id' in dados:
            tutor_id = dados.get('tutor_id')
            if tutor_id is not None:
                tutor = Tutor.query.get(tutor_id)
                if not tutor:
                    return jsonify({
                        'success': False,
                        'error': 'Tutor não encontrado para vincular ao usuário',
                        'code': 'TUTOR_NOT_FOUND',
                    }), 404
            usuario.id_tutor = tutor_id

        if 'ativo' in dados:
            usuario.ativo = bool(dados.get('ativo'))

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário atualizado com sucesso',
            'data': _serialize_user(usuario),
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar usuário: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@usuarios_bp.route('/usuarios/<int:user_id>', methods=['DELETE'])
@require_role('admin')
def delete_usuario(user_id, current_user):
    """Desativa (soft delete) um usuário interno."""
    try:
        usuario = User.query.get(user_id)
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuário não encontrado',
                'code': 'USER_NOT_FOUND',
            }), 404

        if usuario.id_usuario == current_user.id_usuario:
            return jsonify({
                'success': False,
                'error': 'Não é permitido excluir o próprio usuário logado',
                'code': 'SELF_DELETE_FORBIDDEN',
            }), 400

        usuario.ativo = False
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Usuário desativado com sucesso',
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao excluir usuário: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500
