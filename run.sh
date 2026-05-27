#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

cd "$ROOT_DIR"

echo "Iniciando PetSystem..."
echo ""

# Parse args: support --docker to run full stack via Docker Compose only
DOCKER_ONLY=0
for arg in "$@"; do
	if [[ "$arg" == "--docker" ]]; then
		DOCKER_ONLY=1
		break
	fi
done

if [[ "$DOCKER_ONLY" -eq 1 ]]; then
	echo "[INFO] Modo Docker-only: subindo todos os serviços via Docker Compose..."
	docker compose -f "$ROOT_DIR/docker-compose.yml" build --no-cache backend
	docker compose -f "$ROOT_DIR/docker-compose.yml" up --build
	exit $?
fi

require_command() {
	local command_name="$1"
	local install_hint="$2"

	if ! command -v "$command_name" >/dev/null 2>&1; then
		echo "[ERROR] '$command_name' nao encontrado. $install_hint"
		exit 1
	fi
}

require_command docker "Instale o Docker antes de executar este projeto."

echo "[INFO] Verificando disponibilidade do Docker..."
docker_ready=0
for attempt in $(seq 1 30); do
	if docker info >/dev/null 2>&1; then
		docker_ready=1
		break
	fi
	echo "[INFO] Docker ainda nao esta pronto (tentativa $attempt/30)"
	sleep 2
done

if [[ "$docker_ready" -ne 1 ]]; then
	echo "[ERROR] O daemon do Docker nao esta ativo ou nao ficou acessivel a tempo."
	echo "[INFO] Abra o Docker Desktop, espere ele ficar pronto e rode novamente."
	exit 1
fi

# python/npm são necessários apenas no modo local (padrão). No modo --docker o compose cuida de tudo.
require_command python3 "Instale o Python 3 antes de executar este projeto." 
require_command npm "Instale o Node.js/npm antes de executar este projeto."

if [[ ! -f "$ROOT_DIR/petSystemPy/.env" && -f "$ROOT_DIR/petSystemPy/.env.example" ]]; then
	echo "[INFO] Copiando .env.example -> .env"
	cp "$ROOT_DIR/petSystemPy/.env.example" "$ROOT_DIR/petSystemPy/.env"
fi

if [[ ! -d "$ROOT_DIR/.venv" ]]; then
	echo "[INFO] Criando virtualenv..."
	python3 -m venv "$ROOT_DIR/.venv" || {
		echo "[ERROR] Nao foi possivel criar a virtualenv em $ROOT_DIR/.venv"
		exit 1
	}
fi

source "$ROOT_DIR/.venv/bin/activate"

ensure_backend_dependencies() {
	if "$ROOT_DIR/.venv/bin/python" -c "import flask_jwt_extended" >/dev/null 2>&1; then
		return 0
	fi

	echo "[INFO] Instalando dependencias do backend..."
	"$ROOT_DIR/.venv/bin/pip" install "Flask-JWT-Extended==4.4.4" || {
		echo "[ERROR] Falha ao instalar Flask-JWT-Extended"
		exit 1
	}
	"$ROOT_DIR/.venv/bin/pip" install -r "$ROOT_DIR/petSystemPy/requirements.txt" || {
		echo "[ERROR] Falha ao instalar dependencias do backend"
		exit 1
	}

	if ! "$ROOT_DIR/.venv/bin/python" -c "import flask_jwt_extended" >/dev/null 2>&1; then
		echo "[ERROR] Dependencia flask_jwt_extended continua ausente apos a instalacao"
		exit 1
	fi

	touch "$ROOT_DIR/.venv/.pet_system_backend_installed"
}

if [[ ! -f "$ROOT_DIR/.venv/.pet_system_backend_installed" ]]; then
	ensure_backend_dependencies
else
	if ! "$ROOT_DIR/.venv/bin/python" -c "import flask_jwt_extended" >/dev/null 2>&1; then
		ensure_backend_dependencies
	fi
fi

if [[ ! -d "$ROOT_DIR/petSystemRe/node_modules" ]]; then
	echo "[INFO] Instalando dependencias do frontend..."
	cd "$ROOT_DIR/petSystemRe"
	npm install --legacy-peer-deps || {
		echo "[ERROR] Falha ao instalar dependencias do frontend"
		exit 1
	}
	cd "$ROOT_DIR"
fi

free_port() {
	local port="$1"
	local pids
	pids=$(lsof -t -i :"$port" -sTCP:LISTEN 2>/dev/null || true)

	if [[ -n "$pids" ]]; then
		echo "[INFO] Liberando porta $port..."
		for pid in $pids; do
			local process_name
			process_name=$(ps -p "$pid" -o comm= 2>/dev/null || true)

			case "$process_name" in
				*Docker*|*docker*|*com.docker*|*vpnkit*|*hyperkit*|*qemu*|*lima*|*colima*)
					echo "[INFO] Ignorando processo do Docker/VM: PID $pid ($process_name)"
					continue
					;;
			esac

			kill "$pid" 2>/dev/null || true
		done
		sleep 1
	fi
}

free_port 5000
free_port 5173

echo "[INFO] Iniciando MySQL..."
if ! docker compose -f "$ROOT_DIR/docker-compose.yml" up -d mysql; then
	echo "[ERROR] Nao foi possivel iniciar o MySQL. Verifique se o Docker esta rodando."
	exit 1
fi

echo "[INFO] Aguardando o MySQL ficar pronto..."
mysql_ready=0
for attempt in $(seq 1 30); do
	container_health=$(docker inspect petsystem-mysql --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' 2>/dev/null || echo "unknown")
	echo "[INFO] MySQL status: $container_health (tentativa $attempt/30)"
	if [[ "$container_health" == "healthy" ]]; then
		mysql_ready=1
		break
	fi
	sleep 2
done

if [[ "$mysql_ready" -ne 1 ]]; then
	echo "[ERROR] MySQL nao ficou pronto a tempo. Verifique com: docker compose -f \"$ROOT_DIR/docker-compose.yml\" logs --tail=50 mysql"
	exit 1
fi

echo "[OK] MySQL iniciado"
echo ""

echo "[INFO] Inicializando banco de dados..."
if ! "$ROOT_DIR/.venv/bin/python" "$ROOT_DIR/petSystemPy/init_db.py" --no-confirm --skip-seed; then
	echo "[ERROR] Falha ao inicializar o banco de dados"
	exit 1
fi

echo "[OK] Banco de dados inicializado"
echo ""

echo "[INFO] Configurando usuario admin..."
ROOT_PY_DIR="$ROOT_DIR/petSystemPy" "$ROOT_DIR/.venv/bin/python" << 'PYTHON_EOF'
import os
import sys

sys.path.insert(0, os.environ['ROOT_PY_DIR'])

from werkzeug.security import generate_password_hash
import pymysql

try:
    conn = pymysql.connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='petsystem_dev',
        database='pet_system'
    )
    cursor = conn.cursor()

    cursor.execute('SELECT id_usuario FROM USUARIO WHERE login = %s', ('admin',))
    admin_exists = cursor.fetchone()

    if not admin_exists:
        senha_hash = generate_password_hash('admin123', method='pbkdf2:sha256')
        cursor.execute(
            'INSERT INTO USUARIO (nome, login, senha_hash, tipo_usuario, ativo) VALUES (%s, %s, %s, %s, %s)',
            ('Admin', 'admin', senha_hash, 'admin', 1)
        )
        conn.commit()
        print('[OK] Usuario admin criado com sucesso')
    else:
        print('[OK] Usuario admin ja existe')

    cursor.close()
    conn.close()
except Exception as e:
    print(f'[ERROR] Erro ao configurar usuario admin: {e}', file=sys.stderr)
    sys.exit(1)
PYTHON_EOF

echo ""

echo "[INFO] Iniciando Backend (Flask)..."
(
	cd "$ROOT_DIR/petSystemPy"
	"$ROOT_DIR/.venv/bin/python" app.py
) &
BACKEND_PID=$!
sleep 3

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
	echo "[ERROR] Backend nao iniciou corretamente"
	exit 1
fi

echo "[OK] Backend iniciado (PID: $BACKEND_PID)"
echo ""

echo "[INFO] Iniciando Frontend (Vite)..."
(
	cd "$ROOT_DIR/petSystemRe"
	npm run dev -- --host 0.0.0.0
) &
FRONTEND_PID=$!

sleep 2

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
	echo "[ERROR] Frontend nao iniciou corretamente"
	exit 1
fi

echo "[OK] Frontend iniciado (PID: $FRONTEND_PID)"
echo ""
echo "===================================================="
echo "PetSystem rodando com sucesso!"
echo "===================================================="
echo ""
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:5000/api/health"
echo "MySQL:     localhost:3306"
echo ""
echo "Login:"
echo "  Usuario: admin"
echo "  Senha:   admin123"
echo ""
echo "Para parar o sistema, pressione CTRL+C"
echo "===================================================="
echo ""

wait $FRONTEND_PID
