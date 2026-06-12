"""Add missing performance indexes

Revision ID: 002_perf_indexes
Revises: 001_initial
Create Date: 2026-06-05 00:00:00.000000

Adds indexes for columns that are frequently filtered but had no index:
- LANCAMENTO_FINANCEIRO.status  (status filter in listar_lancamentos)
- PRODUTO.ativo                  (WHERE ativo=TRUE in listar_produtos)
- PRODUTO.categoria              (filter/group by category)
"""
from alembic import op

revision = '002_perf_indexes'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade():
    for index_name, table, cols in [
        ('idx_lancamento_status', 'LANCAMENTO_FINANCEIRO', ['status']),
        ('idx_produto_ativo',     'PRODUTO',               ['ativo']),
        ('idx_produto_categoria', 'PRODUTO',               ['categoria']),
    ]:
        try:
            op.create_index(index_name, table, cols)
        except Exception:
            pass


def downgrade():
    for index_name, table in [
        ('idx_lancamento_status', 'LANCAMENTO_FINANCEIRO'),
        ('idx_produto_ativo',     'PRODUTO'),
        ('idx_produto_categoria', 'PRODUTO'),
    ]:
        try:
            op.drop_index(index_name, table_name=table)
        except Exception:
            pass
