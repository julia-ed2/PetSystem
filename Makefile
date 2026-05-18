.PHONY: run stop start-mysql start-backend start-frontend help

help:
	@echo "🐾 PetSystem - Comandos disponíveis:"
	@echo ""
	@echo "  make run              - Rodar sistema completo (MySQL + Backend + Frontend)"
	@echo "  make start-mysql      - Iniciar apenas MySQL"
	@echo "  make start-backend    - Iniciar apenas Backend (venv ativado)"
	@echo "  make start-frontend   - Iniciar apenas Frontend"
	@echo "  make stop             - Parar MySQL (docker compose)"
	@echo ""

run:
	@bash run.sh

start-mysql:
	@echo "📦 Iniciando MySQL..."
	docker compose up -d mysql
	@echo "✅ MySQL iniciado em localhost:3306"

start-backend:
	@echo "🔧 Iniciando Backend..."
	source .venv/bin/activate && cd petSystemPy && python app.py

start-frontend:
	@echo "⚡ Iniciando Frontend..."
	cd petSystemRe && npm run dev -- --host 0.0.0.0

stop:
	@echo "⏹️  Parando MySQL..."
	docker compose down
	@echo "✅ MySQL parado"
