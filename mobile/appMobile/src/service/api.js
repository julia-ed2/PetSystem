import { saveToken, getToken, clearToken } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

// ── In-memory state (sem equivalente no backend) ──────────────────────────────
let _currentUser = null;
let _metaPets    = {};

// ── HTTP helper ───────────────────────────────────────────────────────────────
async function request(method, path, body) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    await clearToken();
    _currentUser = null;
    throw Object.assign(new Error('Sessão expirada'), { code: 401 });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.error || `HTTP ${res.status}`), { code: res.status });
  }
  return res.json();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  const str = String(iso).split('T')[0]; // remove hora se existir
  const parts = str.split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

const COR_POR_TIPO = {
  'Vacinação': 'pink',
  'Cirurgia':  'pink',
  'Consulta':  'purple',
  'Exame':     'gray',
};

// ─────────────────────────────────────────────────────────────────────────────
export const api = {

  // ── Auth ────────────────────────────────────────────────────────────────────
  login: async (login, senha) => {
    const json = await request('POST', '/api/auth/login', { login, password: senha });
    await saveToken(json.access_token);
    _currentUser = { ...json.user, notificacoes: true };
    return _currentUser;
  },

  logout: async () => {
    await clearToken();
    _currentUser = null;
    return true;
  },

  isLoggedIn: async () => {
    const token = await getToken();
    return !!token;
  },

  // ── User ────────────────────────────────────────────────────────────────────
  getUser: async () => {
    if (_currentUser?.tutor_id !== undefined) return { ..._currentUser };
    const json = await request('GET', '/api/auth/me');
    const user = { ...json.user, email: json.user.login, notificacoes: true };
    if (user.tutor_id) {
      try {
        const tj = await request('GET', `/api/tutores/${user.tutor_id}`);
        const t = tj.data || {};
        user.cpf      = t.cpf      || '';
        user.celular  = t.telefone || '';
        user.endereco = t.endereco || '';
      } catch {}
    }
    _currentUser = user;
    return { ..._currentUser };
  },

  updateUser: async (dados) => {
    const user = await api.getUser();
    if (user.tutor_id) {
      await request('PUT', `/api/tutores/${user.tutor_id}`, {
        nome:     dados.nome,
        telefone: dados.celular,
        endereco: dados.endereco,
      });
    }
    _currentUser = { ..._currentUser, nome: dados.nome, celular: dados.celular, endereco: dados.endereco };
    return { ..._currentUser };
  },

  toggleNotificacoes: async () => {
    _currentUser = { ..._currentUser, notificacoes: !(_currentUser?.notificacoes ?? true) };
    return _currentUser.notificacoes;
  },

  // ── Pets ────────────────────────────────────────────────────────────────────
  getPets: async () => {
    const user = await api.getUser();
    if (!user.tutor_id) return [];
    const json = await request('GET', `/api/pets?tutor_id=${user.tutor_id}`);
    return (json.data || []).map(p => ({
      ...p,
      idade: p.idade != null ? `${p.idade} anos` : '',
    }));
  },

  addPet: async (pet) => {
    const user = await api.getUser();
    const json = await request('POST', '/api/pets', { ...pet, tutor_id: user.tutor_id });
    return json.data;
  },

  // ── Vacinas ─────────────────────────────────────────────────────────────────
  getVacinas: async (petId) => {
    const json = await request('GET', `/api/pets/${petId}/vaccines`);
    return (json.data || []).map(v => ({
      id:             v.id,
      nome:           v.vacina_nome,
      data:           fmtDate(v.data_aplicacao),
      proximoReforco: v.next_dose_date ? fmtDate(v.next_dose_date) : null,
      veterinario:    v.veterinario_nome || '',
      lote:           v.lote || '',
    }));
  },

  // ── Exames ──────────────────────────────────────────────────────────────────
  getExames: async (petId) => {
    const json = await request('GET', `/api/pets/${petId}/records`);
    return (json.data || [])
      .filter(r => r.tipo === 'Exame')
      .map(r => ({
        id:        r.id,
        nome:      r.descricao || 'Exame',
        data:      fmtDate(r.data) || '',
        descricao: r.observacoes || '',
        arquivo:   r.arquivo || null,
      }));
  },

  // ── Histórico ───────────────────────────────────────────────────────────────
  getHistorico: async (petId) => {
    const json = await request('GET', `/api/pets/${petId}/records`);
    return (json.data || []).map(r => {
      let hora = r.hora || '';
      let dataStr = r.data || '';
      if (!hora && dataStr.includes('T')) {
        const [datePart, timePart] = dataStr.split('T');
        hora = timePart ? timePart.substring(0, 5) : '';
        dataStr = datePart;
      }
      return {
        id:        r.id,
        tipo:      r.tipo,
        data:      fmtDate(dataStr),
        hora:      hora,
        descricao: [r.descricao, r.observacoes].filter(Boolean).join(' — '),
        cor:       COR_POR_TIPO[r.tipo] || 'purple',
      };
    });
  },

  // ── Home ────────────────────────────────────────────────────────────────────
  getAtualizacoes: async (petId = null) => {
    try {
      let petIds = [];
      if (petId) {
        petIds = [petId];
      } else {
        const pets = await api.getPets();
        petIds = pets.map(p => p.id);
      }
      const all = [];
      for (const id of petIds) {
        const json = await request('GET', `/api/agendamentos?pet_id=${id}`);
        for (const a of json.data || []) {
          all.push({
            id:        `ag-${a.id}`,
            tipo:      a.tipo,
            _raw:      a.data || '',
            data:      a.data ? fmtDate(a.data) : '',
            descricao: `${a.pet_nome} — ${a.veterinario_nome || 'Veterinário'}`,
          });
        }
      }
      return all
        .sort((a, b) => b._raw.localeCompare(a._raw))
        .slice(0, 5)
        .map(({ _raw, ...rest }) => rest);
    } catch {
      return [];
    }
  },

  getAtendimento: async () => {
    try {
      const pets = await api.getPets();
      for (const pet of pets) {
        const json = await request('GET', `/api/agendamentos?pet_id=${pet.id}&status=em_progresso`);
        if (json.data?.length > 0) {
          const a = json.data[0];
          return {
            ativo:       true,
            petId:       a.pet_id,
            descricao:   `${a.pet_nome} em ${a.tipo}`,
            veterinario: a.veterinario_nome || '',
            inicio:      a.hora || '',
          };
        }
      }
      return { ativo: false };
    } catch {
      return { ativo: false };
    }
  },

  // ── Meta de passeios (local — sem backend) ──────────────────────────────────
  getMeta: async () => ({ objetivo: 5, realizado: 0, unidade: 'por semana' }),

  updateMeta: async (dados) => dados,

  getMetaPet: async (petId) => ({
    ...{ objetivo: 5, realizado: 0, unidade: 'por semana' },
    ...(_metaPets[petId] || {}),
  }),

  updateMetaPet: async (petId, dados) => {
    _metaPets[petId] = { ...(_metaPets[petId] || { objetivo: 5, realizado: 0, unidade: 'por semana' }), ...dados };
    return { ..._metaPets[petId] };
  },

  incrementPasseio: async (petId) => {
    if (!_metaPets[petId]) _metaPets[petId] = { objetivo: 5, realizado: 0, unidade: 'por semana' };
    _metaPets[petId].realizado = (_metaPets[petId].realizado || 0) + 1;
    return { ..._metaPets[petId] };
  },

  registerPasseio: async (petId) => {
    if (!_metaPets[petId]) _metaPets[petId] = { objetivo: 5, realizado: 0, unidade: 'por semana' };
    _metaPets[petId].realizado = Math.min(
      (_metaPets[petId].realizado || 0) + 1,
      _metaPets[petId].objetivo
    );
    const agora = new Date();
    const novoHistorico = {
      id:        `passeio-${Date.now()}`,
      tipo:      'Passeio',
      cor:       'purple',
      hora:      agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data:      agora.toLocaleDateString('pt-BR'),
      descricao: 'Passeio registrado.',
    };
    return { meta: { ..._metaPets[petId] }, historico: novoHistorico };
  },
};
