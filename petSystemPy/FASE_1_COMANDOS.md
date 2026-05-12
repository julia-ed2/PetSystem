# 🚀 FASE 1 - Comandos Rápidos

**Status**: ✅ Infraestrutura preparada (banco ainda NÃO criado)

---

## 📦 Estrutura Criada

```
✅ sql/schema.sql              (380+ linhas, 27 tabelas)
✅ sql/seed.sql                (500+ linhas, dados de teste)
✅ alembic/                    (migrations framework)
✅ init_db.py                  (script inicialização)
✅ test_schema.py              (script validação)
✅ SCHEMA.md                   (documentação completa)
✅ FASE_1_INFRAESTRUTURA.md    (este documento)
```

---

## 🧪 Testar (SEM criar banco)

### 1️⃣ Validar Sintaxe SQL
```bash
cd /workspaces/PetSystem/petSystemPy
python test_schema.py --syntax-only
```

### 2️⃣ Testar Docker MySQL
```bash
python test_schema.py --docker-only
```

### 3️⃣ Teste Completo (cria e deleta banco de teste)
```bash
python test_schema.py
```

---

## 💾 Criar Banco (quando estiver pronto)

### 1️⃣ Opção: Inicializar Interativamente
```bash
python init_db.py
# Pergunta antes de executar
```

### 2️⃣ Opção: Script com confirmação automática
```bash
python init_db.py --no-confirm
```

### 3️⃣ Opção: Só schema (sem dados de teste)
```bash
python init_db.py --skip-seed --no-confirm
```

### 4️⃣ Opção: Reset total (PERIGOSO!)
```bash
python init_db.py --reset --no-confirm
# Deleta e recria tudo
```

### 5️⃣ Validar banco criado
```bash
python init_db.py --validate
```

---

## 🗄️ Acessar Banco Diretamente

### Via Docker
```bash
docker exec -it petsystem-mysql mysql -u root -p
# Senha: PETSYSTEM123
# Banco: petsystem
```

### Via MySQL CLI (se instalado localmente)
```bash
mysql -u root -p -h 127.0.0.1 -P 3306 petsystem
# Senha: PETSYSTEM123
```

### Via Python
```python
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='PETSYSTEM123',
    database='petsystem'
)
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM USUARIO")
print(cursor.fetchone())
```

---

## 🔧 Alembic (Migrations)

### Ver status
```bash
cd /workspaces/PetSystem/petSystemPy
alembic current
alembic history
```

### Criar nova migration (após implementar models)
```bash
alembic revision --autogenerate -m "Descrição das mudanças"
```

### Aplicar migrations
```bash
alembic upgrade head
```

### Reverter
```bash
alembic downgrade -1
```

---

## 📊 Verificações Úteis

### SQL - Contar linhas
```bash
wc -l sql/schema.sql
wc -l sql/seed.sql
```

### SQL - Ver tabelas
```bash
grep "CREATE TABLE" sql/schema.sql | wc -l
```

### SQL - Ver chaves estrangeiras
```bash
grep "FOREIGN KEY" sql/schema.sql | wc -l
```

### SQL - Ver índices
```bash
grep "INDEX" sql/schema.sql | wc -l
```

### SQL - Ver constraints
```bash
grep "CHECK" sql/schema.sql | wc -l
```

---

## ✅ Checklist Fase 1

- ✅ Docker MySQL configurado
- ✅ Schema SQL preparado (380+ linhas)
- ✅ Seed data preparado (500+ linhas)
- ✅ Alembic estruturado
- ✅ Scripts de teste criados
- ✅ Documentação completa

**Status**: Infraestrutura pronta, banco não foi criado

---

## 📝 Notas

1. **Banco ainda NÃO foi criado** - Conforme solicitação do usuário
2. **Todos os scripts estão prontos** - Para uso quando necessário
3. **Testes disponíveis** - Sem efeitos colaterais (criam/deletam banco de teste)
4. **Docker MySQL rodando** - Verificado e saudável

---

## 🔜 Próximo Passo

Quando quiser criar o banco:
```bash
cd /workspaces/PetSystem/petSystemPy
python init_db.py --no-confirm
```

Ou simplesmente:
```bash
python test_schema.py  # Valida tudo primeiro
python init_db.py      # Depois cria
```
