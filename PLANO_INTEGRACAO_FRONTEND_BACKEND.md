# 📋 Plano de Integração Frontend-Backend - PetSystem

**Data**: Maio 12, 2026  
**Status**: Draft - Pronto para Implementação  
**Backend**: Flask + JWT (5000) ✅ Pronto  
**Frontend**: React + Vite (5173) 🔄 Parcialmente Pronto

---

## 1. 📊 Status Atual das Features

### ✅ Frontend - PRONTO PARA INTEGRAÇÃO

#### 1.1 Autenticação (Login & Cadastro)
- **Componentes**: `Login.jsx`, `Cadastro.jsx`
- **Status**: Interface completa, falta integração com backend
- **Problema atual**: Faz chamada para `localhost:3000/login` (deve ser `5000`)
- **Mock**: Está em "modo desenvolvimento" com bypass de autenticação
- **Ação necessária**: 
  - [ ] Ajustar URL do backend (3000 → 5000)
  - [ ] Remover modo development
  - [ ] Implementar storage de tokens (localStorage/sessionStorage)
  - [ ] Criar context de autenticação (AuthContext)

#### 1.2 Cadastros (Tutores/Clientes)
- **Componentes**: 
  - `CadastrarCliente.jsx` - Form cadastro cliente/tutor
  - `Cadastros.jsx` - Lista de usuários/clientes
  - `PerfilUsuario.jsx` - Visualização de perfil
- **Status**: Interface 100% pronta, falta integração com API
- **Dados que existem**: Mock com dados estáticos
- **Ação necessária**:
  - [ ] Integrar `POST /api/tutores` para criar cliente
  - [ ] Integrar `GET /api/tutores` para listar
  - [ ] Integrar `PUT /api/tutores/<id>` para editar
  - [ ] Integrar `DELETE /api/tutores/<id>` para deletar

#### 1.3 Prontuários (Medical Records)
- **Componentes**:
  - `Prontuario.jsx` - Lista de prontuários
  - `ProntuarioDetalhe.jsx` - Detalhe do prontuário
  - `EditarPet.jsx` - Edição de animal
- **Status**: Interface pronta, falta integração
- **Ação necessária**:
  - [ ] Integrar `GET /api/pets` para listar animais
  - [ ] Integrar `GET /api/pets/<id>/records` para prontuários
  - [ ] Integrar `POST /api/pets` para criar pet
  - [ ] Integrar `PUT /api/pets/<id>` para editar pet
  - [ ] Integrar `DELETE /api/pets/<id>` para deletar pet

#### 1.4 Agenda (Appointments)
- **Componentes**:
  - `Agenda.jsx` - Visualização calendário
  - `FormAgenda.jsx` - Criar novo agendamento
- **Status**: Interface com calendário funcional, dados em mock
- **Ação necessária**:
  - [ ] Integrar `GET /api/agendamentos` para listar
  - [ ] Integrar `POST /api/agendamentos` para criar
  - [ ] Integrar `PUT /api/agendamentos/<id>` para editar
  - [ ] Integrar `DELETE /api/agendamentos/<id>` para cancelar
  - [ ] Implementar sincronização de calendário com datas reais

#### 1.5 Vacinação (Vaccination)
- **Componentes**: `Vacinacao.jsx`
- **Status**: Interface pronta com seleção múltipla, dados em MOCK
- **Problema**: Usa mock data (MOCK_ANIMALS) em vez de dados reais
- **Ação necessária**:
  - [ ] Integrar `GET /api/pets` para listar animais
  - [ ] Integrar `POST /api/pets/<pet_id>/vaccines` para registrar vacinação
  - [ ] Integrar `GET /api/pets/<pet_id>/vaccines` para histórico

#### 1.6 Dashboard Principal (Home)
- **Componentes**: `TelaPrincipal.jsx`
- **Status**: Cards estáticos de agendamentos
- **Ação necessária**:
  - [ ] Integrar `GET /api/agendamentos` para mostrar próximos agendamentos
  - [ ] Implementar cards dinâmicos com dados reais

---

### 🔄 Frontend - PARCIALMENTE PRONTO

#### 2.1 Estoque
- **Status**: Placeholder
- **Componentes**: `PlaceholderPage.jsx`
- **Ação necessária**: ❌ Aguardar design/requisitos

#### 2.2 Financeiro
- **Status**: Placeholder
- **Componentes**: `PlaceholderPage.jsx`
- **Ação necessária**: ❌ Aguardar design/requisitos

---

### ✅ Backend - ENDPOINTS DISPONÍVEIS

#### 3.1 Autenticação
- ✅ `POST /api/auth/register` - Registrar usuário
- ✅ `POST /api/auth/login` - Login com JWT
- ✅ `GET /api/auth/me` - Dados do usuário atual
- ✅ `POST /api/auth/logout` - Logout (invalidar token no frontend)

#### 3.2 Tutores (Clientes/Donos)
- ✅ `GET /api/tutores` - Listar todos
- ✅ `GET /api/tutores/<id>` - Detalhe de um tutor
- ✅ `POST /api/tutores` - Criar novo
- ✅ `PUT /api/tutores/<id>` - Atualizar
- ✅ `DELETE /api/tutores/<id>` - Deletar (soft-delete)

#### 3.3 Pets (Animais)
- ✅ `GET /api/pets` - Listar todos
- ✅ `GET /api/pets/<id>` - Detalhe de um pet
- ✅ `POST /api/pets` - Criar novo
- ✅ `PUT /api/pets/<id>` - Atualizar
- ✅ `DELETE /api/pets/<id>` - Deletar (soft-delete)

#### 3.4 Agendamentos (Appointments)
- ✅ `GET /api/agendamentos` - Listar
- ✅ `GET /api/agendamentos/<id>` - Detalhe
- ✅ `POST /api/agendamentos` - Criar
- ✅ `PUT /api/agendamentos/<id>` - Atualizar
- ✅ `DELETE /api/agendamentos/<id>` - Cancelar

#### 3.5 Médico & Vacinas
- ✅ `GET /api/pets/<pet_id>/records` - Prontuários
- ✅ `POST /api/pets/<pet_id>/records` - Criar prontuário
- ✅ `GET /api/pets/<pet_id>/vaccines` - Listar vacinas
- ✅ `POST /api/pets/<pet_id>/vaccines` - Registrar vacina

#### 3.6 Health
- ✅ `GET /api/health` - Status da API

---

## 2. 🎯 Prioridades de Integração

### FASE 1: CRÍTICA (Semana 1)
Estas são essenciais para o sistema funcionar:

1. **Autenticação**
   - Ajustar URLs (3000 → 5000)
   - Implementar AuthContext
   - Integrar Login e Register
   - Armazenar tokens em localStorage
   - Implementar logout e limpeza de tokens

2. **Tutores (Clientes)**
   - Integrar listagem com `GET /api/tutores`
   - Integrar criação com `POST /api/tutores`
   - Integrar edição com `PUT /api/tutores/<id>`
   - Integrar exclusão com `DELETE /api/tutores/<id>`

3. **Pets (Animais)**
   - Integrar CRUD completo de pets
   - Vincular a tutores na criação
   - Listar por tutor

### FASE 2: IMPORTANTE (Semana 2)
Funcionalidades principais do negócio:

4. **Agenda (Agendamentos)**
   - Integrar listagem com `GET /api/agendamentos`
   - Integrar criação com `POST /api/agendamentos`
   - Sincronizar calendário com dados reais
   - Implementar drag-drop ou edição de horários

5. **Prontuários (Medical Records)**
   - Integrar listagem de prontuários por pet
   - Integrar edição de informações de pet
   - Mostrar histórico médico

6. **Vacinação**
   - Remover mock data (MOCK_ANIMALS)
   - Integrar listagem de pets reais
   - Integrar registro de vacinação
   - Mostrar histórico de vacinas

### FASE 3: COMPLEMENTAR (Semana 3)
Melhorias e funcionalidades extras:

7. **Dashboard**
   - Integrar dados reais de agendamentos próximos
   - Criar cards dinâmicos com estatísticas

8. **Permissões por Role**
   - Implementar guarda de rotas baseado em JWT payload
   - Mostrar/ocultar recursos conforme tipo de acesso
   - Cliente vs Usuário vs Admin

---

## 3. 💻 Mudanças Técnicas Necessárias

### 3.1 Estrutura de Arquivos Recomendada

```
petSystemRe/src/
├── services/                    # NOVO: serviços de API
│   ├── api.js                   # Configuração base do fetch
│   ├── authService.js           # Funções de login/register
│   ├── tutoresService.js        # CRUD de tutores
│   ├── petsService.js           # CRUD de pets
│   ├── agendamentosService.js   # CRUD de agendamentos
│   └── vacinasService.js        # Endpoints de vacinação
├── context/                     # NOVO: contextos React
│   └── AuthContext.jsx          # Estado global de autenticação
├── hooks/                       # NOVO: custom hooks
│   ├── useAuth.js              # Hook para usar AuthContext
│   └── useApi.js               # Hook para chamadas de API
├── components/
│   └── ProtectedRoute.jsx       # NOVO: rota protegida
└── ...
```

### 3.2 Arquivo `api.js` (Exemplo)

```javascript
// petSystemRe/src/services/api.js
const API_BASE = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};
```

### 3.3 AuthContext.jsx (Exemplo)

```javascript
// petSystemRe/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { apiCall } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      // Verificar se token ainda é válido
      apiCall('/auth/me')
        .then(res => setUser(res.user))
        .catch(() => logout());
    }
    setLoading(false);
  }, [token]);

  const login = async (login, password) => {
    const res = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 4. 📝 Checklist de Integração

### AUTENTICAÇÃO
- [ ] Criar `AuthContext.jsx` e `useAuth()` hook
- [ ] Criar `api.js` com baseURL correto (5000)
- [ ] Atualizar `Login.jsx` para usar novo contexto
- [ ] Atualizar `Cadastro.jsx` para registrar via API
- [ ] Criar `ProtectedRoute.jsx` para rotas autenticadas
- [ ] Implementar logout e limpeza de tokens
- [ ] Testar fluxo: Cadastro → Login → Dashboard

### TUTORES
- [ ] Criar `tutoresService.js`
- [ ] Atualizar `Cadastros.jsx` para listar da API
- [ ] Atualizar `CadastrarCliente.jsx` para criar via API
- [ ] Atualizar `PerfilUsuario.jsx` para carregar dados da API
- [ ] Implementar edição e deleção
- [ ] Testar CRUD completo

### PETS
- [ ] Criar `petsService.js`
- [ ] Atualizar `Prontuario.jsx` para listar pets da API
- [ ] Atualizar `ProntuarioDetalhe.jsx` para carregar dados
- [ ] Atualizar `EditarPet.jsx` para editar via API
- [ ] Testar CRUD de pets

### AGENDAMENTOS
- [ ] Criar `agendamentosService.js`
- [ ] Atualizar `Agenda.jsx` para listar da API
- [ ] Atualizar `FormAgenda.jsx` para criar via API
- [ ] Sincronizar calendário com data real
- [ ] Testar CRUD de agendamentos

### VACINAÇÃO
- [ ] Criar `vacinasService.js`
- [ ] Remover `MOCK_ANIMALS` de `Vacinacao.jsx`
- [ ] Integrar `GET /api/pets` para listar animais
- [ ] Integrar `POST /api/pets/<pet_id>/vaccines` para registrar
- [ ] Testar registro de vacinação múltipla

### DASHBOARD
- [ ] Integrar dados reais de agendamentos
- [ ] Atualizar `TelaPrincipal.jsx` com API
- [ ] Criar componentes dinâmicos

---

## 5. 🔐 Considerações de Segurança

1. **Tokens JWT**:
   - Access token: 1 hora (armazenar em localStorage)
   - Refresh token: 30 dias (armazenar em localStorage)
   - Implementar refresh automático antes de expirar

2. **CORS**:
   - Backend já configurado para `localhost:5173` ✅
   - Enviar credentials se necessário

3. **Validação**:
   - Validar dados no frontend antes de enviar
   - Tratar erros da API com UX amigável
   - Mostrar mensagens de erro específicas

4. **Roles & Permissions**:
   - Cliente: Só vê dados próprios
   - Usuário: Acessa agenda, cadastros, prontuários
   - Admin: Acesso total

---

## 6. 🧪 Testes Recomendados

Antes de cada integração:
```bash
# Terminal 1: Backend
cd petSystemPy
/path/to/.venv/bin/python app.py

# Terminal 2: Frontend
cd petSystemRe
npm run dev

# Terminal 3: Testes com curl (ou Postman)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'
```

---

## 7. 📅 Timeline Estimada

| Fase | Features | Duração | Responsável |
|------|----------|---------|-------------|
| 1 | Auth, Tutores, Pets | 2-3 dias | ? |
| 2 | Agenda, Prontuários, Vacinação | 2-3 dias | ? |
| 3 | Dashboard, Refinamento | 1-2 dias | ? |

---

## 8. ⚠️ Possíveis Bloqueadores

1. **Campos faltando no frontend**:
   - `CadastrarUsuario.jsx` não tem endpoint mapeado
   - Falta role `VETERINARIO` na criação de usuário

2. **Mock data hardcoded**:
   - `Vacinacao.jsx` precisa de refatoração completa
   - `TelaPrincipal.jsx` usa dados fake

3. **Rota de porta errada**:
   - Alguns componentes fazem chamadas para `3000` em vez de `5000`

4. **Falta de tratamento de erros**:
   - Componentes não tratam falhas de API graciosamente

---

## 9. 🚀 Próximos Passos Imediatos

1. ✅ Explorar backend (FEITO)
2. ✅ Explorar frontend (FEITO)
3. 🔄 **Criar estrutura de services e contextos**
4. 🔄 **Integrar autenticação**
5. 🔄 **Integrar CRUD de tutores**
6. 🔄 Testes end-to-end
7. 🔄 Deploy

---

**Nota Final**: Este plano assume que o backend está rodando em `localhost:5000` e MySQL em Docker está ativo. Todas as features do backend estão prontas e testadas.
