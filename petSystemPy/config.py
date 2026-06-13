import os
from datetime import timedelta

try:
    from sqlalchemy.pool import StaticPool
except ImportError:
    StaticPool = None

class Config:
    """Base configuration"""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)


def _build_db_uri(default_host='localhost', default_user='root', default_pass='petsystem_dev', default_db='pet_system'):
    """Build SQLAlchemy URI from DATABASE_URL or individual DB_* vars."""
    url = os.getenv('DATABASE_URL')
    if url:
        return url
    host = os.getenv('DB_HOST', default_host)
    if host == 'mysql':
        host = '127.0.0.1'
    return (
        f"mysql+pymysql://{os.getenv('DB_USER', default_user)}:"
        f"{os.getenv('DB_PASS', default_pass)}@"
        f"{host}:{os.getenv('DB_PORT', '3306')}/"
        f"{os.getenv('DB_NAME', default_db)}"
    )

# SSL options for TiDB Cloud Serverless (ignored when connecting to local MySQL)
_SSL_OPTS = {'connect_args': {'ssl': {'verify_cert': False, 'verify_identity': False}}}


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    FLASK_ENV = 'development'
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = _build_db_uri()
    SQLALCHEMY_ENGINE_OPTIONS = _SSL_OPTS


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    FLASK_ENV = 'production'
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = _build_db_uri(
        default_host='', default_user='', default_pass='', default_db=''
    )
    SQLALCHEMY_ENGINE_OPTIONS = {
        **_SSL_OPTS,
        'pool_size': 20,
        'max_overflow': 10,
        'pool_timeout': 10,
        'pool_recycle': 1800,
        'pool_pre_ping': True,
    }


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    FLASK_ENV = 'testing'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    # StaticPool: all connections share the same in-memory DB across threads/requests
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {'check_same_thread': False},
        'poolclass': StaticPool,
    }


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
