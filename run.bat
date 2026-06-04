@echo off
setlocal EnableDelayedExpansion

set "ROOT_DIR=%~dp0"
set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo Iniciando PetSystem...
echo.

REM -- Modo --docker -------------------------------------------------------
set DOCKER_ONLY=0
for %%A in (%*) do if "%%A"=="--docker" set DOCKER_ONLY=1

if !DOCKER_ONLY! == 1 (
    echo [INFO] Modo Docker-only: subindo todos os servicos via Docker Compose...
    docker compose -f "%ROOT_DIR%\docker-compose.yml" build --no-cache backend
    docker compose -f "%ROOT_DIR%\docker-compose.yml" up --build
    exit /b %ERRORLEVEL%
)

REM -- Verificar Docker ----------------------------------------------------
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'docker' nao encontrado. Instale o Docker Desktop antes de executar este projeto.
    exit /b 1
)

echo [INFO] Verificando disponibilidade do Docker...
set docker_ready=0
for /l %%i in (1,1,30) do (
    if !docker_ready! == 0 (
        docker info >nul 2>&1
        if not errorlevel 1 (
            set docker_ready=1
        ) else (
            echo [INFO] Docker ainda nao esta pronto ^(tentativa %%i/30^)
            timeout /t 2 /nobreak >nul
        )
    )
)
if !docker_ready! == 0 (
    echo [ERROR] O daemon do Docker nao esta ativo. Abra o Docker Desktop e tente novamente.
    exit /b 1
)

REM -- Verificar Python ----------------------------------------------------
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'python' nao encontrado. Instale o Python 3.10+ em https://python.org
    exit /b 1
)
for /f "tokens=*" %%v in ('python -c "import sys; print(sys.version_info.major * 100 + sys.version_info.minor)" 2^>nul') do set PY_VER=%%v
if !PY_VER! LSS 310 (
    echo [ERROR] Python 3.10+ e necessario. Versao atual insuficiente.
    exit /b 1
)

REM -- Verificar Node ------------------------------------------------------
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 'npm' nao encontrado. Instale o Node.js 20+ em https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%v in ('node -e "process.stdout.write(String(process.version.match(/\d+/)[0]))" 2^>nul') do set NODE_VER=%%v
if !NODE_VER! LSS 20 (
    echo [ERROR] Node.js 20+ e necessario.
    exit /b 1
)

REM -- Copiar .env ---------------------------------------------------------
if not exist "%ROOT_DIR%\petSystemPy\.env" (
    if exist "%ROOT_DIR%\petSystemPy\.env.example" (
        echo [INFO] Copiando .env.example -^> .env
        copy "%ROOT_DIR%\petSystemPy\.env.example" "%ROOT_DIR%\petSystemPy\.env" >nul
    )
)

REM -- Criar virtualenv ----------------------------------------------------
if not exist "%ROOT_DIR%\.venv" (
    echo [INFO] Criando virtualenv...
    python -m venv "%ROOT_DIR%\.venv"
    if errorlevel 1 (
        echo [ERROR] Nao foi possivel criar a virtualenv.
        exit /b 1
    )
)

REM -- Instalar dependencias do backend ------------------------------------
if not exist "%ROOT_DIR%\.venv\.pet_system_backend_installed" (
    echo [INFO] Instalando dependencias do backend...
    "%ROOT_DIR%\.venv\Scripts\pip" install "Flask-JWT-Extended==4.4.4"
    if errorlevel 1 ( echo [ERROR] Falha ao instalar Flask-JWT-Extended & exit /b 1 )
    "%ROOT_DIR%\.venv\Scripts\pip" install -r "%ROOT_DIR%\petSystemPy\requirements.txt"
    if errorlevel 1 ( echo [ERROR] Falha ao instalar dependencias do backend & exit /b 1 )
    type nul > "%ROOT_DIR%\.venv\.pet_system_backend_installed"
    echo [OK] Dependencias do backend instaladas
)

REM -- Instalar dependencias do frontend -----------------------------------
if not exist "%ROOT_DIR%\petSystemRe\node_modules" (
    echo [INFO] Instalando dependencias do frontend...
    pushd "%ROOT_DIR%\petSystemRe"
    npm install --legacy-peer-deps
    if errorlevel 1 ( echo [ERROR] Falha ao instalar dependencias do frontend & popd & exit /b 1 )
    popd
    echo [OK] Dependencias do frontend instaladas
)

REM -- Liberar portas 5000 e 5173 ------------------------------------------
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    echo [INFO] Liberando porta 5000 ^(PID %%p^)...
    taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    echo [INFO] Liberando porta 5173 ^(PID %%p^)...
    taskkill /PID %%p /F >nul 2>&1
)

REM -- Iniciar MySQL -------------------------------------------------------
echo [INFO] Iniciando MySQL...
docker compose -f "%ROOT_DIR%\docker-compose.yml" up -d mysql
if errorlevel 1 (
    echo [ERROR] Nao foi possivel iniciar o MySQL. Verifique o Docker.
    exit /b 1
)

REM -- Aguardar MySQL ficar pronto -----------------------------------------
echo [INFO] Aguardando o MySQL ficar pronto...
set mysql_ready=0
for /l %%i in (1,1,30) do (
    if !mysql_ready! == 0 (
        for /f "tokens=*" %%s in ('docker inspect petsystem-mysql --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}" 2^>nul') do set HEALTH=%%s
        echo [INFO] MySQL status: !HEALTH! ^(tentativa %%i/30^)
        if "!HEALTH!" == "healthy" set mysql_ready=1
        if !mysql_ready! == 0 timeout /t 2 /nobreak >nul
    )
)
if !mysql_ready! == 0 (
    echo [ERROR] MySQL nao ficou pronto a tempo.
    exit /b 1
)
echo [OK] MySQL iniciado
echo.

REM -- Inicializar banco de dados ------------------------------------------
echo [INFO] Inicializando banco de dados...
"%ROOT_DIR%\.venv\Scripts\python" "%ROOT_DIR%\petSystemPy\init_db.py" --no-confirm --skip-seed
if errorlevel 1 (
    echo [ERROR] Falha ao inicializar o banco de dados.
    exit /b 1
)
echo [OK] Banco de dados inicializado
echo.

REM -- Criar usuario admin (via script Python temporario) ------------------
echo [INFO] Configurando usuario admin...
set "ADMIN_PY=%TEMP%\petsystem_setup_admin.py"
(
    echo import sys
    echo sys.path.insert^(0, r'%ROOT_DIR%\petSystemPy'^)
    echo from werkzeug.security import generate_password_hash
    echo import pymysql
    echo try:
    echo     conn = pymysql.connect^(host='127.0.0.1',port=3306,user='root',password='petsystem_dev',database='pet_system'^)
    echo     cur = conn.cursor^(^)
    echo     cur.execute^('SELECT id_usuario FROM USUARIO WHERE login=%%s',^('admin',^)^)
    echo     if not cur.fetchone^(^):
    echo         h = generate_password_hash^('admin123',method='pbkdf2:sha256'^)
    echo         cur.execute^('INSERT INTO USUARIO^(nome,login,senha_hash,tipo_usuario,ativo^) VALUES^(%%s,%%s,%%s,%%s,%%s^)',^('Admin','admin',h,'admin',1^)^)
    echo         conn.commit^(^)
    echo         print^('[OK] Usuario admin criado'^)
    echo     else:
    echo         print^('[OK] Usuario admin ja existe'^)
    echo     conn.close^(^)
    echo except Exception as e:
    echo     print^(f'[ERROR] {e}',file=sys.stderr^)
    echo     sys.exit^(1^)
) > "%ADMIN_PY%"
"%ROOT_DIR%\.venv\Scripts\python" "%ADMIN_PY%"
del "%ADMIN_PY%" >nul 2>&1
echo.

REM -- Iniciar Backend -----------------------------------------------------
echo [INFO] Iniciando Backend (Flask)...
start "PetSystem-Backend" /B cmd /c "cd /d "%ROOT_DIR%\petSystemPy" && "%ROOT_DIR%\.venv\Scripts\python" app.py > "%ROOT_DIR%\backend.log" 2>&1"
timeout /t 3 /nobreak >nul
echo [OK] Backend iniciado ^(log: backend.log^)
echo.

REM -- Iniciar Frontend ----------------------------------------------------
echo [INFO] Iniciando Frontend (Vite)...
start "PetSystem-Frontend" /B cmd /c "cd /d "%ROOT_DIR%\petSystemRe" && npm run dev -- --host 0.0.0.0 > "%ROOT_DIR%\frontend.log" 2>&1"
timeout /t 2 /nobreak >nul
echo [OK] Frontend iniciado ^(log: frontend.log^)
echo.

echo ====================================================
echo  PetSystem rodando com sucesso!
echo ====================================================
echo.
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:5000/api/health
echo  MySQL    : localhost:3306
echo.
echo  Login:
echo    Usuario: admin
echo    Senha:   admin123
echo.
echo  Para parar: feche esta janela e execute
echo    docker compose down
echo  Logs: backend.log / frontend.log
echo ====================================================
echo.
pause
endlocal
