"""Add cliente role to tipo_usuario enum

Revision ID: 003_cliente_role
Revises: 002_perf_indexes
Create Date: 2026-06-10 00:00:00.000000
"""
from alembic import op

revision = '003_cliente_role'
down_revision = '002_perf_indexes'
branch_labels = None
depends_on = None


def upgrade():
    try:
        op.execute(
            "ALTER TABLE USUARIO MODIFY COLUMN tipo_usuario "
            "ENUM('admin','veterinario','atendente','gerente','cliente') "
            "NOT NULL DEFAULT 'atendente'"
        )
    except Exception:
        pass


def downgrade():
    try:
        op.execute(
            "ALTER TABLE USUARIO MODIFY COLUMN tipo_usuario "
            "ENUM('admin','veterinario','atendente','gerente') "
            "NOT NULL DEFAULT 'atendente'"
        )
    except Exception:
        pass
