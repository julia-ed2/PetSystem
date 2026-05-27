from flask import Blueprint, jsonify

from auth import require_auth
from models import Veterinario


veterinarios_bp = Blueprint('veterinarios', __name__)


@veterinarios_bp.route('/veterinarios', methods=['GET'])
@require_auth
def list_veterinarios(current_user):
    try:
        veterinarios = Veterinario.query.filter_by(ativo=True).order_by(Veterinario.nome.asc()).all()
        return jsonify({
            'success': True,
            'data': [
                {
                    'id': vet.id_veterinario,
                    'nome': vet.nome,
                    'crmv': vet.crmv,
                    'telefone': vet.telefone,
                    'email': vet.email,
                    'ativo': vet.ativo,
                }
                for vet in veterinarios
            ],
            'total': len(veterinarios),
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar veterinarios: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@veterinarios_bp.route('/veterinarios/<int:veterinario_id>', methods=['GET'])
@require_auth
def get_veterinario(veterinario_id, current_user):
    try:
        vet = Veterinario.query.get(veterinario_id)
        if not vet:
            return jsonify({
                'success': False,
                'error': 'Veterinario nao encontrado',
                'code': 'VETERINARIO_NOT_FOUND',
            }), 404

        return jsonify({
            'success': True,
            'data': {
                'id': vet.id_veterinario,
                'nome': vet.nome,
                'crmv': vet.crmv,
                'telefone': vet.telefone,
                'email': vet.email,
                'ativo': vet.ativo,
            },
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter veterinario: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500
