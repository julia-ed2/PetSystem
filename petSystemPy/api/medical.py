from flask import Blueprint, jsonify, request
from auth import require_auth
from models import db, Pet, MedicalRecord, Vaccine, Appointment
from datetime import datetime
from sqlalchemy.exc import IntegrityError

medical_bp = Blueprint('medical', __name__)


@medical_bp.route('/pets/<int:pet_id>/records', methods=['GET'])
@require_auth
def listar_prontuarios(pet_id):
    """Listar todos os prontuários médicos de um pet"""
    try:
        pet = Pet.query.filter_by(id_pet=pet_id).first()
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        records = MedicalRecord.query.filter_by(id_pet=pet_id).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': r.id_prontuario,
                'pet_id': r.id_pet,
                'diagnosis': r.diagnostico,
                'treatment': r.tratamento,
                'notes': r.observacoes,
                'date': r.data_criacao.isoformat() if r.data_criacao else None,
                'veterinarian': r.id_veterinario
            } for r in records],
            'count': len(records)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar prontuários: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@medical_bp.route('/pets/<int:pet_id>/records', methods=['POST'])
@require_auth
def criar_prontuario(pet_id):
    """Criar novo prontuário médico para um pet"""
    try:
        pet = Pet.query.filter_by(id_pet=pet_id).first()
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['diagnosis', 'treatment']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório faltando: {field}',
                    'code': 'MISSING_REQUIRED_FIELD'
                }), 400
        
        # Criar novo prontuário
        new_record = MedicalRecord(
            id_pet=pet_id,
            diagnostico=data.get('diagnosis'),
            tratamento=data.get('treatment'),
            observacoes=data.get('notes', ''),
            data_criacao=datetime.now(),
            id_veterinario=data.get('veterinarian_id')
        )
        
        db.session.add(new_record)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Prontuário criado com sucesso',
            'data': {
                'id': new_record.id_prontuario,
                'pet_id': new_record.id_pet,
                'diagnosis': new_record.diagnostico,
                'treatment': new_record.tratamento,
                'notes': new_record.observacoes,
                'date': new_record.data_criacao.isoformat() if new_record.data_criacao else None
            }
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao criar prontuário',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar prontuário: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@medical_bp.route('/pets/<int:pet_id>/vaccines', methods=['GET'])
@require_auth
def listar_vacinas(pet_id):
    """Listar todos os registros de vacinação de um pet"""
    try:
        pet = Pet.query.filter_by(id_pet=pet_id).first()
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        # Buscar aplicações de vacinas pelo pet
        vaccines = db.session.query(Vaccine, Appointment).join(
            Appointment, Vaccine.id_vacina == Appointment.id_agendamento
        ).filter(Appointment.id_pet == pet_id).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': v.id_vacina,
                'name': v.nome_vacina,
                'date': v.data_aplicacao.isoformat() if v.data_aplicacao else None,
                'veterinarian': v.id_veterinario,
                'appointment_id': a.id_agendamento
            } for v, a in vaccines],
            'count': len(vaccines)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar vacinas: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@medical_bp.route('/pets/<int:pet_id>/vaccines', methods=['POST'])
@require_auth
def criar_vacina(pet_id):
    """Registrar aplicação de nova vacina para um pet"""
    try:
        pet = Pet.query.filter_by(id_pet=pet_id).first()
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['name', 'veterinarian_id']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório faltando: {field}',
                    'code': 'MISSING_REQUIRED_FIELD'
                }), 400
        
        # Registrar nova vacinação
        new_vaccine = Vaccine(
            id_pet=pet_id,
            nome_vacina=data.get('name'),
            data_aplicacao=datetime.now(),
            id_veterinario=data.get('veterinarian_id'),
            proxima_dose=data.get('next_dose_date')
        )
        
        db.session.add(new_vaccine)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Vacinação registrada com sucesso',
            'data': {
                'id': new_vaccine.id_vacina,
                'name': new_vaccine.nome_vacina,
                'date': new_vaccine.data_aplicacao.isoformat() if new_vaccine.data_aplicacao else None,
                'veterinarian_id': new_vaccine.id_veterinario,
                'next_dose_date': new_vaccine.proxima_dose.isoformat() if new_vaccine.proxima_dose else None
            }
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao registrar vacinação',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao registrar vacinação: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500
