#!/bin/bash
set -e

echo "Iniciando PetSystem..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

cd "$ROOT_DIR"

require_command() {
	local command_name="$1"
	local install_hint="$2"

	if ! command -v "$command_name" >/dev/null 2>&1; then
		echo "[ERROR] '$command_name' nao encontrado. $install_hint"
		exit 1
	fi
}

require_command docker "Instale o Docker antes de executar este projeto."
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

if [[ ! -f "$ROOT_DIR/.venv/.pet_system_backend_installed" ]]; then
	echo "[INFO] Instalando dependencias do backend..."
	"$ROOT_DIR/.venv/bin/pip" install -r "$ROOT_DIR/petSystemPy/requirements.txt" || {
		echo "[ERROR] Falha ao instalar dependencias do backend"
		exit 1
	}
	touch "$ROOT_DIR/.venv/.pet_system_backend_installed"
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
	pids=$(lsof -t -i :"$port" -sTCP:LISTEN 2>/dev/null || echo "")

	if [[ -n "$pids" ]]; then
		echo "[INFO] Liberando porta $port..."
		kill $pids 2>/dev/null || true
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
sleep 3

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
import sys
import os

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
    
    # Verifica se admin existe
    cursor.execute('SELECT id_usuario FROM USUARIO WHERE login = %s', ('admin',))
    admin_exists = cursor.fetchone()
    
    if not admin_exists:
        # Cria novo admin
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
