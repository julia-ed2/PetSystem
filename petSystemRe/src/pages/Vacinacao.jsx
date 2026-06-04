import React, { useEffect, useMemo, useState } from 'react';
import { Search, AlertCircle, CheckCircle2, Info, Syringe } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { petsService } from '../services/petsService';
import { vacinasService } from '../services/vacinasService';
import { veterinariosService } from '../services/veterinariosService';

// Catálogo baseado nas diretrizes WSAVA 2024/2025
// Usado como fallback quando a API não retorna vacinas cadastradas
const VACINAS_WSAVA = [
  // Cães — Core (recomendadas para todos os cães)
  { id: null, name: 'V8 / Óctupla (CPV + CDV + CAV + Leptospirose)',                especie: 'cão',  tipo: 'core',     intervalo_dias: 365  },
  { id: null, name: 'V10 / Décupla (CPV + CDV + CAV + Leptospirose 6 serogrupos)',  especie: 'cão',  tipo: 'core',     intervalo_dias: 365  },
  { id: null, name: 'V4 / Quádrupla (CPV + CDV + CAV + CPiV, sem Lepto)',           especie: 'cão',  tipo: 'core',     intervalo_dias: 1095 },
  { id: null, name: 'Anti-Rábica Canina',                                            especie: 'cão',  tipo: 'core',     intervalo_dias: 365  },
  { id: null, name: 'Leptospirose Canina',                                           especie: 'cão',  tipo: 'core',     intervalo_dias: 365  },
  // Cães — Não-Core (conforme risco / estilo de vida)
  { id: null, name: 'Tosse dos Canis — Bordetella + Parainfluenza (CPiV)',           especie: 'cão',  tipo: 'non-core', intervalo_dias: 365  },
  { id: null, name: 'Leishmaniose Visceral Canina',                                  especie: 'cão',  tipo: 'non-core', intervalo_dias: 365  },
  { id: null, name: 'Influenza Canina H3N2 / H3N8',                                 especie: 'cão',  tipo: 'non-core', intervalo_dias: 365  },
  { id: null, name: 'Doença de Lyme (Borrelia burgdorferi)',                         especie: 'cão',  tipo: 'non-core', intervalo_dias: 365  },
  // Gatos — Core (recomendadas para todos os gatos)
  { id: null, name: 'Trivalente Felina (FPV + FHV-1 + FCV)',                        especie: 'gato', tipo: 'core',     intervalo_dias: 1095 },
  { id: null, name: 'Quádrupla Felina (FPV + FHV-1 + FCV + FeLV)',                  especie: 'gato', tipo: 'core',     intervalo_dias: 365  },
  { id: null, name: 'Leucemia Felina (FeLV)',                                        especie: 'gato', tipo: 'core',     intervalo_dias: 365  },
  { id: null, name: 'Anti-Rábica Felina',                                            especie: 'gato', tipo: 'core',     intervalo_dias: 365  },
  // Gatos — Não-Core (conforme risco / estilo de vida)
  { id: null, name: 'FIV — Imunodeficiência Felina',                                especie: 'gato',    tipo: 'non-core', intervalo_dias: 365  },
  { id: null, name: 'Clamidiose Felina (Chlamydia felis)',                           especie: 'gato',    tipo: 'non-core', intervalo_dias: 365  },
  { id: null, name: 'Bordetella Felina (intranasal)',                                especie: 'gato',    tipo: 'non-core', intervalo_dias: 365  },
  // Coelhos — Core (recomendadas para todos os coelhos)
  { id: null, name: 'Mixomatose',                                                    especie: 'coelho',  tipo: 'core',     intervalo_dias: 180  },
  { id: null, name: 'Doença Hemorrágica dos Coelhos — RHDV',                         especie: 'coelho',  tipo: 'core',     intervalo_dias: 365  },
  { id: null, name: 'Doença Hemorrágica dos Coelhos Tipo 2 — RHDV2',                 especie: 'coelho',  tipo: 'core',     intervalo_dias: 365  },
  // Pássaros — Core
  { id: null, name: 'Paramixovírus Aviário / Doença de Newcastle',                   especie: 'pássaro', tipo: 'core',     intervalo_dias: 365  },
  // Pássaros — Não-Core (conforme espécie / risco)
  { id: null, name: 'Cólera Aviária — Pasteurella multocida',                        especie: 'pássaro', tipo: 'non-core', intervalo_dias: 180  },
  { id: null, name: 'Doença de Pacheco — Herpesvírus Aviário (psitacídeos)',         especie: 'pássaro', tipo: 'non-core', intervalo_dias: 365  },
  // Roedores — Core (aplicável principalmente a furões)
  { id: null, name: 'Anti-Rábica para Furão',                                        especie: 'roedor',  tipo: 'core',     intervalo_dias: 365  },
  { id: null, name: 'Cinomose Canina em Furão',                                      especie: 'roedor',  tipo: 'core',     intervalo_dias: 365  },
];

const WSAVA_GROUPS = [
  { label: 'Cães · Core — recomendadas para todos',        especie: 'cão',     tipo: 'core'     },
  { label: 'Cães · Não-Core — conforme risco',             especie: 'cão',     tipo: 'non-core' },
  { label: 'Gatos · Core — recomendadas para todos',       especie: 'gato',    tipo: 'core'     },
  { label: 'Gatos · Não-Core — conforme risco',            especie: 'gato',    tipo: 'non-core' },
  { label: 'Coelhos · Core — recomendadas para todos',     especie: 'coelho',  tipo: 'core'     },
  { label: 'Pássaros · Core — recomendadas para todos',    especie: 'pássaro', tipo: 'core'     },
  { label: 'Pássaros · Não-Core — conforme espécie',       especie: 'pássaro', tipo: 'non-core' },
  { label: 'Roedores · Core — furão (Mustela putorius)',   especie: 'roedor',  tipo: 'core'     },
];

function normalizeEspecie(especie) {
  if (!especie) return null;
  const e = especie.toLowerCase();
  if (e.includes('cachorro') || e.includes('cão') || e.includes('cao') || e.includes('canino')) return 'cão';
  if (e.includes('gato') || e.includes('felino')) return 'gato';
  if (e.includes('coelho') || e.includes('rabbit') || e.includes('cunicul')) return 'coelho';
  if (e.includes('pássaro') || e.includes('passaro') || e.includes('ave ') || e === 'ave'
    || e.includes('bird') || e.includes('psitac') || e.includes('calopsita')
    || e.includes('periquito') || e.includes('papagaio') || e.includes('canário')) return 'pássaro';
  if (e.includes('réptil') || e.includes('reptil') || e.includes('serpent')
    || e.includes('lagart') || e.includes('tartaruga') || e.includes('jabuti')) return 'réptil';
  if (e.includes('roedor') || e.includes('hamster') || e.includes('cobaia')
    || e.includes('rato') || e.includes('furão') || e.includes('furao')
    || e.includes('chinchil') || e.includes('porquinho')) return 'roedor';
  return null;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function intervalLabel(dias) {
  if (dias === 365)  return 'Auto-calculado: reforço anual';
  if (dias === 1095) return 'Auto-calculado: reforço a cada 3 anos (WSAVA)';
  return `Auto-calculado: reforço em ${dias} dias`;
}

const EMPTY_FORM = {
  vaccineId: '', batch: '', appDate: '',
  nextReinforcement: '', notes: '', veterinarianId: '',
};

const ViewVaccination = () => {
  const [searchTerm, setSearchTerm]           = useState('');
  const [selectedIds, setSelectedIds]         = useState([]);
  const [vaccineData, setVaccineData]         = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors]         = useState({});
  const [animals, setAnimals]                 = useState([]);
  const [veterinarios, setVeterinarios]       = useState([]);
  const [vacinasCatalogo, setVacinasCatalogo] = useState(VACINAS_WSAVA);
  const [usingApiVacinas, setUsingApiVacinas] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [submitError, setSubmitError]         = useState('');
  const [success, setSuccess]                 = useState('');

  useEffect(() => {
    let active = true;
    const carregar = async () => {
      try {
        setLoading(true);
        const [resPets, resVets, resVacinas] = await Promise.all([
          petsService.list(),
          veterinariosService.list(),
          vacinasService.list().catch(() => ({ success: false })),
        ]);
        if (!active) return;

        setAnimals((resPets.data || []).map((pet) => ({
          id:    pet.id,
          name:  pet.nome,
          type:  pet.especie,
          breed: pet.raca || 'SRD',
          tutor: pet.tutor_nome || 'Tutor',
        })));

        setVeterinarios((resVets.data || []).map((vet) => ({
          id:   vet.id,
          name: vet.nome,
          crmv: vet.crmv,
        })));

        if (resVacinas?.success && Array.isArray(resVacinas.data) && resVacinas.data.length > 0) {
          setVacinasCatalogo(resVacinas.data.map((v) => ({
            id:             v.id || v.id_vacina || null,
            name:           v.nome || v.name,
            intervalo_dias: v.intervalo_dias || null,
            especie:        null,
            tipo:           null,
          })));
          setUsingApiVacinas(true);
        } else {
          setVacinasCatalogo(VACINAS_WSAVA);
          setUsingApiVacinas(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    carregar();
    return () => { active = false; };
  }, []);

  // Espécies detectadas nos animais selecionados
  const detectedSpecies = useMemo(() => {
    const selected = animals.filter(a => selectedIds.includes(a.id));
    const normalized = selected.map(a => normalizeEspecie(a.type)).filter(Boolean);
    return [...new Set(normalized)];
  }, [animals, selectedIds]);

  // Catálogo filtrado por espécie quando aplicável
  const vacinasFiltradas = useMemo(() => {
    if (usingApiVacinas || detectedSpecies.length === 0) return vacinasCatalogo;
    return vacinasCatalogo.filter(v => !v.especie || detectedSpecies.includes(v.especie));
  }, [vacinasCatalogo, usingApiVacinas, detectedSpecies]);

  // Metadados da vacina selecionada (para badge e auto-fill)
  const selectedVacina = useMemo(() => {
    if (!vaccineData.vaccineId) return null;
    return vacinasCatalogo.find(v =>
      (v.id != null && String(v.id) === String(vaccineData.vaccineId)) ||
      (v.id == null && `name:${v.name}` === vaccineData.vaccineId)
    ) || null;
  }, [vaccineData.vaccineId, vacinasCatalogo]);

  const filteredAnimals = useMemo(() =>
    animals.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tutor.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [animals, searchTerm]);

  const clearError = (name) => setFieldErrors(prev => ({ ...prev, [name]: undefined }));

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    clearError('animals');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVaccineData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleVaccineChange = (e) => {
    const value = e.target.value;
    clearError('vaccineId');
    const vacina = vacinasCatalogo.find(v =>
      (v.id != null && String(v.id) === value) ||
      (v.id == null && `name:${v.name}` === value)
    );
    setVaccineData(prev => ({
      ...prev,
      vaccineId: value,
      // Auto-preenche próximo reforço se a data de aplicação já estiver preenchida
      nextReinforcement: vacina?.intervalo_dias && prev.appDate
        ? addDays(prev.appDate, vacina.intervalo_dias)
        : prev.nextReinforcement,
    }));
  };

  const handleAppDateChange = (e) => {
    const value = e.target.value;
    clearError('appDate');
    clearError('nextReinforcement');
    setVaccineData(prev => ({
      ...prev,
      appDate: value,
      // Auto-preenche próximo reforço se uma vacina com intervalo estiver selecionada
      nextReinforcement: selectedVacina?.intervalo_dias && value
        ? addDays(value, selectedVacina.intervalo_dias)
        : prev.nextReinforcement,
    }));
  };

  const validate = () => {
    const errors = {};
    if (selectedIds.length === 0)    errors.animals          = 'Selecione pelo menos um animal';
    if (!vaccineData.vaccineId)      errors.vaccineId        = 'Selecione uma vacina';
    if (!vaccineData.veterinarianId) errors.veterinarianId   = 'Selecione um veterinário';
    if (!vaccineData.appDate)        errors.appDate          = 'Informe a data de aplicação';
    if (vaccineData.appDate && vaccineData.nextReinforcement &&
        vaccineData.nextReinforcement <= vaccineData.appDate) {
      errors.nextReinforcement = 'Deve ser posterior à data de aplicação';
    }
    return errors;
  };

  const handleRegister = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    try {
      setLoading(true);
      setSubmitError('');
      setSuccess('');

      const vaccineValue = vaccineData.vaccineId;
      const vaccineInfo = String(vaccineValue).startsWith('name:')
        ? { name: vaccineValue.replace(/^name:/, '') }
        : { vacina_id: Number(vaccineValue) };

      const payload = {
        veterinarian_id: parseInt(vaccineData.veterinarianId, 10),
        appDate:         vaccineData.appDate,
        next_dose_date:  vaccineData.nextReinforcement || null,
        notes:           vaccineData.notes || '',
        batch:           vaccineData.batch || '',
        ...vaccineInfo,
      };

      const results   = await vacinasService.recordVaccinesMultiple(selectedIds, payload);
      const failCount = results.filter(r => r?.error).length;
      const okCount   = selectedIds.length - failCount;

      if (failCount === 0) {
        setSuccess(`Vacina registrada com sucesso para ${okCount} animal(is)!`);
      } else if (okCount > 0) {
        setSuccess(`${okCount} registro(s) concluído(s). ${failCount} falha(s).`);
      } else {
        setSubmitError('Falha ao registrar vacinas. Verifique os dados e tente novamente.');
      }

      setSelectedIds([]);
      setVaccineData(EMPTY_FORM);
      setFieldErrors({});
    } catch (err) {
      setSubmitError(err.message || 'Erro ao registrar vacinas');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers de estilo ───────────────────────────────────────────────────────

  const inputCls = (hasError) =>
    `w-full bg-white border rounded-xl p-3 outline-none text-sm transition-colors ${
      hasError
        ? 'border-red-400 focus:border-red-500 bg-red-50'
        : 'border-gray-200 focus:border-[#8A2BE2]'
    }`;

  const labelCls = 'block text-sm font-bold text-gray-700 mb-1.5';

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
        <AlertCircle size={11} />
        {fieldErrors[name]}
      </p>
    ) : null;

  const renderVaccineOptions = () => {
    if (usingApiVacinas) {
      return vacinasFiltradas.map((v, idx) => (
        <option key={`api-${v.id ?? idx}`} value={v.id != null ? String(v.id) : `name:${v.name}`}>
          {v.name}
        </option>
      ));
    }
    return WSAVA_GROUPS.map(g => {
      const items = vacinasFiltradas.filter(v => v.especie === g.especie && v.tipo === g.tipo);
      if (items.length === 0) return null;
      return (
        <optgroup key={`${g.especie}-${g.tipo}`} label={g.label}>
          {items.map((v, idx) => (
            <option key={`wsava-${g.especie}-${g.tipo}-${idx}`} value={`name:${v.name}`}>
              {v.name}
            </option>
          ))}
        </optgroup>
      );
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden h-full">
      <header>
        <h2 className="text-3xl font-bold text-gray-800">Vacinação Rápida</h2>
        <p className="text-gray-400 text-sm mt-1">Selecione múltiplos animais para vacinar simultaneamente</p>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">

        {/* ── Esquerda: seleção de animais ──────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 flex flex-col overflow-hidden border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Selecione os animais</h3>
            <span className="bg-purple-100 text-[#8A2BE2] px-4 py-1.5 rounded-full text-sm font-bold">
              {selectedIds.length} selecionados
            </span>
          </div>

          {fieldErrors.animals && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              <AlertCircle size={15} />
              {fieldErrors.animals}
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              <CheckCircle2 size={15} />
              {success}
            </div>
          )}

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Pesquisar por nome do animal ou tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 ring-purple-100 transition-all"
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading && animals.length === 0 ? (
              <div className="text-center py-20 text-gray-400">Carregando animais...</div>
            ) : filteredAnimals.length > 0 ? (
              filteredAnimals.map(animal => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  isSelected={selectedIds.includes(animal.id)}
                  onToggle={toggleSelect}
                />
              ))
            ) : (
              <div className="text-center py-20 text-gray-400">Nenhum animal encontrado.</div>
            )}
          </div>
        </div>

        {/* ── Direita: formulário da vacina ─────────────────────────────────── */}
        <aside className="w-[400px] bg-white shadow-sm rounded-3xl border border-gray-100 flex flex-col shrink-0 overflow-y-auto">

          {/* Cabeçalho do painel */}
          <div className="px-8 pt-8 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <Syringe size={19} className="text-[#8A2BE2]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Dados da Vacina</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Campos com <span className="text-red-400 font-bold">*</span> são obrigatórios
                </p>
              </div>
            </div>

            {/* Badge de espécie detectada */}
            {detectedSpecies.length > 0 && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-purple-50 rounded-xl text-xs text-purple-700 leading-snug">
                <Info size={13} className="mt-0.5 shrink-0" />
                <span>
                  <strong>{selectedIds.length} animal(is)</strong> selecionado(s) ·{' '}
                  <strong>{detectedSpecies.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' + ')}</strong>
                  {' '}— catálogo filtrado por espécie
                </span>
              </div>
            )}
          </div>

          {/* Corpo do formulário */}
          <div className="px-8 py-6 space-y-5 flex-1">

            {/* Vacina */}
            <div>
              <label className={labelCls}>
                Vacina / Imunizante <span className="text-red-400">*</span>
              </label>
              <select
                name="vaccineId"
                value={vaccineData.vaccineId}
                onChange={handleVaccineChange}
                className={inputCls(!!fieldErrors.vaccineId)}
              >
                <option value="">Selecione a vacina...</option>
                {renderVaccineOptions()}
              </select>

              {/* Badge Core / Não-Core */}
              {selectedVacina?.tipo && (
                <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  selectedVacina.tipo === 'core'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedVacina.tipo === 'core'
                    ? '✓ CORE — recomendada para todos'
                    : '⚠ NÃO-CORE — conforme risco'}
                </span>
              )}
              <FieldError name="vaccineId" />
            </div>

            {/* Veterinário */}
            <div>
              <label className={labelCls}>
                Veterinário Responsável <span className="text-red-400">*</span>
              </label>
              <select
                name="veterinarianId"
                value={vaccineData.veterinarianId}
                onChange={handleInputChange}
                className={inputCls(!!fieldErrors.veterinarianId)}
              >
                <option value="">Selecione o veterinário...</option>
                {veterinarios.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name}{vet.crmv ? ` — ${vet.crmv}` : ''}
                  </option>
                ))}
              </select>
              <FieldError name="veterinarianId" />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Data de Aplicação <span className="text-red-400">*</span>
                </label>
                <input
                  name="appDate"
                  type="date"
                  value={vaccineData.appDate}
                  onChange={handleAppDateChange}
                  className={inputCls(!!fieldErrors.appDate)}
                />
                <FieldError name="appDate" />
              </div>
              <div>
                <label className={labelCls}>Próximo Reforço</label>
                <input
                  name="nextReinforcement"
                  type="date"
                  value={vaccineData.nextReinforcement}
                  onChange={handleInputChange}
                  className={inputCls(!!fieldErrors.nextReinforcement)}
                />
                {selectedVacina?.intervalo_dias && !fieldErrors.nextReinforcement && (
                  <p className="text-xs text-purple-500 mt-1.5">
                    {intervalLabel(selectedVacina.intervalo_dias)}
                  </p>
                )}
                <FieldError name="nextReinforcement" />
              </div>
            </div>

            {/* Lote / Fabricante */}
            <div>
              <label className={labelCls}>Lote / Fabricante</label>
              <input
                name="batch"
                type="text"
                placeholder="Ex: LT445522 · MSD Animal Health"
                value={vaccineData.batch}
                onChange={handleInputChange}
                className={inputCls(false)}
              />
            </div>

            {/* Observações */}
            <div>
              <label className={labelCls}>Observações</label>
              <textarea
                name="notes"
                placeholder="Reações, intercorrências, observações clínicas..."
                value={vaccineData.notes}
                onChange={handleInputChange}
                className={`${inputCls(false)} h-24 resize-none`}
                maxLength={500}
              />
              {vaccineData.notes.length > 0 && (
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {vaccineData.notes.length}/500
                </p>
              )}
            </div>
          </div>

          {/* Rodapé com botão */}
          <div className="px-8 pb-8">
            {submitError && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                <AlertCircle size={15} />
                {submitError}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#8A2BE2] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-[#7023b8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Registrando...'
                : selectedIds.length > 0
                  ? `Registrar para ${selectedIds.length} animal(is)`
                  : 'Registrar animais'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ViewVaccination;
