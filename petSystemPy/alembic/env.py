"""Alembic environment configuration."""

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# this is the Alembic Config object, which provides
# the values of the alembic.ini file in use.
config = context.config

# Set SQLAlchemy URL from environment or build from individual vars
if 'SQLALCHEMY_DATABASE_URI' in os.environ:
    sqlalchemy_url = os.getenv('SQLALCHEMY_DATABASE_URI')
else:
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '3306')
    db_user = os.getenv('DB_USER', 'root')
    db_pass = os.getenv('DB_PASS', '')
    db_name = os.getenv('DB_NAME', 'pet_system')
    
    # Normalize host for alembic execution (from docker container perspective)
    if db_host == 'mysql':
        db_host = '127.0.0.1'
    
    sqlalchemy_url = f'mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'

config.set_main_option('sqlalchemy.url', sqlalchemy_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import db
target_metadata = db.Model.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        exclude_tables=['users', 'pets', 'tutores', 'prontuarios', 'vacinas', 'agendamentos'],
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = sqlalchemy_url
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=False,
            exclude_tables=['users', 'pets', 'tutores', 'prontuarios', 'vacinas', 'agendamentos'],
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
