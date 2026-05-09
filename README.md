# 🐾 PetSystem - Frontend (React + Vite)

Sistema de gestão para clínicas veterinárias com interface moderna e intuitiva.

---

## 📑 Índice

1. [Instalação Rápida](#instalação-rápida)
2. [Como Rodar](#como-rodar)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Páginas Implementadas](#páginas-implementadas)
5. [Tipos de Acesso](#tipos-de-acesso)
6. [Rotas](#rotas)
7. [Componentes](#componentes)
8. [Troubleshooting](#troubleshooting)

---

## ⚡ Instalação Rápida

### Pré-requisitos
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** (geralmente vem com Node.js)

### 3 Passos para Começar

```bash
# 1️⃣ Entrar no diretório
cd petSystemRe

# 2️⃣ Instalar dependências
npm install

# 3️⃣ Rodar servidor de desenvolvimento
npm run dev
```

**Abra no navegador**: `http://localhost:5173`

---

## 🚀 Como Rodar

### Modo Desenvolvimento
```bash
npm run dev
```
HMR (Hot Module Replacement) habilitado - mudanças refletem instantaneamente.

### Build para Produção
```bash
npm run build
```
Cria pasta `dist/` otimizada.

### Preview da Build
```bash
npm run preview
```

### Verificar Erros
```bash
npm run lint
```

---

## 📂 Estrutura do Projeto

```
petSystemRe/
├── src/
│   ├── pages/                    # Páginas da aplicação
│   │   ├── App.jsx              # Router principal
│   │   ├── Login.jsx            # Página de login
│   │   ├── Cadastro.jsx         # Cadastro público
│   │   ├── TelaPrincipal.jsx    # Dashboard
│   │   ├── Vacinacao.jsx        # Vacinação
│   │   ├── cadastros/
│   │   │   ├── Cadastros.jsx
│   │   │   ├── CadastrarCliente.jsx
│   │   │   ├── CadastroUsuario.jsx
│   │   │   └── PerfilUsuario.jsx
│   │   ├── prontuario/
│   │   │   ├── Prontuario.jsx
│   │   │   ├── ProntuarioDetalhe.jsx
│   │   │   └── EditarPet.jsx
│   │   └── agenda/
│   │       ├── Agenda.jsx
│   │       └── FormAgenda.jsx
│   ├── components/               # Componentes reutilizáveis
│   │   ├── Menu.jsx             # Sidebar
│   │   ├── AnimalCard.jsx
│   │   ├── AppointmentCard.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── cadastros/
│   │       ├── Acoes.jsx
│   │       ├── Filtro.jsx
│   │       ├── AdicionarAnimal.jsx
│   │       └── CampoForm.jsx
│   ├── main.jsx                 # Ponto de entrada
│   └── style.css                # Estilos globais
├── public/                       # Assets estáticos
├── package.json                 # Dependências
└── README.md                    # Documentação completa
```

---

## 🎨 Páginas Implementadas

| Página | Rota | Status | Acesso |
|--------|------|--------|--------|
| Login | `/` | ✅ | Público |
| Cadastro | `/cadastro` | ✅ | Público |
| Dashboard | `/dashboard` | ✅ | Autenticado |
| Cadastros | `/dashboard/cadastros` | ✅ | Admin/Usuário |
| Novo Cliente | `/dashboard/cadastros/novo` | ✅ | Admin/Usuário |
| Novo Usuário | `/dashboard/cadastros/novo-usuario` | ✅ | Admin |
| Perfil Usuário | `/dashboard/cadastros/:id` | ✅ | Admin/Usuário |
| Prontuários | `/dashboard/prontuarios` | ✅ | Autenticado |
| Agenda | `/dashboard/agenda` | ✅ | Autenticado |
| Vacinação | `/dashboard/vacinacao` | ✅ | Autenticado |
| Estoque | `/dashboard/estoque` | ⏳ | Autenticado |
| Financeiro | `/dashboard/financeiro` | ⏳ | Autenticado |

---

## 📝 Tipos de Acesso

O sistema possui 3 tipos de acesso:

```javascript
CLIENTE         → Tutor de animal (pode ver prontuários e agendar)
USUÁRIO         → Colaborador da clínica (acesso a cadastros e agenda)
ADMINISTRADOR   → Gerenciador do sistema (controle total)
```

### Permissões

| Funcionalidade | Cliente | Usuário | Admin |
|---|---|---|---|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver Prontuários | ✅ | ✅ | ✅ |
| Editar Prontuários | ✅ | ✅ | ✅ |
| Gerenciar Cadastros | ❌ | ✅ | ✅ |
| Cadastrar Usuário | ❌ | ❌ | ✅ |
| Deletar Usuários | ❌ | ❌ | ✅ |

---

## 🛣️ Rotas Completas

### Públicas
```
GET  /              → Login
GET  /cadastro      → Cadastro Público
```

### Autenticadas
```
GET  /dashboard                          → Página Inicial
GET  /dashboard/cadastros                → Listar Usuários
GET  /dashboard/cadastros/novo           → Novo Cliente
GET  /dashboard/cadastros/novo-usuario   → Novo Usuário (Admin)
GET  /dashboard/cadastros/:id            → Perfil (Dinâmico)
GET  /dashboard/prontuarios              → Prontuários
GET  /dashboard/prontuarios/:id          → Detalhe Prontuário
GET  /dashboard/prontuarios/:id/editar   → Editar Prontuário
GET  /dashboard/agenda                   → Agenda
GET  /dashboard/form-agenda              → Novo Agendamento
GET  /dashboard/vacinacao                → Vacinação
GET  /dashboard/estoque                  → Estoque
GET  /dashboard/financeiro               → Financeiro
```

---

## 🧩 Componentes Principais

### Páginas
- `App.jsx` - Router principal
- `Login.jsx` - Autenticação
- `Cadastro.jsx` - Cadastro público
- `TelaPrincipal.jsx` - Dashboard
- `Cadastros.jsx` - Listar e gerenciar usuários
- `CadastrarCliente.jsx` - Novo cliente
- `CadastroUsuario.jsx` - Novo usuário (Admin)
- `PerfilUsuario.jsx` - Perfil dinâmico por usuário ID
- `Prontuario.jsx` - Listar prontuários
- `Agenda.jsx` - Agendamentos

### Componentes Reutilizáveis
- `Menu.jsx` - Sidebar de navegação
- `AnimalCard.jsx` - Card de animal
- `Button.jsx` - Botão customizado
- `Input.jsx` - Input customizado
- `Filtro.jsx` - Dropdown de filtro
- `Acoes.jsx` - Menu de ações

---

## 🎯 Funcionalidades Principais

### ✅ Gestão de Cadastros
- Listar usuários/clientes com tabela
- Filtro por tipo de acesso
- Busca por nome, CPF, email, telefone ou animal
- Cadastrar novo cliente com endereço automático (ViaCEP)
- Cadastrar novo usuário (Admin)
- Perfil dinâmico que carrega dados pelo ID da URL
- Editar e deletar usuários (com confirmação)

### ✅ Prontuários
- Visualizar prontuários de animais
- Ver histórico médico
- Editar informações do animal

### ✅ Agenda
- Visualizar agendamentos
- Agendar nova consulta/cirurgia
- Filtrar por tipo e data

### ✅ Interface
- Sidebar com menu navegável
- Badges coloridas por tipo de acesso
- Modals de confirmação
- Loading spinners
- Design responsivo com Tailwind CSS

---

## 🛠️ Stack Técnico

- **React 19.2.4** - Framework
- **Vite 8.0.4** - Build tool
- **React Router v6** - Roteamento
- **Tailwind CSS 4** - Estilização
- **Lucide React** - Ícones
- **Heroicons** - Ícones adicionais

---

## 🧪 Dados de Teste (Mock)

Usuários disponíveis para teste:
- **Julia Eduarda** (Cliente) - tem 3 animais
- **Sara Ferreira** (Cliente) - tem 2 animais
- **Julia Admin** (Administrador) - sem animais

Qualquer email/senha funciona para login (mock).

---

## 🐛 Troubleshooting

### "Cannot find module 'react'"
```bash
npm install
```

### Porta 5173 em uso
```bash
npm run dev -- --port 3000
```

### CSS não carrega
```bash
rm -rf node_modules
npm cache clean --force
npm install
npm run dev
```

### Módulos quebrados
```bash
npm run build  # Testa build
npm run preview  # Vê resultado
```

---

## 📚 Documentação Completa

Para documentação detalhada, consulte `petSystemRe/README.md`:
- ✅ Instalação passo a passo
- ✅ Explicação de cada página
- ✅ Como adicionar novas funcionalidades
- ✅ Padrões de código
- ✅ Integração com API

---

**Última atualização**: 09/05/2026  
**Versão**: 1.0.0  
**Status**: Funcional 