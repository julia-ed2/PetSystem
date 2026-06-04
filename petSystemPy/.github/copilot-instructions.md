# Copilot Instructions for `petSystemPy`

## Build, test, and lint commands

### Environment setup
```bash
cd /workspaces/PetSystem/petSystemPy
pip install -r requirements.txt
```

### Run the API
```bash
# Development
FLASK_ENV=development python app.py

# Production-like (same entrypoint used by Dockerfile)
gunicorn --config gunicorn_config.py wsgi:app
```

### Test commands
```bash
# Full pytest discovery (currently includes test_schema.py functions)
pytest -q

# Run one specific pytest test
pytest test_schema.py::test_sql_syntax -q

# Script-based infra checks used in this repo
python test_schema.py --syntax-only
python test_schema.py --docker-only
python test_schema.py
```

### Database initialization / validation
```bash
python init_db.py --no-confirm
python init_db.py --skip-seed --no-confirm
python init_db.py --validate
```

### Alembic migrations
```bash
alembic current
alembic history
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
alembic downgrade -1
```

## High-level architecture

- **Flask app factory:** `app.py:create_app()` wires config, SQLAlchemy (`models.db`), Flask-Migrate, JWT, CORS, blueprint registration, and global 404/500 handlers.
- **WSGI/runtime split:** `wsgi.py` exposes the app for Gunicorn; Docker chooses `flask run` in development and `gunicorn ... wsgi:app` otherwise.
- **API surface by blueprint:**
  - `api/auth.py` (`/api/auth/*`) for login/register/me/logout.
  - `api/pets.py`, `api/tutores.py`, `api/agendamentos.py`, `api/medical.py` under `/api/*`.
- **Persistence layer:** `models.py` maps domain entities to a legacy MySQL schema with uppercase table names (`USUARIO`, `PET`, etc.) and many alias properties via `sqlalchemy.orm.synonym`.
- **Auth flow:** `auth.py` centralizes password hashing/checking, JWT token creation, user lookup from token identity, and decorators (`require_auth`, `require_role`) used by route modules.
- **DB bootstrap workflow:** `init_db.py` and `test_schema.py` operate directly on SQL scripts (`../database/schema.sql` and `sql/seed.sql`) for schema/seed validation and initialization, alongside Alembic for migration lifecycle.

## Key repository conventions

- **Response envelope convention:** Endpoints consistently return JSON with `success` plus either `data`/`message` or `error`/`code`.
- **Soft-delete behavior:** Deletions in API routes usually mark records inactive (`ativo=False`) or set status to `cancelado` instead of hard deletes.
- **Decorator contract:** Endpoints using `@require_auth` or `@require_role(...)` must accept `current_user` in the function signature because decorators inject it.
- **Legacy schema compatibility:** Keep DB-facing names aligned with existing uppercase schema/columns, then expose ergonomic API fields using `synonym`/properties in models.
- **Environment host normalization:** `config.py`, `init_db.py`, and `test_schema.py` normalize `DB_HOST=mysql` to `127.0.0.1` when running outside Docker, so local and container workflows stay compatible.
- **Role names are fixed:** Access control relies on exact strings (`admin`, `veterinario`, `atendente`, `gerente`) across models, auth helpers, and route decorators.
