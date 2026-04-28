"""
WSGI entry point for production servers (gunicorn, etc).
This module provides the application instance for WSGI-compatible servers.
"""
import os
from app import create_app

app = create_app(os.getenv('FLASK_ENV', 'production'))

if __name__ == '__main__':
    app.run()
