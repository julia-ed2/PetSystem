"""Initial schema - database already created by init_db.py

Revision ID: 001_initial
Revises: 
Create Date: 2026-05-12 04:05:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Database schema already initialized by init_db.py"""
    pass


def downgrade() -> None:
    """Do not downgrade initial schema"""
    pass
