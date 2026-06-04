from flask import Blueprint, request, jsonify
from models import db, Tutor, Pet
from auth import require_auth, require_role
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

tutores_bp = Blueprint('tutores', __name__)


@tutores_bp.route('/tutores', methods=['GET'])
@require_auth
def list_tutores(current_user):
    """
    List all tutores.
    Optional query params: nome, cpf
    """
    try:
        query = Tutor.query
        
        # Filter by name if provided
        nome = request.args.get('nome')
        if nome:
            query = query.filter(Tutor.nome.ilike(f'%{nome}%'))
        
        # Filter by CPF if provided
        cpf = request.args.get('cpf')
        if cpf:
            query = query.filter_by(cpf=cpf.replace('.', '').replace('-', ''))
        
        # Filter by active status
        ativo = request.args.get('ativo', 'true').lower() == 'true'
        query = query.filter_by(ativo=ativo)
        
        tutores = query.options(joinedload(Tutor.pets)).all()
        
        return jsonify({
            'success': True,
            'count': len(tutores),
            'data': [{
                'id': t.id_tutor,
                'nome': t.nome,
                'cpf': t.cpf,
                'telefone': t.telefone,
                'endereco': t.endereco,
                'login': t.login,
                'ativo': t.ativo,
                'pets_count': len(t.pets) if t.pets else 0,
                'pets': [{
                    'id': p.id_pet,
                    'nome': p.nome,
                    'especie': p.especie
                } for p in t.pets] if t.pets else []
            } for t in tutores]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar tutores: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@tutores_bp.route('/tutores/<int:tutor_id>', methods=['GET'])
@require_auth
def get_tutor(tutor_id, current_user):
    """Get specific tutor by ID"""
    try:
        tutor = Tutor.query.get(tutor_id)
        
        if not tutor:
            return jsonify({
                'success': False,
                'error': 'Tutor não encontrado',
                'code': 'TUTOR_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'id': tutor.id_tutor,
                'nome': tutor.nome,
                'cpf': tutor.cpf,
                'telefone': tutor.telefone,
                'endereco': tutor.endereco,
                'login': tutor.login,
                'ativo': tutor.ativo,
                'pets': [{
                    'id': p.id_pet,
                    'nome': p.nome,
                    'especie': p.especie
                } for p in tutor.pets] if tutor.pets else []
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter tutor: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@tutores_bp.route('/tutores', methods=['POST'])
@require_role('admin', 'atendente')
def create_tutor(current_user):
    """Create new tutor"""
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        # Validate required fields
        required_fields = ['nome', 'cpf']
        for field in required_fields:
            if field not in dados or not dados[field]:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório faltando: {field}',
                    'code': 'MISSING_REQUIRED_FIELD'
                }), 400
        
        # Check if CPF already exists
        cpf_clean = dados['cpf'].replace('.', '').replace('-', '')
        if Tutor.query.filter_by(cpf=cpf_clean).first():
            return jsonify({
                'success': False,
                'error': 'CPF já cadastrado',
                'code': 'CPF_ALREADY_EXISTS'
            }), 409
        
        # Create new tutor
        novo_tutor = Tutor(
            nome=dados.get('nome').strip(),
            cpf=cpf_clean,
            telefone=dados.get('telefone', '').strip(),
            endereco=dados.get('endereco', '').strip(),
            login=dados.get('login', '').strip() if dados.get('login') else None,
            senha_hash=None,  # Tutores podem não ter login
            ativo=dados.get('ativo', True)
        )
        
        db.session.add(novo_tutor)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tutor criado com sucesso',
            'data': {
                'id': novo_tutor.id_tutor,
                'nome': novo_tutor.nome,
                'cpf': novo_tutor.cpf,
                'telefone': novo_tutor.telefone,
                'endereco': novo_tutor.endereco,
                'ativo': novo_tutor.ativo
            }
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao criar tutor',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar tutor: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@tutores_bp.route('/tutores/<int:tutor_id>', methods=['PUT'])
@require_auth
def update_tutor(tutor_id, current_user):
    """Update existing tutor"""
    try:
        tutor = Tutor.query.get(tutor_id)
        
        if not tutor:
            return jsonify({
                'success': False,
                'error': 'Tutor não encontrado',
                'code': 'TUTOR_NOT_FOUND'
            }), 404
        
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        # Update fields if provided
        if 'nome' in dados:
            tutor.nome = dados['nome'].strip()
        if 'telefone' in dados:
            tutor.telefone = dados['telefone'].strip()
        if 'endereco' in dados:
            tutor.endereco = dados['endereco'].strip()
        if 'login' in dados:
            tutor.login = dados['login'].strip() if dados['login'] else None
        if 'ativo' in dados:
            tutor.ativo = dados['ativo']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tutor atualizado com sucesso',
            'data': {
                'id': tutor.id_tutor,
                'nome': tutor.nome,
                'cpf': tutor.cpf,
                'telefone': tutor.telefone,
                'endereco': tutor.endereco,
                'ativo': tutor.ativo
            }
        }), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao atualizar tutor',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar tutor: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@tutores_bp.route('/tutores/<int:tutor_id>', methods=['DELETE'])
@require_role('admin', 'atendente')
def delete_tutor(tutor_id, current_user):
    """Delete tutor (soft delete - mark as inactive)"""
    try:
        tutor = Tutor.query.get(tutor_id)
        
        if not tutor:
            return jsonify({
                'success': False,
                'error': 'Tutor não encontrado',
                'code': 'TUTOR_NOT_FOUND'
            }), 404
        
        # Soft delete - mark as inactive
        tutor.ativo = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tutor deletado com sucesso'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao deletar tutor: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500
