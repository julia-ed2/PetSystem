## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

---

## Backend — petSystemPy (Flask)

### Comandos

```bash
# Instalar dependências
cd petSystemPy && pip install -r requirements.txt

# Rodar em desenvolvimento
FLASK_ENV=development python app.py

# Rodar em modo produção (mesmo que o Dockerfile)
gunicorn --config gunicorn_config.py wsgi:app

# Testes
pytest -q
pytest test_schema.py::test_sql_syntax -q

# Inicializar / validar banco
python init_db.py --no-confirm
python init_db.py --skip-seed --no-confirm
python init_db.py --validate

# Migrações Alembic
alembic current
alembic history
alembic revision --autogenerate -m "descrição"
alembic upgrade head
alembic downgrade -1
```

### Arquitetura

- **App factory:** `app.py:create_app()` — config, SQLAlchemy, Flask-Migrate, JWT, CORS, blueprints, handlers 404/500.
- **WSGI:** `wsgi.py` expõe o app para Gunicorn; Docker usa `flask run` em dev e `gunicorn ... wsgi:app` em prod.
- **Blueprints:**
  - `api/auth.py` → `/api/auth/*` (login, register, me, logout)
  - `api/pets.py`, `api/tutores.py`, `api/agendamentos.py`, `api/medical.py`, `api/estoque.py` → `/api/*`
- **Modelos:** `models.py` mapeia entidades para schema MySQL legado com tabelas em maiúsculas (`USUARIO`, `PET`, etc.) e propriedades via `sqlalchemy.orm.synonym`.
- **Auth:** `auth.py` centraliza hash de senha, criação de JWT, lookup de usuário e decoradores `@require_auth` / `@require_role`.
- **Bootstrap do banco:** `init_db.py` e `test_schema.py` operam diretamente sobre `../database/schema.sql` e `sql/seed.sql`.

### Convenções

- **Envelope de resposta:** JSON sempre com `success` + `data`/`message` ou `error`/`code`.
- **Soft-delete:** exclusões marcam `ativo=False` ou `status='cancelado'`, nunca hard delete.
- **Decoradores de auth:** endpoints com `@require_auth` ou `@require_role(...)` devem receber `current_user` na assinatura.
- **Schema legado:** manter nomes de tabelas/colunas em maiúsculas no DB; expor campos ergonômicos via `synonym`/properties nos modelos.
- **Normalização de host:** `config.py`, `init_db.py` e `test_schema.py` normalizam `DB_HOST=mysql` para `127.0.0.1` fora do Docker.
- **Roles fixas:** `admin`, `veterinario`, `atendente`, `gerente` — usadas em modelos, helpers de auth e decoradores de rota.

---

## Frontend — petSystemRe (React + Vite)

### Comandos

```bash
cd petSystemRe
npm install
npm run dev      # dev server em http://localhost:5173
npm run build
npm run preview
```

### Stack

- React 18, React Router v6, Tailwind CSS v4 (`@import "tailwindcss"` em `style.css`, sem config file).
- Layout: `<aside>` (Menu/Sidebar) + `<main>` (Outlet) dentro de um flex div.

### Impressão (CSS @media print)

- Classes utilitárias em `src/style.css`: `.print-only` (oculto na tela, exibido ao imprimir) e `.screen-only` (o inverso).
- `aside` e `.no-print` são ocultados automaticamente via `@media print`.
- Componentes de impressão (`ProntuarioPrint`, `FinanceiroPrint`) usam inline styles para garantir fidelidade de cores — não usar Tailwind nesses componentes.
- `print-color-adjust: exact` forçado globalmente para renderizar backgrounds coloridos.
## Rodar Sistema
``bash
    run.sh