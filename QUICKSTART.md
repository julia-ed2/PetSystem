# ⚡ Guia Rápido - PetSystem

## 🎯 Objetivo
Este guia ajuda você a rodar o PetSystem pela primeira vez em sua máquina.

---

## 📋 Pré-requisitos

### Verificar Instalações
```bash
# Verificar Node.js
node --version    # Deve ser v16 ou superior
npm --version     # Geralmente vem com Node.js

# Se não tiver Node.js, baixe em: https://nodejs.org/
```

---

## 🚀 Rodar o Frontend (React + Vite) em 3 Passos

### ✅ Passo 1: Entrar no Diretório
```bash
cd PetSystem/petSystemRe
```

### ✅ Passo 2: Instalar Dependências
```bash
npm install
```

**Se houver erro de dependências conflitantes:**
```bash
npm install --legacy-peer-deps
```

**Tempo esperado:** 1-2 minutos (depende da velocidade de internet)

### ✅ Passo 3: Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```

**Resultado esperado:**
```
  VITE v8.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 🌐 Abra no Navegador
- Copie a URL: **http://localhost:5173**
- Cole no navegador e pressione Enter
- Você verá a tela de login do PetSystem!

---

## 🧪 Testar o Sistema

### Dados de Teste (Mock)

A aplicação usa dados fake para testes. Para fazer login:

1. **Acesso Público** (Cadastro)
   - Vá para `/cadastro`
   - Crie uma nova conta

2. **Acesso de Teste** (Admin)
   - Email: qualquer um (não valida se backend não conectado)
   - Senha: qualquer uma

3. **Dados de Exemplo de Usuários**
   - Nome: "Julia Eduarda Fernandes Silva" (Cliente)
   - Nome: "Julia Eduarda" (Administrador)
   - Nome: "Sara Ferreira Rodrigues" (Cliente)

### Navegar nas Telas

Depois de "logar":

1. **Dashboard** - Página inicial com agendamentos
2. **Cadastros** - Gerenciar usuários e clientes
3. **Prontuários** - Registros médicos de animais
4. **Agenda** - Agendamentos de consultas/cirurgias
5. **Vacinação** - Controle de vacinação
6. **Estoque** - Placeholder (não implementado)
7. **Financeiro** - Placeholder (não implementado)

---

## 🛑 Parar o Servidor

Pressione no terminal:
```
CTRL + C
```

---

## 🔄 Outros Comandos Úteis

### Build para Produção
```bash
npm run build
```
Cria uma pasta `dist/` com a aplicação otimizada.

### Preview da Build de Produção
```bash
npm run preview
```
Mostra como a aplicação vai rodar em produção.

### Verificar Erros de Código
```bash
npm run lint
```
Encontra problemas de estilo e sintaxe.

---

## 🐛 Problemas Comuns

### ❌ "Cannot find module 'react'"
**Solução:**
```bash
npm install
```

### ❌ "Porta 5173 já em uso"
**Solução 1:** Parar aplicação anterior
```bash
CTRL + C  # No terminal que está rodando
```

**Solução 2:** Usar porta diferente
```bash
npm run dev -- --port 3000
```

### ❌ "Módulos não carregam corretamente"
**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules
npm cache clean --force
npm install
npm run dev
```

### ❌ CSS não está sendo aplicado
**Solução:**
- Verifique se `tailwind.config.js` existe
- Tente fazer `npm run build` depois `npm run preview`

---

## 📂 Estrutura Básica para Entender

```
petSystemRe/
├── src/
│   ├── pages/           ← As telas do sistema
│   │   ├── App.jsx      ← Veja as rotas aqui
│   │   ├── Login.jsx
│   │   ├── TelaPrincipal.jsx  (Dashboard)
│   │   ├── cadastros/
│   │   │   ├── Cadastros.jsx  (Listar usuários)
│   │   │   ├── CadastrarCliente.jsx
│   │   │   ├── CadastroUsuario.jsx
│   │   │   └── PerfilUsuario.jsx
│   │   ├── prontuario/
│   │   ├── agenda/
│   │   └── ...
│   ├── components/      ← Componentes reutilizáveis
│   └── main.jsx        ← Ponto de entrada
├── package.json         ← Dependências
└── README.md           ← Documentação completa
```

---

## 🎓 Próximos Passos

1. **Entender Rotas:**
   - Abra `src/pages/App.jsx`
   - Veja como as rotas são definidas

2. **Editar uma Página:**
   - Vá para `src/pages/`
   - Edite um arquivo `.jsx`
   - A página atualiza automaticamente no navegador (HMR - Hot Module Replacement)

3. **Ler Documentação Completa:**
   - Abra `petSystemRe/README.md`
   - Tem informações detalhadas sobre:
     - Todas as páginas implementadas
     - Tipos de acesso (Cliente, Usuário, Admin)
     - Como adicionar novas funcionalidades
     - Integração com API backend

4. **Explorar o Código:**
   - Cada componente tem comentários JSDoc
   - Props estão documentadas
   - Padrões de código são consistentes

---

## 🌐 Backend (Python/Flask)

Se quiser rodar o backend também:

```bash
# Em outro terminal
cd PetSystem/petSystemPy
pip install -r requirements.txt
python app.py
```

Backend roda em: **http://localhost:5000**

---

## 🎨 Interface Preview

### Login
![Após logar]
- Tela simples com email/senha
- Design moderno com Tailwind CSS

### Dashboard (Página Inicial)
- Resumo de agendamentos
- Cards informativos
- Sidebar com menu lateral

### Cadastros
- Tabela de usuários/clientes
- Botões: Cadastrar Cliente, Cadastrar Usuário (Admin)
- Filtros e busca avançada
- Clique em um usuário para ver perfil

### Perfil de Usuário
- Informações pessoais (Nome, CPF, Email, Telefone)
- Endereço completo
- Animais vinculados com cards clicáveis
- Botões de editar (Admin) e voltar

### Prontuários
- Lista de registros médicos de animais
- Clique para ver detalhes
- Opção de editar informações

---

## ✅ Checklist de Primeiro Acesso

- [ ] Node.js v16+ instalado
- [ ] Git clonado (`git clone ...`)
- [ ] `npm install` rodou sem erros
- [ ] `npm run dev` iniciou sem erros
- [ ] Navegador aberto em `http://localhost:5173`
- [ ] Página de login apareceu
- [ ] Clicou em "Cadastro" para criar conta de teste
- [ ] Conseguiu logar (com dados fake)
- [ ] Explorou o menu lateral (Cadastros, Prontuarios, Agenda, etc.)

---

## 📞 Dúvidas?

1. Consulte o `README.md` completo em `petSystemRe/README.md`
2. Verifique comentários no código
3. Abra o console do navegador (F12) para ver erros
4. Contacte o desenvolvedor responsável

---

## 🚀 Você está pronto!

Agora você pode:
- ✅ Visualizar todas as telas do PetSystem
- ✅ Entender a estrutura do projeto
- ✅ Fazer alterações e vê-las ao vivo
- ✅ Adicionar novas funcionalidades

**Bom desenvolvimento! 🎉**

---

**Última atualização**: 09 de maio de 2026  
**Versão**: 1.0.0
