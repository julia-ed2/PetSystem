#!/bin/bash

echo "🚀 Iniciando PetSystem..."
echo ""

cd /workspaces/PetSystem

free_port() {
	local port="$1"
	local pids
	pids=$(lsof -t -i :"$port" -sTCP:LISTEN 2>/dev/null)

	if [[ -n "$pids" ]]; then
		echo "🧹 Liberando porta $port..."
		kill $pids 2>/dev/null || true
		sleep 1
	fi
}

free_port 5000
free_port 5173

echo "📦 Iniciando MySQL..."
docker compose up -d mysql
sleep 3

echo "✅ MySQL iniciado"
echo ""

echo "🔧 Iniciando Backend (Flask)..."
source .venv/bin/activate
cd petSystemPy
python app.py &
BACKEND_PID=$!
sleep 3

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
	echo "❌ Backend não iniciou corretamente"
	exit 1
fi

echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo ""

echo "⚡ Iniciando Frontend (Vite)..."
cd ../petSystemRe
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

sleep 2

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
	echo "❌ Frontend não iniciou corretamente"
	exit 1
fi

echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ PetSystem rodando com sucesso!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Frontend:  http://localhost:5173"
echo "📍 Backend:   http://localhost:5000/api/health"
echo "📍 MySQL:     localhost:3306"
echo ""
echo "🔐 Login:"
echo "   Usuario: admin"
echo "   Senha:   admin123"
echo ""
echo "Para parar o sistema, pressione CTRL+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

wait $FRONTEND_PID
