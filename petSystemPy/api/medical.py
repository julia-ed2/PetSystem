from flask import Blueprint, jsonify, request
from auth import require_auth
from models import db, Pet, MedicalRecord, Vaccine, Appointment, Veterinario, Vacina
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text

medical_bp = Blueprint('medical', __name__)


def _format_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return value.isoformat() if hasattr(value, 'isoformat') else str(value)


def _add_history_item(items, *, item_id, tipo, date_value, veterinarian=None, descricao='', observacoes='', arquivo=None, proximo_reforco=None):
    items.append({
        'id': item_id,
        'tipo': tipo,
        'data': _format_datetime(date_value),
        'hora': date_value.time().isoformat(timespec='minutes') if isinstance(date_value, datetime) and date_value.time() else '',
        'veterinario': veterinarian or 'Sistema',
        'descricao': descricao or '',
        'observacoes': observacoes or '',
        'arquivo': arquivo,
        'proximoReforco': _format_datetime(proximo_reforco),
        '_sort': date_value or datetime.min,
    })


def _history_sort_key(item):
    sort_value = item.get('_sort')
    return sort_value or datetime.min


def _query_atendimentos(pet_id):
    rows = db.session.execute(
        text(
            """
            SELECT
                a.id_atendimento,
                a.data_hora,
                a.tipo_atendimento,
                a.status,
                a.queixa_principal,
                a.diagnostico,
                a.observacoes,
                v.nome AS veterinario
            FROM ATENDIMENTO a
            INNER JOIN VETERINARIO v ON v.id_veterinario = a.id_veterinario
            WHERE a.id_pet = :pet_id
            ORDER BY a.data_hora DESC
            """
        ),
        {'pet_id': pet_id}
    ).mappings().all()

    items = []
    for row in rows:
        detalhes = [part for part in [row['diagnostico'], row['observacoes']] if part]
        _add_history_item(
            items,
            item_id=f'atendimento-{row["id_atendimento"]}',
            tipo='Consulta',
            date_value=row['data_hora'],
            veterinarian=row['veterinario'],
            descricao=row['queixa_principal'] or 'Consulta registrada',
            observacoes=' | '.join(detalhes),
        )

    return items


def _query_vacinas(pet_id):
    rows = db.session.query(Vaccine, Appointment, Veterinario).outerjoin(
        Appointment, Vaccine.id_atendimento == Appointment.id_agendamento
    ).outerjoin(
        Veterinario, Appointment.id_veterinario == Veterinario.id_veterinario
    ).filter(
        Vaccine.id_pet == pet_id
    ).order_by(
        Vaccine.data_aplicacao.desc(),
        Vaccine.id_aplicacao_vacina.desc()
    ).all()

    items = []
    for vaccine, appointment, veterinario in rows:
        _add_history_item(
            items,
            item_id=f'vacina-{vaccine.id_vacina}',
            tipo='Vacinação',
            date_value=vaccine.data_aplicacao,
            veterinarian=veterinario.nome if veterinario else (appointment.veterinario if appointment else None),
            descricao=vaccine.nome_vacina or 'Vacina aplicada',
            observacoes=vaccine.observacao or '',
            proximo_reforco=vaccine.proxima_dose,
        )

    return items


def _query_exames(pet_id):
    rows = db.session.execute(
        text(
            """
            SELECT
                ae.id_atendimento_exame,
                ae.data_realizacao,
                ae.resultado,
                ae.observacoes,
                ex.nome AS exame_nome,
                a.data_hora AS atendimento_data,
                v.nome AS veterinario
            FROM ATENDIMENTO_EXAME ae
            INNER JOIN ATENDIMENTO a ON a.id_atendimento = ae.id_atendimento
            INNER JOIN EXAME ex ON ex.id_exame = ae.id_exame
            INNER JOIN VETERINARIO v ON v.id_veterinario = a.id_veterinario
            WHERE a.id_pet = :pet_id
            ORDER BY COALESCE(ae.data_realizacao, a.data_hora) DESC, ae.id_atendimento_exame DESC
            """
        ),
        {'pet_id': pet_id}
    ).mappings().all()

    items = []
    for row in rows:
        date_value = row['data_realizacao'] or row['atendimento_data']
        _add_history_item(
            items,
            item_id=f'exame-{row["id_atendimento_exame"]}',
            tipo='Exame',
            date_value=date_value,
            veterinarian=row['veterinario'],
            descricao=row['exame_nome'] or 'Exame realizado',
            observacoes=' | '.join([part for part in [row['resultado'], row['observacoes']] if part]),
        )

    return items


def _query_cirurgias(pet_id):
    rows = db.session.execute(
        text(
            """
            SELECT
                ap.id_atendimento_procedimento,
                a.data_hora,
                p.nome AS procedimento_nome,
                ap.observacoes,
                v.nome AS veterinario
            FROM ATENDIMENTO_PROCEDIMENTO ap
            INNER JOIN ATENDIMENTO a ON a.id_atendimento = ap.id_atendimento
            INNER JOIN PROCEDIMENTO p ON p.id_procedimento = ap.id_procedimento
            INNER JOIN VETERINARIO v ON v.id_veterinario = a.id_veterinario
            WHERE a.id_pet = :pet_id
            ORDER BY a.data_hora DESC, ap.id_atendimento_procedimento DESC
            """
        ),
        {'pet_id': pet_id}
    ).mappings().all()

    items = []
    for row in rows:
        procedimento = row['procedimento_nome'] or 'Procedimento'
        _add_history_item(
            items,
            item_id=f'cirurgia-{row["id_atendimento_procedimento"]}',
            tipo='Cirurgia',
            date_value=row['data_hora'],
            veterinarian=row['veterinario'],
            descricao=procedimento,
            observacoes=row['observacoes'] or '',
        )

    return items


@medical_bp.route('/pets/<int:pet_id>/records', methods=['GET'])
@require_auth
def listar_prontuarios(pet_id, current_user):
    """Listar todo o histórico clínico de um pet"""
    try:
        pet = Pet.query.filter_by(id_pet=pet_id).first()
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        historico = []
        for record in MedicalRecord.query.filter_by(id_pet=pet_id).all():
            _add_history_item(
                historico,
                item_id=f'prontuario-{record.id_prontuario}',
                tipo='Consulta',
                date_value=record.data_consulta or datetime.min,
                veterinarian='Sistema',
                descricao=record.diagnostico or 'Prontuário clínico',
                observacoes=record.observacao or '',
            )

        historico.extend(_query_atendimentos(pet_id))
        historico.extend(_query_vacinas(pet_id))
        historico.extend(_query_exames(pet_id))
        historico.extend(_query_cirurgias(pet_id))

        historico = sorted(historico, key=_history_sort_key, reverse=True)
        
        return jsonify({
            'success': True,
            'data': [
                {
                    key: value
                    for key, value in item.items()
                    if key != '_sort'
                }
                for item in historico
            ],
            'count': len(historico)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar prontuários: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@medical_bp.route('/pets/<int:pet_id>/records', methods=['POST'])
@require_auth
def criar_prontuario(pet_id, current_user):
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
            data_consulta=datetime.now().date(),
            diagnostico=data.get('diagnosis') or data.get('treatment') or data.get('notes') or '',
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
                'treatment': new_record.diagnostico,
                'notes': new_record.observacao,
                'date': new_record.data_consulta.isoformat() if new_record.data_consulta else None
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
def listar_vacinas(pet_id, current_user):
    """Listar todos os registros de vacinação de um pet"""
    try:
        pet = Pet.query.filter_by(id_pet=pet_id).first()
        if not pet:
            return jsonify({
                'success': False,
                'error': 'Pet não encontrado',
                'code': 'PET_NOT_FOUND'
            }), 404
        
        vaccines = Vaccine.query.filter_by(id_pet=pet_id).order_by(
            Vaccine.data_aplicacao.desc(),
            Vaccine.id_aplicacao_vacina.desc()
        ).all()

        resultados = []
        for vaccine in vaccines:
            appointment = Appointment.query.get(vaccine.id_atendimento) if vaccine.id_atendimento else None
            resultados.append({
                'id': vaccine.id,
                'pet_id': vaccine.pet_id,
                'vacina_id': vaccine.id_vacina,
                'vacina_nome': vaccine.nome_vacina,
                'data_aplicacao': vaccine.data_aplicacao.isoformat() if vaccine.data_aplicacao else None,
                'veterinario_id': appointment.id_veterinario if appointment else None,
                'veterinario_nome': appointment.veterinario if appointment else None,
                'next_dose_date': vaccine.proxima_dose.isoformat() if vaccine.proxima_dose else None,
                'lote': vaccine.lote,
                'observacoes': vaccine.observacao,
                'appointment_id': vaccine.id_atendimento,
            })
        
        return jsonify({
            'success': True,
            'data': resultados,
            'count': len(resultados)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar vacinas: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@medical_bp.route('/vacinas', methods=['GET'])
def listar_catalogo_vacinas():
    """Listar catálogo de vacinas disponíveis"""
    try:
        vacinas = Vacina.query.filter_by(ativa=True).order_by(Vacina.nome.asc()).all()
        data = []
        for v in vacinas:
            data.append({
                'id': v.id_vacina,
                'nome': v.nome,
                'fabricante': v.fabricante,
                'descricao': v.descricao,
                'intervalo_dias': v.intervalo_dias,
            })

        return jsonify({
            'success': True,
            'data': data,
            'count': len(data)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar catálogo de vacinas: {str(e)}',
            'code': 'INTERNAL_ERROR'
        }), 500


@medical_bp.route('/pets/<int:pet_id>/vaccines', methods=['POST'])
@require_auth
def criar_vacina(pet_id, current_user):
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
        
        # Validar campos obrigatórios: precisa de veterinário e vacina (por id ou nome)
        if not data.get('veterinarian_id'):
            return jsonify({
                'success': False,
                'error': 'Campo obrigatório faltando: veterinarian_id',
                'code': 'MISSING_REQUIRED_FIELD'
            }), 400

        # aceitar either vacina_id ou name
        vacina_catalogo = None
        if data.get('vacina_id'):
            try:
                vacina_catalogo = Vacina.query.get(int(data.get('vacina_id')))
            except Exception:
                vacina_catalogo = None
        elif data.get('name'):
            vacina_catalogo = Vacina.query.filter(
                db.func.lower(Vacina.nome) == str(data.get('name', '')).strip().lower()
            ).first()

        if not vacina_catalogo:
            return jsonify({
                'success': False,
                'error': 'Vacina não encontrada no catálogo',
                'code': 'VACINA_NOT_FOUND'
            }), 404

        veterinario = Veterinario.query.get(int(data.get('veterinarian_id')))
        if not veterinario:
            return jsonify({
                'success': False,
                'error': 'Veterinário não encontrado',
                'code': 'VETERINARIO_NOT_FOUND'
            }), 404

        def parse_date(value):
            if not value:
                return None
            if isinstance(value, datetime):
                return value.date()
            return datetime.fromisoformat(value).date()

        app_date = parse_date(data.get('appDate') or data.get('data_aplicacao')) or datetime.now().date()
        next_dose = parse_date(data.get('next_dose_date') or data.get('nextReinforcement') or data.get('data_proxima_dose'))
        
        # Registrar nova vacinação
        new_vaccine = Vaccine(
            id_pet=pet_id,
            id_vacina=vacina_catalogo.id_vacina,
            id_atendimento=data.get('appointment_id'),
            data_aplicacao=app_date,
            data_proxima_dose=next_dose,
            lote=data.get('batch') or data.get('lote'),
            observacoes=data.get('notes') or data.get('observacoes')
        )
        
        db.session.add(new_vaccine)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Vacinação registrada com sucesso',
            'data': {
                'id': new_vaccine.id_aplicacao_vacina,
                'pet_id': new_vaccine.id_pet,
                'vacina_id': new_vaccine.id_vacina,
                'name': new_vaccine.nome_vacina,
                'date': new_vaccine.data_aplicacao.isoformat() if new_vaccine.data_aplicacao else None,
                'veterinarian_id': veterinario.id_veterinario,
                'next_dose_date': new_vaccine.data_proxima_dose.isoformat() if new_vaccine.data_proxima_dose else None
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
