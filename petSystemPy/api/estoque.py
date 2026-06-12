from datetime import datetime, date

from flask import Blueprint, jsonify, request
from sqlalchemy import extract
from sqlalchemy.exc import IntegrityError

from auth import require_auth, require_role
from models import (
    db,
    Produto,
    MovimentacaoEstoque,
    LancamentoFinanceiro,
    User,
    Tutor,
    Pet,
)
from sqlalchemy.orm import joinedload


estoque_bp = Blueprint('estoque', __name__)


def _parse_iso_or_br_date(value, default=None):
    if not value:
        return default
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()

    value = str(value).strip()
    for parser in (
        lambda v: datetime.fromisoformat(v).date(),
        lambda v: datetime.strptime(v, '%d/%m/%Y').date(),
    ):
        try:
            return parser(value)
        except Exception:
            continue
    return default


def _parse_decimal(value, default=0):
    try:
        return float(value)
    except Exception:
        return default


def _produto_payload(produto):
    payload = produto.to_dict()
    payload['quantidade'] = int(produto.quantidade_estoque or 0)
    payload['precoUnitario'] = float(produto.valor_unitario or 0)
    return payload


def _lancamento_payload(lancamento):
    payload = lancamento.to_dict()
    payload['tipo'] = 'gasto' if payload.get('tipo') == 'despesa' else payload.get('tipo')
    payload['data'] = datetime.fromisoformat(payload['data_lancamento']).strftime('%d/%m/%Y') if payload.get('data_lancamento') else None
    return payload


def _criar_lancamento_financeiro(*, tipo, categoria, descricao, valor, status='Pago', forma_pagamento='pix', id_tutor=None, id_pet=None, id_atendimento=None, id_servico=None):
    lancamento = LancamentoFinanceiro(
        id_tutor=id_tutor,
        id_pet=id_pet,
        id_atendimento=id_atendimento,
        id_servico=id_servico,
        tipo_lancamento=tipo,
        categoria=categoria,
        descricao=descricao,
        valor=valor,
        data_lancamento=date.today(),
        forma_pagamento=forma_pagamento,
        status=status,
    )
    db.session.add(lancamento)
    return lancamento


@estoque_bp.route('/produtos', methods=['GET'])
@require_auth
def listar_produtos(current_user):
    try:
        produtos = Produto.query.filter_by(ativo=True).order_by(Produto.nome.asc()).all()
        return jsonify({
            'success': True,
            'data': [_produto_payload(produto) for produto in produtos],
            'count': len(produtos),
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar produtos: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@estoque_bp.route('/produtos', methods=['POST'])
@require_role('admin', 'atendente', 'gerente')
def criar_produto(current_user):
    try:
        dados = request.get_json() or {}
        nome = (dados.get('nome') or '').strip()
        marca = (dados.get('marca') or '').strip() or None
        categoria = (dados.get('categoria') or 'Outro').strip() or 'Outro'
        descricao = (dados.get('descricao') or '').strip() or None
        quantidade = int(dados.get('quantidade') or dados.get('quantidade_estoque') or 0)
        preco = _parse_decimal(dados.get('precoUnitario') or dados.get('valor_unitario'), None)
        estoque_minimo = int(dados.get('estoque_minimo') or 0)

        if not nome:
            return jsonify({
                'success': False,
                'error': 'Nome do produto é obrigatório',
                'code': 'MISSING_REQUIRED_FIELD',
            }), 400

        if preco is None or preco < 0:
            return jsonify({
                'success': False,
                'error': 'Preço unitário inválido',
                'code': 'INVALID_VALUE',
            }), 400

        if quantidade <= 0:
            return jsonify({
                'success': False,
                'error': 'Quantidade inicial deve ser maior que zero',
                'code': 'INVALID_VALUE',
            }), 400

        produto = Produto(
            nome=nome,
            marca=marca,
            categoria=categoria,
            descricao=descricao,
            quantidade_estoque=quantidade,
            estoque_minimo=estoque_minimo,
            valor_unitario=preco,
            ativo=True,
        )
        db.session.add(produto)
        db.session.flush()

        movimentacao = MovimentacaoEstoque(
            id_produto=produto.id,
            id_usuario=current_user.id_usuario,
            tipo_movimentacao='entrada',
            quantidade=quantidade,
            data_hora=datetime.utcnow(),
            observacoes='Cadastro inicial do produto',
        )
        db.session.add(movimentacao)
        db.session.flush()

        _criar_lancamento_financeiro(
            tipo='despesa',
            categoria='Insumo',
            descricao=f'Entrada de estoque - {produto.nome}',
            valor=quantidade * preco,
            status='Pago',
            forma_pagamento='pix',
            id_tutor=None,
        )

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Produto cadastrado com sucesso',
            'data': _produto_payload(produto),
        }), 201
    except (ValueError, TypeError):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Dados numéricos inválidos',
            'code': 'INVALID_VALUE',
        }), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Produto já cadastrado ou dados inválidos',
            'code': 'INTEGRITY_ERROR',
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao cadastrar produto: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@estoque_bp.route('/produtos/<int:produto_id>', methods=['PATCH'])
@require_role('admin', 'gerente')
def atualizar_produto(current_user, produto_id):
    try:
        produto = Produto.query.get(produto_id)
        if not produto:
            return jsonify({'success': False, 'error': 'Produto não encontrado', 'code': 'NOT_FOUND'}), 404

        dados = request.get_json() or {}

        if 'nome' in dados:
            nome = (dados['nome'] or '').strip()
            if not nome:
                return jsonify({'success': False, 'error': 'Nome não pode ser vazio', 'code': 'INVALID_VALUE'}), 400
            produto.nome = nome
        if 'marca' in dados:
            produto.marca = (dados['marca'] or '').strip() or None
        if 'categoria' in dados:
            produto.categoria = (dados['categoria'] or 'Outro').strip() or 'Outro'
        if 'descricao' in dados:
            produto.descricao = (dados['descricao'] or '').strip() or None
        if 'estoque_minimo' in dados:
            produto.estoque_minimo = max(0, int(dados['estoque_minimo'] or 0))
        if 'precoUnitario' in dados or 'valor_unitario' in dados:
            novo_preco = _parse_decimal(dados.get('precoUnitario') or dados.get('valor_unitario'), None)
            if novo_preco is None or novo_preco < 0:
                return jsonify({'success': False, 'error': 'Preço inválido', 'code': 'INVALID_VALUE'}), 400
            produto.valor_unitario = novo_preco
        if 'ativo' in dados:
            produto.ativo = bool(dados['ativo'])

        db.session.commit()
        return jsonify({'success': True, 'data': _produto_payload(produto)}), 200
    except (ValueError, TypeError):
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Dados numéricos inválidos', 'code': 'INVALID_VALUE'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e), 'code': 'INTERNAL_ERROR'}), 500


@estoque_bp.route('/movimentacoes-estoque', methods=['GET'])
@require_auth
def listar_movimentacoes(current_user):
    try:
        query = MovimentacaoEstoque.query

        produto_id = request.args.get('produto_id', type=int)
        if produto_id:
            query = query.filter_by(id_produto=produto_id)

        tipo = request.args.get('tipo')
        if tipo:
            query = query.filter_by(tipo_movimentacao=tipo)

        movimentacoes = query.options(
            joinedload(MovimentacaoEstoque.produto),
            joinedload(MovimentacaoEstoque.usuario),
        ).order_by(MovimentacaoEstoque.data_hora.desc(), MovimentacaoEstoque.id_movimentacao.desc()).all()
        return jsonify({
            'success': True,
            'data': [mov.to_dict() for mov in movimentacoes],
            'count': len(movimentacoes),
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar movimentações: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@estoque_bp.route('/movimentacoes-estoque', methods=['POST'])
@require_role('admin', 'atendente', 'gerente')
def registrar_movimentacao(current_user):
    try:
        dados = request.get_json() or {}
        itens = dados.get('itens') or []
        cliente_id = dados.get('cliente_id')
        cliente = Tutor.query.get(cliente_id) if cliente_id else None
        forma_pagamento = (dados.get('forma_pagamento') or 'pix').strip()

        if not itens:
            return jsonify({
                'success': False,
                'error': 'Nenhum item informado',
                'code': 'MISSING_REQUIRED_FIELD',
            }), 400

        movimentacoes = []
        lancamentos = []

        for item in itens:
            produto_id = int(item.get('produtoId') or item.get('produto_id') or 0)
            quantidade = int(item.get('quantidade') or 0)
            if produto_id <= 0 or quantidade <= 0:
                return jsonify({
                    'success': False,
                    'error': 'Item inválido na saída',
                    'code': 'INVALID_VALUE',
                }), 400

            produto = Produto.query.get(produto_id)
            if not produto:
                return jsonify({
                    'success': False,
                    'error': f'Produto {produto_id} não encontrado',
                    'code': 'PRODUTO_NOT_FOUND',
                }), 404

            estoque_atual = int(produto.quantidade_estoque or 0)
            if quantidade > estoque_atual:
                return jsonify({
                    'success': False,
                    'error': f'Estoque insuficiente para {produto.nome}',
                    'code': 'INSUFFICIENT_STOCK',
                }), 400

            produto.quantidade_estoque = estoque_atual - quantidade

            movimentacao = MovimentacaoEstoque(
                id_produto=produto.id,
                id_usuario=current_user.id_usuario,
                tipo_movimentacao='saida',
                quantidade=quantidade,
                data_hora=datetime.utcnow(),
                observacoes=dados.get('observacoes') or (f'Saída para {cliente.nome}' if cliente else 'Saída de estoque'),
            )
            db.session.add(movimentacao)
            db.session.flush()
            movimentacoes.append(movimentacao)

            subtotal = quantidade * float(produto.valor_unitario or 0)
            lancamento = LancamentoFinanceiro(
                id_tutor=cliente.id_tutor if cliente else None,
                tipo_lancamento='receita',
                categoria='Outro',
                descricao=f'Saída de estoque - {produto.nome}',
                valor=subtotal,
                data_lancamento=date.today(),
                forma_pagamento=forma_pagamento,
                status='Pago',
            )
            db.session.add(lancamento)
            lancamentos.append(lancamento)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Saída registrada com sucesso',
            'data': {
                'movimentacoes': [mov.to_dict() for mov in movimentacoes],
                'lancamentos': [_lancamento_payload(lancamento) for lancamento in lancamentos],
                'produtos': [_produto_payload(item.produto) for item in movimentacoes],
            },
        }), 201
    except (ValueError, TypeError):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Dados numéricos inválidos',
            'code': 'INVALID_VALUE',
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao registrar movimentação: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@estoque_bp.route('/produtos/<int:produto_id>/relancar', methods=['POST'])
@require_role('admin', 'atendente', 'gerente')
def relancar_produto(current_user, produto_id):
    try:
        dados = request.get_json() or {}
        quantidade = int(dados.get('quantidade') or 0)
        novo_preco = _parse_decimal(dados.get('precoUnitario') or dados.get('valor_unitario'), None)
        observacoes = (dados.get('observacoes') or '').strip() or None

        if quantidade <= 0:
            return jsonify({
                'success': False,
                'error': 'Quantidade deve ser maior que zero',
                'code': 'INVALID_VALUE',
            }), 400

        produto = Produto.query.get(produto_id)
        if not produto:
            return jsonify({
                'success': False,
                'error': 'Produto não encontrado',
                'code': 'NOT_FOUND',
            }), 404

        if not produto.ativo:
            return jsonify({
                'success': False,
                'error': 'Produto inativo não pode ser relançado',
                'code': 'PRODUTO_INATIVO',
            }), 400

        if novo_preco is not None and novo_preco > 0:
            produto.valor_unitario = novo_preco

        produto.quantidade_estoque = int(produto.quantidade_estoque or 0) + quantidade

        movimentacao = MovimentacaoEstoque(
            id_produto=produto.id,
            id_usuario=current_user.id_usuario,
            tipo_movimentacao='entrada',
            quantidade=quantidade,
            data_hora=datetime.utcnow(),
            observacoes=observacoes or 'Relançamento de estoque',
        )
        db.session.add(movimentacao)
        db.session.flush()

        _criar_lancamento_financeiro(
            tipo='despesa',
            categoria='Insumo',
            descricao=f'Relançamento de estoque - {produto.nome}',
            valor=quantidade * float(produto.valor_unitario),
            status='Pago',
            forma_pagamento='pix',
        )

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Produto relançado com sucesso',
            'data': {
                'produto': _produto_payload(produto),
                'movimentacao': movimentacao.to_dict(),
            },
        }), 201
    except (ValueError, TypeError):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Dados numéricos inválidos',
            'code': 'INVALID_VALUE',
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao relançar produto: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@estoque_bp.route('/lancamentos-financeiros', methods=['GET'])
@require_auth
def listar_lancamentos(current_user):
    try:
        query = LancamentoFinanceiro.query

        tipo = request.args.get('tipo')
        if tipo:
            tipo_normalizado = 'despesa' if tipo == 'gasto' else tipo
            query = query.filter_by(tipo_lancamento=tipo_normalizado)

        status = request.args.get('status')
        if status:
            query = query.filter_by(status=status)

        mes = request.args.get('mes')
        if mes:
            try:
                mes_int = int(mes)
                query = query.filter(extract('month', LancamentoFinanceiro.data_lancamento) == mes_int)
            except Exception:
                pass

        ano = request.args.get('ano')
        if ano:
            try:
                query = query.filter(extract('year', LancamentoFinanceiro.data_lancamento) == int(ano))
            except Exception:
                pass

        lancamentos = query.options(
            joinedload(LancamentoFinanceiro.pet),
            joinedload(LancamentoFinanceiro.tutor),
        ).order_by(LancamentoFinanceiro.data_lancamento.desc(), LancamentoFinanceiro.id_lancamento.desc()).all()
        return jsonify({
            'success': True,
            'data': [_lancamento_payload(lancamento) for lancamento in lancamentos],
            'count': len(lancamentos),
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar lançamentos financeiros: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@estoque_bp.route('/lancamentos-financeiros', methods=['POST'])
@require_role('admin', 'atendente', 'gerente')
def criar_lancamento(current_user):
    try:
        dados = request.get_json() or {}
        descricao = (dados.get('descricao') or '').strip()
        categoria = (dados.get('categoria') or '').strip() or 'Outro'
        tipo = (dados.get('tipo') or 'receita').strip()
        tipo = 'despesa' if tipo == 'gasto' else tipo
        status = (dados.get('status') or 'Pago').strip() or 'Pago'
        forma_pagamento = (dados.get('forma_pagamento') or 'pix').strip()
        valor = _parse_decimal(dados.get('valor'), None)
        data_lancamento = _parse_iso_or_br_date(dados.get('data'), date.today())

        if not descricao:
            return jsonify({
                'success': False,
                'error': 'Descrição é obrigatória',
                'code': 'MISSING_REQUIRED_FIELD',
            }), 400

        if valor is None or valor <= 0:
            return jsonify({
                'success': False,
                'error': 'Valor inválido',
                'code': 'INVALID_VALUE',
            }), 400

        _VALID_TIPOS = {'receita', 'despesa', 'devolucao'}
        if tipo not in _VALID_TIPOS:
            return jsonify({
                'success': False,
                'error': f'Tipo inválido. Use: {", ".join(sorted(_VALID_TIPOS))}',
                'code': 'INVALID_VALUE',
            }), 400

        lancamento = LancamentoFinanceiro(
            id_pet=dados.get('pet_id'),
            id_tutor=dados.get('tutor_id'),
            id_atendimento=dados.get('atendimento_id'),
            id_servico=dados.get('servico_id'),
            tipo_lancamento=tipo,
            categoria=categoria,
            descricao=descricao,
            valor=valor,
            data_lancamento=data_lancamento,
            forma_pagamento=forma_pagamento,
            status=status,
        )

        db.session.add(lancamento)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Lançamento criado com sucesso',
            'data': _lancamento_payload(lancamento),
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao criar lançamento financeiro: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500


@estoque_bp.route('/lancamentos-financeiros/<int:lancamento_id>/status', methods=['PATCH'])
@require_role('admin', 'atendente', 'gerente')
def atualizar_status_lancamento(lancamento_id, current_user):
    try:
        dados = request.get_json() or {}
        status = (dados.get('status') or '').strip()
        _VALID_STATUS = {'Pago', 'Pendente', 'Cancelado'}
        if not status:
            return jsonify({
                'success': False,
                'error': 'Status é obrigatório',
                'code': 'MISSING_REQUIRED_FIELD',
            }), 400
        if status not in _VALID_STATUS:
            return jsonify({
                'success': False,
                'error': f'Status inválido. Use: {", ".join(sorted(_VALID_STATUS))}',
                'code': 'INVALID_VALUE',
            }), 400

        lancamento = LancamentoFinanceiro.query.get(lancamento_id)
        if not lancamento:
            return jsonify({
                'success': False,
                'error': 'Lançamento não encontrado',
                'code': 'LANCAMENTO_NOT_FOUND',
            }), 404

        lancamento.status = status
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Status atualizado com sucesso',
            'data': _lancamento_payload(lancamento),
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Erro ao atualizar status do lançamento: {str(e)}',
            'code': 'INTERNAL_ERROR',
        }), 500