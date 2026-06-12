import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, getToken, clearToken } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

let _currentUser = null;

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
  const str = String(iso).split('T')[0];
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

// ── AsyncStorage helpers ──────────────────────────────────────────────────────
async function asGet(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function asSet(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────
export const api = {

  // ── Auth ────────────────────────────────────────────────────────────────────
  login: async (login, senha) => {
    const json = await request('POST', '/api/auth/login', { login, password: senha });
    await saveToken(json.access_token);
    _currentUser = null; // force reload on next getUser
    return json.user;
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
    const user = { ...json.user, email: json.user.login };
    if (user.tutor_id) {
      try {
        const tj = await request('GET', `/api/tutores/${user.tutor_id}`);
        const t = tj.data || {};
        user.cpf      = t.cpf      || '';
        user.celular  = t.telefone || '';
        user.endereco = t.endereco || '';
      } catch {}
    }
    user.notificacoes = await asGet('notificacoes', true);
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
    const current = await asGet('notificacoes', true);
    const next = !current;
    await asSet('notificacoes', next);
    _currentUser = { ..._currentUser, notificacoes: next };
    return next;
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
        hora,
        descricao: [r.descricao, r.observacoes].filter(Boolean).join(' — '),
        cor:       COR_POR_TIPO[r.tipo] || 'purple',
      };
    });
  },

  // ── Home ────────────────────────────────────────────────────────────────────
  getAtualizacoes: async (petId = null) => {
    try {
      const url = petId ? `/api/agendamentos?pet_id=${petId}` : null;
      if (!url) return [];
      const json = await request('GET', url);
      return (json.data || [])
        .sort((a, b) => (b.data || '').localeCompare(a.data || ''))
        .slice(0, 5)
        .map(a => ({
          id:        `ag-${a.id}`,
          tipo:      a.tipo,
          data:      a.data ? fmtDate(a.data) : '',
          descricao: `${a.pet_nome} — ${a.veterinario_nome || 'Veterinário'}`,
          status:    a.status,
        }));
    } catch {
      return [];
    }
  },

  getAtendimento: async () => {
    try {
      const user = await api.getUser();
      if (!user.tutor_id) return { ativo: false };
      const json = await request('GET',
        `/api/agendamentos?tutor_id=${user.tutor_id}&status=em_progresso`
      );
      if (!json.data?.length) return { ativo: false };
      const a = json.data[0];
      return {
        ativo:       true,
        petId:       a.pet_id,
        descricao:   `${a.pet_nome} em ${a.tipo}`,
        veterinario: a.veterinario_nome || '',
        inicio:      a.hora || '',
      };
    } catch {
      return { ativo: false };
    }
  },

  // ── Meta de passeios (AsyncStorage) ──────────────────────────────────────────
  getMeta: async () => ({ objetivo: 5, realizado: 0, unidade: 'por semana' }),
  updateMeta: async (dados) => dados,

  getMetaPet: async (petId) => {
    const stored = await asGet(`meta_${petId}`, {});
    return { objetivo: 5, realizado: 0, unidade: 'por semana', ...stored };
  },

  updateMetaPet: async (petId, dados) => {
    const current = await api.getMetaPet(petId);
    const updated = { ...current, ...dados };
    await asSet(`meta_${petId}`, updated);
    return updated;
  },

  incrementPasseio: async (petId) => {
    const meta = await api.getMetaPet(petId);
    const updated = { ...meta, realizado: (meta.realizado || 0) + 1 };
    await asSet(`meta_${petId}`, updated);
    return updated;
  },

  registerPasseio: async (petId) => {
    const meta = await api.getMetaPet(petId);
    const updated = {
      ...meta,
      realizado: Math.min((meta.realizado || 0) + 1, meta.objetivo),
    };
    await asSet(`meta_${petId}`, updated);
    const agora = new Date();
    return {
      meta: updated,
      historico: {
        id:        `passeio-${Date.now()}`,
        tipo:      'Passeio',
        cor:       'purple',
        hora:      agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data:      agora.toLocaleDateString('pt-BR'),
        descricao: 'Passeio registrado.',
      },
    };
  },
};
