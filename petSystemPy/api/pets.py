from flask import Blueprint, request, jsonify
from models import db, Pet, Tutor, MedicalRecord, Vaccine
from auth import require_auth, require_role
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

pets_bp = Blueprint('pets', __name__)


@pets_bp.route('/pets/summary', methods=['GET'])
@require_auth
def pets_summary(current_user):
    try:
        ativo = request.args.get('ativo', 'true').lower() == 'true'
        pets = Pet.query.options(joinedload(Pet.tutor)).filter_by(ativo=ativo).order_by(Pet.nome.asc()).all()

        # Aggregate queries: max date per pet — 2 queries instead of N
        mr_dates = dict(
            db.session.query(
                MedicalRecord.id_pet,
                func.max(MedicalRecord.data_abertura),
            ).group_by(MedicalRecord.id_pet).all()
        )
        vac_dates = dict(
            db.session.query(
                Vaccine.id_pet,
                func.max(Vaccine.data_aplicacao),
            ).group_by(Vaccine.id_pet).all()
        )

        data = []
        for p in pets:
            candidates = [d for d in (mr_dates.get(p.id_pet), vac_dates.get(p.id_pet)) if d is not None]
            last_visit = max(candidates).isoformat() if candidates else None
            data.append({
                'id': p.id_pet,
                'nome': p.nome,
                'especie': p.especie,
                'raca': p.raca,
                'tutor_id': p.id_tutor,
                'tutor_nome': p.tutor.nome if p.tutor else None,
                'idade': p.idade,
                'sexo': p.sexo,
                'ativo': p.ativo,
                'last_visit': last_visit,
            })

        return jsonify({'success': True, 'count': len(data), 'data': data}), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter resumo de pets: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@pets_bp.route('/pets', methods=['GET'])
@require_auth
def list_pets(current_user):
    """
    List all pets.
    Optional query params: tutor_id, especie, nome
    """
    try:
        query = Pet.query
        
        # Filter by tutor if provided
        tutor_id = request.args.get('tutor_id', type=int)
        if tutor_id:
            query = query.filter_by(id_tutor=tutor_id)
        
        # Filter by species if provided
        especie = request.args.get('especie')
        if especie:
            query = query.filter_by(especie=especie)
        
        # Filter by name if provided
        nome = request.args.get('nome')
        if nome:
            query = query.filter(Pet.nome.ilike(f'%{nome}%'))
        
        # Filter by active status
        ativo = request.args.get('ativo', 'true').lower() == 'true'
        query = query.filter_by(ativo=ativo)
        
        pets = query.options(joinedload(Pet.tutor)).all()
        
        return jsonify({
            'success': True,
            'count': len(pets),
            'data': [{
                'id': p.id_pet,
                'nome': p.nome,
                'especie': p.especie,
                'raca': p.raca,
                'tutor_id': p.id_tutor,
                'tutor_nome': p.tutor.nome if p.tutor else None,
                'idade': p.idade,
                'sexo': p.sexo,
                'peso': float(p.peso) if p.peso else None,
                'ativo': p.ativo
            } for p in pets]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar pets: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@pets_bp.route('/pets/<int:pet_id>', methods=['GET'])
@require_auth
def get_pet(pet_id, current_user):
    """Get specific pet by ID"""
    try:
        pet = Pet.query.get(pet_id)
        
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'id': pet.id_pet,
                'nome': pet.nome,
                'especie': pet.especie,
                'raca': pet.raca,
                'tutor_id': pet.id_tutor,
                'tutor_nome': pet.tutor.nome if pet.tutor else None,
                'idade': pet.idade,
                'sexo': pet.sexo,
                'peso': float(pet.peso) if pet.peso else None,
                'observacoes': pet.observacoes,
                'ativo': pet.ativo
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter pet: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@pets_bp.route('/pets', methods=['POST'])
@require_auth
def create_pet(current_user):
    """Create new pet"""
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        # Validate required fields
        required_fields = ['nome', 'especie', 'tutor_id']
        for field in required_fields:
            if field not in dados or not dados[field]:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório faltando: {field}',
                    'code': 'MISSING_REQUIRED_FIELD'
                }), 400
        
        # Verify tutor exists
        tutor = Tutor.query.get(dados['tutor_id'])
        if not tutor:
            return jsonify({
                'success': False,
                'error': 'Tutor não encontrado',
                'code': 'TUTOR_NOT_FOUND'
            }), 404
        
        # Create new pet
        novo_pet = Pet(
            nome=dados.get('nome').strip(),
            especie=dados.get('especie').strip(),
            raca=dados.get('raca', '').strip(),
            idade=dados.get('idade'),
            sexo=dados.get('sexo', '').strip(),
            peso=dados.get('peso'),
            observacoes=dados.get('observacoes', '').strip(),
            id_tutor=dados.get('tutor_id'),
            ativo=dados.get('ativo', True)
        )
        
        db.session.add(novo_pet)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pet criado com sucesso',
            'data': {
                'id': novo_pet.id_pet,
                'nome': novo_pet.nome,
                'especie': novo_pet.especie,
                'raca': novo_pet.raca,
                'tutor_id': novo_pet.id_tutor,
                'idade': novo_pet.idade,
                'sexo': novo_pet.sexo,
                'peso': float(novo_pet.peso) if novo_pet.peso else None
            }
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao criar pet',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar pet: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@pets_bp.route('/pets/<int:pet_id>', methods=['PUT'])
@require_auth
def update_pet(pet_id, current_user):
    """Update existing pet"""
    try:
        pet = Pet.query.get(pet_id)
        
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
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
            pet.nome = dados['nome'].strip()
        if 'especie' in dados:
            pet.especie = dados['especie'].strip()
        if 'raca' in dados:
            pet.raca = dados['raca'].strip()
        if 'idade' in dados:
            pet.idade = dados['idade']
        if 'sexo' in dados:
            pet.sexo = dados['sexo'].strip()
        if 'peso' in dados:
            pet.peso = dados['peso']
        if 'observacoes' in dados:
            pet.observacoes = dados['observacoes'].strip()
        if 'ativo' in dados:
            pet.ativo = dados['ativo']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pet atualizado com sucesso',
            'data': {
                'id': pet.id_pet,
                'nome': pet.nome,
                'especie': pet.especie,
                'raca': pet.raca,
                'idade': pet.idade,
                'sexo': pet.sexo,
                'peso': float(pet.peso) if pet.peso else None,
                'ativo': pet.ativo
            }
        }), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao atualizar pet',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar pet: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@pets_bp.route('/pets/<int:pet_id>', methods=['DELETE'])
@require_auth
def delete_pet(pet_id, current_user):
    """Delete pet (soft delete - mark as inactive)"""
    try:
        pet = Pet.query.get(pet_id)
        
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        # Soft delete - mark as inactive
        pet.ativo = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pet deletado com sucesso'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao deletar pet: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500
