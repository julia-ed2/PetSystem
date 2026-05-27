import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';
import { petsService } from '../services/petsService';
import { vacinasService } from '../services/vacinasService';
import { veterinariosService } from '../services/veterinariosService';

const FALLBACK_VACINAS = [
  { id: null, name: 'V4 (Tríplice + Parvovirose)' },
  { id: null, name: 'V5 (Tríplice + Parvovirose + Raiva)' },
  { id: null, name: 'Raiva' },
  { id: null, name: 'Tríplice Felina' },
  { id: null, name: 'Leucemia Felina' },
];

const ViewVaccination = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [vaccineData, setVaccineData] = useState({
    vaccineId: '', // either vacina_id or fallback 'name:...'
    vaccineName: '',
    batch: '',
    appDate: '',
    nextReinforcement: '',
    notes: '',
    veterinarianId: ''
  });
  const [animals, setAnimals] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [vacinasCatalogo, setVacinasCatalogo] = useState(FALLBACK_VACINAS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    const carregar = async () => {
      try {
        setLoading(true);
        setError('');

        const [resPets, resVets, resVacinas] = await Promise.all([
          petsService.list(),
          veterinariosService.list(),
          vacinasService.list().catch(() => ({ success: false })),
        ]);

        if (!active) return;

        setAnimals((resPets.data || []).map((pet) => ({
          id: pet.id,
          name: pet.nome,
          type: pet.especie,
          breed: pet.raca || 'SRD',
          tutor: pet.tutor_nome || 'Tutor',
        })));

        setVeterinarios((resVets.data || []).map((vet) => ({
          id: vet.id,
          name: vet.nome,
          crmv: vet.crmv,
        })));
        if (resVacinas && resVacinas.success && Array.isArray(resVacinas.data) && resVacinas.data.length > 0) {
          setVacinasCatalogo((resVacinas.data || []).map((v) => ({ id: v.id || v.id_vacina || null, name: v.nome || v.name })));
        } else {
          setVacinasCatalogo(FALLBACK_VACINAS);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Erro ao carregar animais');
      } finally {
        if (active) setLoading(false);
      }
    };
    carregar();
    return () => {
      active = false;
    };
  }, []);

  const filteredAnimals = useMemo(() => {
    return animals.filter(animal => 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tutor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [animals, searchTerm]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVaccineData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (selectedIds.length === 0) return alert("Selecione pelo menos um animal.");
    const selectedVaccineRaw = vaccineData.vaccineId;
    const isVaccineSelected = selectedVaccineRaw && (String(selectedVaccineRaw).startsWith('name:') || Number(selectedVaccineRaw) > 0);
    if (!isVaccineSelected || !vaccineData.veterinarianId) {
      setError('Informe vacina e veterinário.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payloadTemplate = {
        veterinarian_id: parseInt(vaccineData.veterinarianId, 10),
        appDate: vaccineData.appDate || null,
        next_dose_date: vaccineData.nextReinforcement || null,
        notes: vaccineData.notes || '',
        batch: vaccineData.batch || '',
      };

      const vaccineValue = selectedVaccineRaw;
      const vaccineInfo = {};
      if (String(vaccineValue).startsWith('name:')) {
        vaccineInfo.name = String(vaccineValue).replace(/^name:/, '');
      } else {
        const id = Number(vaccineValue);
        if (!Number.isNaN(id) && id > 0) vaccineInfo.vacina_id = id;
      }

      const finalPayload = { ...payloadTemplate, ...vaccineInfo };

      await vacinasService.recordVaccinesMultiple(selectedIds, finalPayload);

      setSuccess(`Sucesso! ${selectedIds.length} animais registrados.`);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || 'Erro ao registrar vacinas');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-[#8A2BE2] transition-colors text-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2";

  return (
    <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden h-full">
        <header>
        <h2 className="text-3xl font-bold text-gray-800">Vacinação Rápida</h2>
        <p className="text-gray-400 text-sm mt-1">Selecione múltiplos animais para vacinar simultaneamente</p>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* LADO ESQUERDO: SELEÇÃO DE ANIMAIS */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 flex flex-col overflow-hidden border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Selecione os animais</h3>
            <span className="bg-purple-100 text-[#8A2BE2] px-4 py-1.5 rounded-full text-sm font-bold">
              {selectedIds.length} selecionados
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
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
            {loading ? (
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

        {/* LADO DIREITO: FORMULÁRIO DA VACINA */}
        <aside className="w-[380px] bg-white p-8 shadow-sm rounded-3xl border border-gray-100 flex flex-col shrink-0 overflow-y-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Dados da vacina</h3>
          
          <div className="space-y-5 flex-1">
            <div>
              <label className={labelClass}>Vacina/ Imunizante:</label>
              <select name="vaccineId" value={vaccineData.vaccineId} onChange={(e) => {
                const v = e.target.value;
                // if value starts with "name:" it's a fallback name, otherwise numeric id
                setVaccineData(prev => ({ ...prev, vaccineId: v, vaccineName: v && String(v).startsWith('name:') ? v.replace(/^name:/, '') : '' }));
              }} className={inputClass}>
                <option value="">Selecione a vacina...</option>
                {vacinasCatalogo.map((vacina, idx) => (
                  <option key={`${vacina.id ?? 'x'}-${idx}`} value={vacina.id ? vacina.id : `name:${vacina.name}`}>
                    {vacina.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Veterinário:</label>
              <select
                name="veterinarianId"
                value={vaccineData.veterinarianId}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Selecione o veterinário...</option>
                {veterinarios.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name} ({vet.crmv})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Lote/ fabricante:</label>
              <input 
                name="batch"
                type="text" 
                placeholder="Ex: LT445522" 
                value={vaccineData.batch}
                onChange={handleInputChange}
                className={inputClass} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Data aplic.:</label>
                <div className="relative">
                  <input 
                    name="appDate"
                    type="date" 
                    value={vaccineData.appDate}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-3 text-xs`} 
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Prox. reforço:</label>
                <div className="relative">
                  <input 
                    name="nextReinforcement"
                    type="date" 
                    value={vaccineData.nextReinforcement}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-3 text-xs`} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Observações:</label>
              <textarea 
                name="notes"
                placeholder="Notas adicionais para todos os animais..." 
                value={vaccineData.notes}
                onChange={handleInputChange}
                className={`${inputClass} h-32 resize-none`}
              />
            </div>
          </div>

          <button 
            onClick={handleRegister}
            className="w-full bg-[#8A2BE2] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-[#7023b8] transition-all mt-8 disabled:opacity-50"
            disabled={loading}
          >
            Registrar animais
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ViewVaccination;
