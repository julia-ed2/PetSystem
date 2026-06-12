// ─── FAKE API ────────────────────────────────────────────────────────────────
// Substitua cada função por fetch() real quando o backend estiver pronto.
// Base URL de exemplo: const BASE = 'https://api.petsystem.com.br/v1';
// ─────────────────────────────────────────────────────────────────────────────

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ── Usuário logado ────────────────────────────────────────────────────────────
let _user = {
  id: 'u1',
  nome: 'Julia Eduarda',
  email: 'juliaefs@unipam.edu.br',
  cpf: '111.111.111-11',
  celular: '(34) 99999-9999',
  endereco: 'Rua Major Gote, 1 - Patos de Minas, MG',
  notificacoes: true,
};

// ── Pets ──────────────────────────────────────────────────────────────────────
let _pets = [
  { id: 'p1', nome: 'Theo', especie: 'Cachorro', raca: 'Shih Tzu', sexo: 'Macho', idade: '5 anos', foto: null },
  { id: 'p2', nome: 'Mel',  especie: 'Gato',     raca: 'SRD',      sexo: 'Fêmea', idade: '3 anos', foto: null },
];

// ── Vacinas ───────────────────────────────────────────────────────────────────
let _vacinas = {
  p1: [
    { id: 'v1', nome: 'V10 (Polivalente)', data: '02/04/2026', proximoReforcao: '02/04/2027', veterinario: 'Dr. Exemplo 1' },
    { id: 'v2', nome: 'Raiva',             data: '01/03/2026', proximoReforcao: '01/03/2027', veterinario: 'Dr. Exemplo 2' },
    { id: 'v3', nome: 'Leishmaniose',      data: '31/01/2026', proximoReforcao: '31/01/2027', veterinario: 'Dr. Exemplo 1' },
  ],
  p2: [
    { id: 'v4', nome: 'Tríplice Felina',   data: '10/02/2026', proximoReforcao: '10/02/2027', veterinario: 'Dr. Exemplo 2' },
  ],
};

// ── Exames ────────────────────────────────────────────────────────────────────
let _exames = {
  p1: [
    { id: 'e1', nome: 'Hemograma', data: '07/04/2026', descricao: 'Resultado do exame disponível para download', arquivo: 'laudo_exame.pdf' },
  ],
  p2: [],
};

// ── Histórico clínico ─────────────────────────────────────────────────────────
let _historico = {
  p1: [
    { id: 'h1', tipo: 'Pós-cirurgico',          cor: 'pink',   hora: '16:35', data: '08/04/2026', descricao: 'Theo está em observação no pós-cirurgico' },
    { id: 'h2', tipo: 'Cirurgia',                cor: 'pink',   hora: '16:00', data: '08/04/2026', descricao: 'O procedimento cirurgico foi iniciado' },
    { id: 'h3', tipo: 'Marcação de procedimento',cor: 'purple', hora: '',      data: '',           descricao: 'A cirurgia de castração de Theo foi marcada para o dia **08/04/2026** às **16:00**' },
  ],
  p2: [],
};

// ── Notificações / atualizações ───────────────────────────────────────────────
let _atualizacoes = [
  { id: 'n1', tipo: 'Lembrete',       data: '07/04/206', descricao: 'Há um procediemento marcado para amanhã às 16:00 para Theo', link: null },
  { id: 'n2', tipo: 'Laudo de exame', data: '01/02/206', descricao: 'Os resultados dos exames de sangue de Theo já estão disponíveis', link: 'Visualizar resultados' },
];

// ── Atendimento em andamento ──────────────────────────────────────────────────
let _atendimento = { ativo: true, descricao: 'Theo está em observação', petId: 'p1' };

// ── Meta de passeios ──────────────────────────────────────────────────────────
let _meta = { objetivo: 5, realizado: 4, unidade: 'por semana' };
// Meta por pet (gamificação simples)
let _metaPets = {
  p1: { objetivo: 5, realizado: 4, unidade: 'por semana' },
  p2: { objetivo: 3, realizado: 1, unidade: 'por semana' },
};

// ─────────────────────────────────────────────────────────────────────────────
// API functions — troque o corpo de cada uma por fetch() real
// ─────────────────────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login: async (email, senha) => {
    await delay();
    if (email && senha) return { token: 'fake-token', user: _user };
    throw new Error('Credenciais inválidas');
  },
  logout: async () => { await delay(200); return true; },

  // User
  getUser:    async () => { await delay(); return { ..._user }; },
  updateUser: async (dados) => { await delay(); _user = { ..._user, ...dados }; return { ..._user }; },
  toggleNotificacoes: async () => {
    await delay(200);
    _user.notificacoes = !_user.notificacoes;
    return _user.notificacoes;
  },

  // Pets
  getPets:    async () => { await delay(); return [..._pets]; },
  addPet:     async (pet) => {
    await delay();
    const novo = { ...pet, id: `p${Date.now()}` };
    _pets = [..._pets, novo];
    _vacinas[novo.id]  = [];
    _exames[novo.id]   = [];
    _historico[novo.id] = [];
    return novo;
  },

  // Vacinas
  getVacinas: async (petId) => { await delay(); return [...(_vacinas[petId] || [])]; },

  // Exames
  getExames:  async (petId) => { await delay(); return [...(_exames[petId] || [])]; },

  // Histórico
  getHistorico: async (petId) => { await delay(); return [...(_historico[petId] || [])]; },

  // Home
  getAtualizacoes: async () => { await delay(); return [..._atualizacoes]; },
  getAtendimento:  async () => { await delay(); return { ..._atendimento }; },
  getMeta:         async () => { await delay(); return { ..._meta }; },
  updateMeta:      async (dados) => { await delay(); _meta = { ..._meta, ...dados }; return { ..._meta }; },
  // Meta por pet
  getMetaPet:      async (petId) => { await delay(); return { ...(_metaPets[petId] || { objetivo: 5, realizado: 0, unidade: 'por semana' }) }; },
  updateMetaPet:   async (petId, dados) => { await delay(); _metaPets[petId] = { ...(_metaPets[petId] || { objetivo: 5, realizado: 0, unidade: 'por semana' }), ...dados }; return { ..._metaPets[petId] }; },
  incrementPasseio: async (petId) => { // registra um passeio para o pet
    await delay();
    if (!_metaPets[petId]) _metaPets[petId] = { objetivo: 5, realizado: 0, unidade: 'por semana' };
    _metaPets[petId].realizado = (_metaPets[petId].realizado || 0) + 1;
    return { ..._metaPets[petId] };
  },
  registerPasseio: async (petId) => {
    await delay();
    if (!_metaPets[petId]) _metaPets[petId] = { objetivo: 5, realizado: 0, unidade: 'por semana' };
    _metaPets[petId].realizado = Math.min((_metaPets[petId].realizado || 0) + 1, _metaPets[petId].objetivo);
    const pet = _pets.find(p => p.id === petId) || { nome: 'pet' };
    const agora = new Date();
    const novoHistorico = {
      id: `h${Date.now()}`,
      tipo: 'Passeio',
      cor: 'purple',
      hora: agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: agora.toLocaleDateString('pt-BR'),
      descricao: `Passeio registrado para ${pet.nome}.`,
    };
    if (!_historico[petId]) _historico[petId] = [];
    _historico[petId] = [novoHistorico, ..._historico[petId]];
    return { meta: { ..._metaPets[petId] }, historico: novoHistorico };
  },
};