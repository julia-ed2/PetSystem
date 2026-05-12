# Alembic Migrations - PetSystem

This directory contains database migrations managed by Alembic.

## Structure

- **versions/**: Contains all migration files
- **env.py**: Alembic environment configuration
- **script.py.mako**: Template for new migration files

## Commands

### Create a new migration (auto-generated from models)
```bash
# From the petSystemPy directory
alembic revision --autogenerate -m "Description of changes"
```

### Create an empty migration
```bash
alembic revision -m "Description of changes"
```

### Apply all pending migrations
```bash
alembic upgrade head
```

### Apply specific revision
```bash
alembic upgrade <revision_id>
```

### Rollback last migration
```bash
alembic downgrade -1
```

### Rollback to specific revision
```bash
alembic downgrade <revision_id>
```

### View current revision
```bash
alembic current
```

### View migration history
```bash
alembic history
```

## Initial Setup - Phase 1

For Phase 1 (Infrastructure), migrations are NOT automatically generated.
Instead, we use SQL scripts:

1. **schema.sql** - Complete database schema (DDL)
2. **seed.sql** - Initial test data

### How to apply schema without Alembic (first time)

```bash
# Using MySQL CLI directly from Docker
docker exec -i petsystem-mysql mysql -uroot -pPETSYSTEM123 petsystem < petSystemPy/sql/schema.sql
docker exec -i petsystem-mysql mysql -uroot -pPETSYSTEM123 petsystem < petSystemPy/sql/seed.sql
```

### Or use Python

```bash
from app import create_app, db
app = create_app()
with app.app_context():
    # Read and execute schema
    with open('sql/schema.sql', 'r') as f:
        db.session.execute(f.read())
    db.session.commit()
```

## Notes

- Migrations are tracked in `alembic_version` table
- Each revision has unique ID (timestamp-based)
- Always test migrations in development first
- Keep migrations small and focused
- Write proper `upgrade()` and `downgrade()` functions

## Database Configuration

The `env.py` file reads database URL from:
- Environment variable: `SQLALCHEMY_DATABASE_URI`
- Default: `mysql+pymysql://root:petsystem123@localhost/petsystem`

This is configured in `.env` file in the Flask app root.
