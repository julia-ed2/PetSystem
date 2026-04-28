from flask import Blueprint, jsonify
from auth import require_auth

medical_bp = Blueprint('medical', __name__)


def _not_implemented(message):
    return jsonify({
        'success': False,
        'error': message,
        'code': 'NOT_IMPLEMENTED_NO_DB'
    }), 501


@medical_bp.route('/pets/<int:pet_id>/records', methods=['GET'])
@require_auth
def listar_prontuarios(pet_id):
    return _not_implemented('Prontuários indisponíveis sem banco de dados')


@medical_bp.route('/pets/<int:pet_id>/records', methods=['POST'])
@require_auth
def criar_prontuario(pet_id):
    return _not_implemented('Criação de prontuários indisponível sem banco de dados')


@medical_bp.route('/pets/<int:pet_id>/vaccines', methods=['GET'])
@require_auth
def listar_vacinas(pet_id):
    return _not_implemented('Vacinas indisponíveis sem banco de dados')


@medical_bp.route('/pets/<int:pet_id>/vaccines', methods=['POST'])
@require_auth
def criar_vacina(pet_id):
    return _not_implemented('Registro de vacinas indisponível sem banco de dados')
