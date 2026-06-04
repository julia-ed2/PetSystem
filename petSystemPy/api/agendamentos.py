from flask import Blueprint, request, jsonify
from models import db, Appointment, Pet, Veterinario
from auth import require_auth, require_role
from datetime import datetime, date, time as dt_time
from sqlalchemy.exc import IntegrityError

agendamentos_bp = Blueprint('agendamentos', __name__)


@agendamentos_bp.route('/agendamentos', methods=['GET'])
@require_auth
def list_agendamentos(current_user):
    """
    List all appointments.
    Optional query params: pet_id, veterinario_id, data_inicio, data_fim, status
    """
    try:
        query = Appointment.query
        
        # Filter by pet if provided
        pet_id = request.args.get('pet_id', type=int)
        if pet_id:
            query = query.filter_by(id_pet=pet_id)
        
        # Filter by veterinario if provided
        vet_id = request.args.get('veterinario_id', type=int)
        if vet_id:
            query = query.filter_by(id_veterinario=vet_id)
        
        # Filter by status if provided
        status = request.args.get('status')
        if status:
            query = query.filter_by(status=status)
        
        # Filter by date range if provided
        data_inicio = request.args.get('data_inicio')
        if data_inicio:
            try:
                data_inicio = datetime.fromisoformat(data_inicio).date()
                query = query.filter(Appointment.data >= data_inicio)
            except (ValueError, TypeError):
                pass

        data_fim = request.args.get('data_fim')
        if data_fim:
            try:
                data_fim = datetime.fromisoformat(data_fim).date()
                query = query.filter(Appointment.data <= data_fim)
            except (ValueError, TypeError):
                pass
        
        agendamentos = query.all()
        
        return jsonify({
            'success': True,
            'count': len(agendamentos),
            'data': [{
                'id': a.id_agendamento,
                'pet_id': a.id_pet,
                'pet_nome': a.pet.nome if a.pet else None,
                'tutor_id': a.pet.id_tutor if a.pet else None,
                'tutor_nome': a.pet.tutor.nome if a.pet and a.pet.tutor else None,
                'veterinario_id': a.id_veterinario,
                'veterinario_nome': a.veterinario_obj.nome if a.veterinario_obj else None,
                'tipo': a.tipo_agendamento,
                'data': a.data.isoformat() if a.data else None,
                'hora': a.hora.isoformat() if a.hora else None,
                'status': a.status,
                'observacoes': a.observacoes
            } for a in agendamentos]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar agendamentos: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@agendamentos_bp.route('/agendamentos/<int:agendamento_id>', methods=['GET'])
@require_auth
def get_agendamento(agendamento_id, current_user):
    """Get specific appointment by ID"""
    try:
        agendamento = Appointment.query.get(agendamento_id)
        
        if not agendamento:
            return jsonify({
                'success': False,
                'error': 'Agendamento não encontrado',
                'code': 'AGENDAMENTO_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'id': agendamento.id_agendamento,
                'pet_id': agendamento.id_pet,
                'pet_nome': agendamento.pet.nome if agendamento.pet else None,
                'tutor_id': agendamento.pet.id_tutor if agendamento.pet else None,
                'tutor_nome': agendamento.pet.tutor.nome if agendamento.pet and agendamento.pet.tutor else None,
                'veterinario_id': agendamento.id_veterinario,
                'veterinario_nome': agendamento.veterinario_obj.nome if agendamento.veterinario_obj else None,
                'tipo': agendamento.tipo_agendamento,
                'data': agendamento.data.isoformat() if agendamento.data else None,
                'hora': agendamento.hora.isoformat() if agendamento.hora else None,
                'status': agendamento.status,
                'observacoes': agendamento.observacoes
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao obter agendamento: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@agendamentos_bp.route('/agendamentos', methods=['POST'])
@require_role('admin', 'atendente', 'veterinario')
def create_agendamento(current_user):
    """Create new appointment"""
    try:
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        # Validate required fields
        required_fields = ['pet_id', 'veterinario_id', 'data', 'hora', 'tipo']
        for field in required_fields:
            if field not in dados or not dados[field]:
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório faltando: {field}',
                    'code': 'MISSING_REQUIRED_FIELD'
                }), 400
        
        # Verify pet exists
        pet = Pet.query.get(dados['pet_id'])
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        # Verify veterinario exists
        vet = Veterinario.query.get(dados['veterinario_id'])
        if not vet:
            return jsonify({
                'success': False,
                'error': 'Veterinário não encontrado',
                'code': 'VETERINARIO_NOT_FOUND'
            }), 404
        
        # Parse date and time
        try:
            data_agendamento = datetime.fromisoformat(dados['data']).date()
            hora_agendamento = dt_time.fromisoformat(dados['hora'])
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Formato de data/hora inválido. Use ISO 8601',
                'code': 'INVALID_DATE_FORMAT'
            }), 400
        
        # Create new appointment
        novo_agendamento = Appointment(
            id_pet=dados['pet_id'],
            id_veterinario=dados['veterinario_id'],
            tipo_agendamento=dados['tipo'].strip(),
            data=data_agendamento,
            hora=hora_agendamento,
            status=dados.get('status', 'agendado'),
            observacoes=dados.get('observacoes', '').strip()
        )
        
        db.session.add(novo_agendamento)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Agendamento criado com sucesso',
            'data': {
                'id': novo_agendamento.id_agendamento,
                'pet_id': novo_agendamento.id_pet,
                'veterinario_id': novo_agendamento.id_veterinario,
                'tipo': novo_agendamento.tipo_agendamento,
                'data': novo_agendamento.data.isoformat(),
                'hora': novo_agendamento.hora.isoformat(),
                'status': novo_agendamento.status
            }
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao criar agendamento',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar agendamento: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@agendamentos_bp.route('/agendamentos/<int:agendamento_id>', methods=['PUT'])
@require_role('admin', 'atendente', 'veterinario')
def update_agendamento(agendamento_id, current_user):
    """Update existing appointment"""
    try:
        agendamento = Appointment.query.get(agendamento_id)
        
        if not agendamento:
            return jsonify({
                'success': False,
                'error': 'Agendamento não encontrado',
                'code': 'AGENDAMENTO_NOT_FOUND'
            }), 404
        
        dados = request.get_json()
        
        if not dados:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado recebido',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        # Update fields if provided
        if 'tipo' in dados:
            agendamento.tipo_agendamento = dados['tipo'].strip()
        
        if 'data' in dados:
            try:
                agendamento.data = datetime.fromisoformat(dados['data']).date()
            except:
                return jsonify({
                    'success': False,
                    'error': 'Formato de data inválido',
                    'code': 'INVALID_DATE_FORMAT'
                }), 400
        
        if 'hora' in dados:
            try:
                agendamento.hora = dt_time.fromisoformat(dados['hora'])
            except (ValueError, TypeError):
                return jsonify({
                    'success': False,
                    'error': 'Formato de hora inválido',
                    'code': 'INVALID_TIME_FORMAT'
                }), 400
        
        if 'status' in dados:
            agendamento.status = dados['status'].strip()
        
        if 'observacoes' in dados:
            agendamento.observacoes = dados['observacoes'].strip()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Agendamento atualizado com sucesso',
            'data': {
                'id': agendamento.id_agendamento,
                'tipo': agendamento.tipo_agendamento,
                'data': agendamento.data.isoformat(),
                'hora': agendamento.hora.isoformat(),
                'status': agendamento.status,
                'observacoes': agendamento.observacoes
            }
        }), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro de integridade ao atualizar agendamento',
            'code': 'INTEGRITY_ERROR'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar agendamento: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@agendamentos_bp.route('/agendamentos/<int:agendamento_id>', methods=['DELETE'])
@require_role('admin', 'atendente')
def delete_agendamento(agendamento_id, current_user):
    """Cancel appointment"""
    try:
        agendamento = Appointment.query.get(agendamento_id)
        
        if not agendamento:
            return jsonify({
                'success': False,
                'error': 'Agendamento não encontrado',
                'code': 'AGENDAMENTO_NOT_FOUND'
            }), 404
        
        # Mark as cancelled instead of hard delete
        agendamento.status = 'cancelado'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Agendamento cancelado com sucesso'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao cancelar agendamento: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500
