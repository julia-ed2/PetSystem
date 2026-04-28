"""
Gunicorn configuration for production deployment.
Reference: https://docs.gunicorn.org/en/latest/settings.html
"""
import os
import multiprocessing

# Server socket
bind = '0.0.0.0:5000'
backlog = 2048

# Worker processes
workers = max(2, multiprocessing.cpu_count() * 2 - 1)
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Logging
accesslog = '-'  # Log to stdout
errorlog = '-'   # Log to stderr
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'petsystem-api'

# Server hooks (optional)
def on_starting(server):
    """Called just before the master process is initialized."""
    print('✓ Gunicorn starting...')

def on_exit(server):
    """Called just after the server exited."""
    print('✓ Gunicorn exited')

# Handle memory leaks
max_requests = 1000
max_requests_jitter = 50
