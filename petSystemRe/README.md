# 🐾 PetSystem - Frontend (React + Vite)

## 📋 Visão Geral

O **PetSystem** é um sistema de gestão completo para clínicas veterinárias, desenvolvido com **React 19** e **Vite**. Esta documentação refere-se ao frontend do projeto, responsável pela interface de usuário.

### Funcionalidades Implementadas:
- ✅ Autenticação e login
- ✅ Cadastro de clientes e usuários (Admin)
- ✅ Perfil de usuário com visualização dinâmica
- ✅ Prontuários de animais (listar, visualizar, editar)
- ✅ Agenda de agendamentos
- ✅ Vacinação
- ✅ Sidebar com navegação
- ✅ Filtros e busca de usuários
- ✅ Modal de confirmação de exclusão

---

## 🚀 Guia de Instalação

### Pré-requisitos
- **Node.js** v16 ou superior ([Download](https://nodejs.org/))
- **npm** (geralmente instalado junto com Node.js)

### Passos para Instalação

#### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/petSystem.git
cd PetSystem/petSystemRe
```

#### 2. Instalar Dependências
```bash
npm install
```

Se houver problemas de dependências conflitantes, use:
```bash
npm install --legacy-peer-deps
```

#### 3. Verificar a Instalação
```bash
npm --version
node --version
```

---

## 🏃 Como Rodar o Projeto

### Modo Desenvolvimento (Com Hot Module Replacement)
```bash
npm run dev
```

Após executar, você verá:
```
  VITE v8.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Abra **http://localhost:5173** no seu navegador.

### Build para Produção
```bash
npm run build
```

Cria uma build otimizada na pasta `dist/`.

### Preview da Build de Produção
```bash
npm run preview
```

### Verificar Erros de Linting
```bash
npm run lint
```

---

## 📂 Estrutura do Projeto

```
petSystemRe/
├── public/                          # Assets estáticos
├── src/
│   ├── assets/                      # Imagens, documentação
│   │   └── RequisitosPI.md
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── AnimalCard.jsx          # Card de animal
│   │   ├── AppointmentCard.jsx     # Card de agendamento
│   │   ├── Button.jsx               # Botão customizado
│   │   ├── Input.jsx                # Input customizado
│   │   ├── Menu.jsx                 # Sidebar de navegação
│   │   ├── PlaceholderPage.jsx     # Página placeholder
│   │   ├── Titulos.jsx              # Componente de título
│   │   ├── cadastros/
│   │   │   ├── Acoes.jsx            # Dropdown de ações
│   │   │   ├── AdicionarAnimal.jsx # Modal de adicionar animal
│   │   │   ├── CampoForm.jsx        # Campo de formulário
│   │   │   └── Filtro.jsx           # Dropdown de filtro
│   │   └── prontuario/
│   │       ├── EditarPet.jsx        # Edição de animal
│   │       ├── HistoricoCard.jsx   # Card de histórico
│   │       ├── NovoRegistro.jsx    # Novo registro
│   │       └── ProntuarioCard.jsx   # Card de prontuário
│   ├── pages/                       # Páginas/telas
│   │   ├── App.jsx                  # Router principal
│   │   ├── Cadastro.jsx             # Página de cadastro
│   │   ├── Login.jsx                # Página de login
│   │   ├── TelaPrincipal.jsx        # Dashboard/Home
│   │   ├── Vacinacao.jsx            # Página de vacinação
│   │   ├── agenda/
│   │   │   ├── Agenda.jsx           # Visualizar agenda
│   │   │   └── FormAgenda.jsx       # Formulário de novo agendamento
│   │   ├── cadastros/
│   │   │   ├── CadastrarCliente.jsx     # Cadastrar cliente/tutor
│   │   │   ├── CadastroUsuario.jsx      # Cadastrar usuário (Admin)
│   │   │   ├── Cadastros.jsx            # Listar usuários/clientes
│   │   │   └── PerfilUsuario.jsx        # Perfil dinâmico do usuário
│   │   └── prontuario/
│   │       ├── Prontuario.jsx           # Listar prontuários
│   │       ├── ProntuarioDetalhe.jsx    # Detalhe de prontuário
│   │       └── EditarPet.jsx            # Editar animal
│   ├── main.jsx                     # Ponto de entrada
│   └── style.css                    # Estilos globais
├── index.html                       # HTML base
├── package.json                     # Dependências
├── vite.config.js                   # Configuração do Vite
├── tailwind.config.js               # Configuração do Tailwind
└── eslint.config.js                 # Configuração do ESLint
```

---

## 🎨 Páginas Implementadas

### 1. **Autenticação**
- **Rota**: `/` (Login)
- **Componente**: `Login.jsx`
- **Função**: Tela de login com email/senha
- **Acesso**: Público (sem autenticação)

### 2. **Cadastro de Novo Usuário** (Público)
- **Rota**: `/cadastro`
- **Componente**: `Cadastro.jsx`
- **Função**: Tela para novos usuários criarem conta
- **Acesso**: Público (sem autenticação)

### 3. **Dashboard - Página Inicial**
- **Rota**: `/dashboard`
- **Componente**: `TelaPrincipal.jsx`
- **Função**: Resumo geral do sistema com agendamentos
- **Acesso**: Autenticado (qualquer tipo de acesso)

### 4. **Cadastros de Usuários/Clientes**
- **Rota**: `/dashboard/cadastros`
- **Componente**: `Cadastros.jsx`
- **Função**: Lista todos os usuários com filtros e busca
- **Recursos**:
  - Listar usuários cadastrados
  - Filtrar por tipo de acesso
  - Buscar por nome, CPF, celular, email ou animal
  - Ver perfil de usuário (clicando no nome)
  - Editar e excluir usuários (Admin)
- **Acesso**: Admin ou Usuário

#### 4.1 **Cadastrar Cliente**
- **Rota**: `/dashboard/cadastros/novo`
- **Componente**: `CadastrarCliente.jsx`
- **Função**: Formulário para cadastrar novo cliente/tutor
- **Campos**:
  - Nome (obrigatório)
  - CPF (obrigatório)
  - Celular (obrigatório)
  - Email
  - Data de nascimento
  - Gênero
  - Endereço (com busca automática por CEP)
  - Animais (adicionar múltiplos)
- **Acesso**: Admin ou Usuário
- **Navegação**: Botão "Voltar" / "Cancelar" na interface

#### 4.2 **Cadastrar Usuário** (Admin)
- **Rota**: `/dashboard/cadastros/novo-usuario`
- **Componente**: `CadastroUsuario.jsx`
- **Função**: Formulário para cadastrar novo colaborador/usuário
- **Campos**:
  - Nome (obrigatório)
  - CPF (obrigatório)
  - Celular (obrigatório)
  - Email (obrigatório)
  - Data de nascimento
  - Gênero
  - Senha (obrigatório, mín. 8 caracteres)
  - Confirmar senha
  - Tipo de acesso (Usuário ou Administrador)
- **Acesso**: Admin apenas
- **Navegação**: Botão "Voltar" / "Cancelar" na interface

#### 4.3 **Perfil de Usuário**
- **Rota**: `/dashboard/cadastros/:id`
- **Componente**: `PerfilUsuario.jsx`
- **Função**: Visualizar perfil completo de um usuário
- **Dados Exibidos**:
  - Informações pessoais (Nome, CPF, Data nasc., Celular, Gênero, Email)
  - Tipo de acesso (com badge colorida)
  - Endereço completo
  - Animais vinculados (com cards clicáveis)
- **Dinâmico**: Carrega dados conforme o `usuarioId` da URL
- **Acesso**: Admin ou Usuário

### 5. **Prontuários**
- **Rota**: `/dashboard/prontuarios`
- **Componente**: `Prontuario.jsx`
- **Função**: Lista todos os prontuários de animais
- **Acesso**: Autenticado

#### 5.1 **Detalhe de Prontuário**
- **Rota**: `/dashboard/prontuarios/:id`
- **Componente**: `ProntuarioDetalhe.jsx`
- **Função**: Visualizar prontuário completo de um animal
- **Acesso**: Autenticado

#### 5.2 **Editar Prontuário**
- **Rota**: `/dashboard/prontuarios/:id/editar`
- **Componente**: `EditarPet.jsx`
- **Função**: Editar informações de um animal
- **Acesso**: Autenticado

### 6. **Agenda**
- **Rota**: `/dashboard/agenda`
- **Componente**: `Agenda.jsx`
- **Função**: Visualizar agendamentos
- **Acesso**: Autenticado

#### 6.1 **Novo Agendamento**
- **Rota**: `/dashboard/form-agenda`
- **Componente**: `FormAgenda.jsx`
- **Função**: Formulário para agendar nova consulta
- **Acesso**: Autenticado

### 7. **Vacinação**
- **Rota**: `/dashboard/vacinacao`
- **Componente**: `Vacinacao.jsx`
- **Função**: Gerenciar vacinação de animais
- **Acesso**: Autenticado

### 8. **Estoque** (Placeholder)
- **Rota**: `/dashboard/estoque`
- **Função**: Página placeholder para gerenciar estoque
- **Acesso**: Autenticado
- **Status**: A implementar

### 9. **Financeiro** (Placeholder)
- **Rota**: `/dashboard/financeiro`
- **Função**: Página placeholder para relatórios financeiros
- **Acesso**: Autenticado
- **Status**: A implementar

---

## 📝 Tipos de Acesso

O sistema possui 3 tipos de acesso definidos em `src/pages/cadastros/Cadastros.jsx`:

```javascript
export const TIPOS_ACESSO = {
  CLIENTE: "Cliente",           // Tutor de animal
  USUARIO: "Usuário",           // Colaborador (veterinário, assistente)
  ADMINISTRADOR: "Administrador" // Gerenciador do sistema
};
```

### Permissões por Tipo:

| Recurso | Cliente | Usuário | Administrador |
|---------|---------|---------|---------------|
| Dashboard | ✅ | ✅ | ✅ |
| Ver Prontuários | ✅ | ✅ | ✅ |
| Editar Prontuários | ✅ | ✅ | ✅ |
| Agenda | ❌ | ✅ | ✅ |
| Novo Agendamento | ❌ | ✅ | ✅ |
| Ver Cadastros | ❌ | ✅ | ✅ |
| Cadastrar Cliente | ❌ | ✅ | ✅ |
| Cadastrar Usuário | ❌ | ❌ | ✅ |
| Editar Usuário | ❌ | ❌ | ✅ |
| Deletar Usuário | ❌ | ❌ | ✅ |

---

## 🛣️ Mapa de Rotas Completo

### Rotas Públicas
```
GET  /              → Página de Login
GET  /cadastro      → Formulário de Cadastro Público
```

### Rotas Autenticadas (Dashboard)
```
GET  /dashboard                     → Página Inicial
GET  /dashboard/agenda              → Agenda de Agendamentos
GET  /dashboard/form-agenda         → Novo Agendamento
GET  /dashboard/vacinacao           → Vacinação de Animais
GET  /dashboard/prontuarios         → Lista de Prontuários
GET  /dashboard/prontuarios/:id     → Detalhe de Prontuário
GET  /dashboard/prontuarios/:id/editar → Editar Prontuário
GET  /dashboard/cadastros           → Lista de Usuários
GET  /dashboard/cadastros/novo      → Cadastrar Cliente
GET  /dashboard/cadastros/novo-usuario → Cadastrar Usuário (Admin)
GET  /dashboard/cadastros/:id       → Perfil de Usuário
GET  /dashboard/estoque             → Estoque (Placeholder)
GET  /dashboard/financeiro          → Financeiro (Placeholder)
```

---

## 🔗 Navegação Entre Páginas

A navegação é feita via `react-router-dom`. Exemplo:

```javascript
import { useNavigate } from 'react-router-dom';

function MinhaComponente() {
  const navigate = useNavigate();

  const irParaCadastros = () => {
    navigate('/dashboard/cadastros');
  };

  const irParaPerfil = (usuarioId) => {
    navigate(`/dashboard/cadastros/${usuarioId}`);
  };

  return (
    <button onClick={irParaCadastros}>Ir para Cadastros</button>
  );
}
```

---

## 🎯 Funcionalidades Principais do Frontend

### 1. **Autenticação**
- Login com email/senha
- Validação de credenciais (será integrada com API)
- Redirect automático para dashboard após login

### 2. **Gestão de Usuários**
- **Listar**: Visualizar todos os usuários com filtros
  - Filtro por tipo de acesso
  - Busca por nome, CPF, celular, email ou animal
- **Criar**: Formulários separados para cliente e usuário
- **Visualizar**: Perfil completo com informações dinâmicas
- **Editar** e **Deletar** (Admin)

### 3. **Gestão de Animais**
- Vincular animais a clientes
- Visualizar prontuários
- Editar informações do animal
- Histórico médico

### 4. **Agenda**
- Visualizar agendamentos
- Criar novo agendamento
- Filtrar por tipo (exame, cirurgia, etc.)

### 5. **UI/UX**
- Sidebar de navegação com menu
- Componentes reutilizáveis
- Design responsivo com Tailwind CSS
- Modals e confirmações
- Badges de status
- Loading spinners

---

## 🧩 Componentes Reutilizáveis

### `Button.jsx`
Botão customizado com variações de estilo.
```jsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Salvar
</Button>
```

### `Input.jsx`
Campo de input customizado.
```jsx
<Input 
  label="Email" 
  type="email" 
  placeholder="seu@email.com" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### `AnimalCard.jsx`
Card para exibir informações de animal.
```jsx
<AnimalCard 
  animal={animalData}
  onVerProntuario={() => navigate(`/prontuarios/${animal.id}`)}
/>
```

### `Menu.jsx` (Sidebar)
Navegação lateral do dashboard.
```jsx
<Menu 
  activePage={activePage}
  onNavigate={handleNavigation}
  onLogout={handleLogout}
/>
```

---

## 🌐 Integrações com API

Atualmente, o frontend usa **mock data** (dados fake). Para integrar com a API real:

### Exemplo em `PerfilUsuario.jsx`:
```javascript
useEffect(() => {
  // Substitua pelo fetch real quando o backend estiver pronto:
  fetch(`/api/usuarios/${usuarioId}`)
    .then((r) => r.json())
    .then(setPerfil)
    .finally(() => setLoading(false));
}, [usuarioId]);
```

### Endpoints esperados no Backend:
```
GET    /api/usuarios              → Listar usuários
POST   /api/usuarios              → Criar usuário
GET    /api/usuarios/:id          → Obter usuário específico
PUT    /api/usuarios/:id          → Atualizar usuário
DELETE /api/usuarios/:id          → Deletar usuário

GET    /api/clientes              → Listar clientes
POST   /api/clientes              → Criar cliente
GET    /api/clientes/:id          → Obter cliente específico

GET    /api/animais               → Listar animais
POST   /api/animais               → Criar animal
GET    /api/animais/:id           → Obter animal específico
PUT    /api/animais/:id           → Atualizar animal

GET    /api/prontuarios           → Listar prontuários
GET    /api/prontuarios/:id       → Obter prontuário específico
POST   /api/prontuarios           → Criar prontuário

GET    /api/agendamentos          → Listar agendamentos
POST   /api/agendamentos          → Criar agendamento
PUT    /api/agendamentos/:id      → Atualizar agendamento
DELETE /api/agendamentos/:id      → Deletar agendamento
```

---

## 🛠️ Dependências Principais

```json
{
  "react": "^19.2.4",                    // Framework React
  "react-dom": "^19.2.4",                // Renderização DOM
  "react-router-dom": "^6.15.0",         // Roteamento
  "@tailwindcss/vite": "^4.2.2",         // Tailwind CSS
  "lucide-react": "^1.3.0",              // Ícones
  "@heroicons/react": "^2.2.0"           // Ícones adicionais
}
```

---

## 📚 Stack Técnico

- **Framework**: React 19
- **Build Tool**: Vite 8
- **Roteamento**: React Router v6
- **Styling**: Tailwind CSS 4
- **Ícones**: Lucide React + Heroicons
- **Compilação JS**: Babel
- **Linting**: ESLint

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react'"
```bash
npm install
```

### Erro ao compilar com Vite
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Porta 5173 já em uso
```bash
# Usar porta diferente
npm run dev -- --port 3000
```

### CSS não está sendo aplicado
- Verifique se `tailwind.config.js` está configurado corretamente
- Limpe o cache: `npm run build` e `npm run preview`

---

## 📖 Como Adicionar Uma Nova Página

1. **Criar arquivo** em `src/pages/MinhaNovaPage.jsx`:
```jsx
export default function MinhaNovaPage() {
  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <h1>Minha Nova Página</h1>
    </div>
  );
}
```

2. **Importar em** `src/pages/App.jsx`:
```jsx
import MinhaNovaPage from './MinhaNovaPage';
```

3. **Adicionar rota**:
```jsx
<Route path="minha-nova-page" element={<MinhaNovaPageWrapper />} />
```

4. **Criar wrapper**:
```jsx
function MinhaNovaPageWrapper() {
  const navigate = useNavigate();
  return <MinhaNovaPage onNavigate={navigate} />;
}
```

---

## 🎓 Padrões e Convenções

### Nomeação de Arquivos
- Componentes: PascalCase (`MinhaComponente.jsx`)
- Páginas: PascalCase (`MinhaPage.jsx`)
- Utilitários: camelCase (`utilidade.js`)

### Estrutura de Componente
```jsx
import { useState, useEffect } from 'react';

/**
 * Descrição do componente
 * 
 * Props:
 *  - prop1: type → descrição
 *  - prop2: type → descrição
 */
export default function MinhaComponente({ prop1, prop2 }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Efeito
  }, []);

  return (
    <div>
      {/* Render */}
    </div>
  );
}
```

### Tailwind CSS
- Usar classes utilitárias (não CSS customizado)
- Exemplo: `className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"`

---

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -m 'Adiciona minha feature'`
3. Push para a branch: `git push origin feature/minha-feature`
4. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação deste README
2. Consulte a estrutura do projeto
3. Verifique logs no console do navegador (F12)
4. Contacte o desenvolvedor responsável

---

## 📅 Status do Projeto

- ✅ Login e autenticação (mock)
- ✅ Cadastro de usuários públicos
- ✅ Dashboard/página inicial
- ✅ CRUD de cadastros (usuários e clientes)
- ✅ Perfil de usuário dinâmico
- ✅ Prontuários (visualizar, editar)
- ✅ Agenda de agendamentos
- ⏳ Integração com API backend
- ⏳ Vacinação (estrutura criada)
- ⏳ Estoque (placeholder)
- ⏳ Financeiro (placeholder)

---

## 📝 Notas Importantes

1. **Mock Data**: O frontend ainda usa dados fake. Serão substituídos por chamadas à API quando o backend estiver pronto.
2. **Autenticação**: Será implementada integração com JWT após conclusão do backend.
3. **Responsividade**: Testado em desktop. Otimizações mobile podem ser necessárias.
4. **Performance**: A página usa React Compiler para otimizações automáticas.

---

## 🔒 Segurança

- Senhas serão hashizadas no backend
- Tokens JWT para autenticação (a implementar)
- CORS configurado para aprenas origens conhecidas
- Validações de entrada em formulários

---

## 📄 Licença

Projeto propietário da UNIPAM.

---

**Última atualização**: 09 de maio de 2026  
**Versão**: 1.0.0  
**Desenvolvido por**: Equipe PetSystem
