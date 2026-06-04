import { useEffect, useMemo, useState } from 'react';
import { Search, CalendarDays } from 'lucide-react';
import { tutoresService } from '../../services/tutoresService';
import { petsService } from '../../services/petsService';
import { veterinariosService } from '../../services/veterinariosService';

const FormNewAppointment = ({ onCancel, onSubmit, onGoToAgenda }) => {
  const [formData, setFormData] = useState({
    type: '',
    vetId: '',
    procedure: '',
    tutorSearch: '',
    tutorId: '',
    petId: '',
    date: '',
    time: ''
  });
  const [tutores, setTutores] = useState([]);
  const [pets, setPets] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type) {
      setError('Selecione o tipo de atendimento.');
      return;
    }
    if (!formData.tutorId || !formData.petId || !formData.vetId) {
      setError('Selecione tutor, pet e veterinário.');
      return;
    }
    if (!formData.date) {
      setError('Selecione a data do agendamento.');
      return;
    }
    if (!formData.time) {
      setError('Selecione o horário do agendamento.');
      return;
    }
    setError('');
    try {
      setLoading(true);
      await onSubmit({
        type: formData.type,
        vetId: parseInt(formData.vetId, 10),
        petId: parseInt(formData.petId, 10),
        procedure: formData.procedure,
        date: formData.date,
        time: formData.time,
      });
    } catch (err) {
      setError(err.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-[#8A2BE2] transition-colors text-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2";

  useEffect(() => {
    let active = true;
    const carregar = async () => {
      try {
        setLoading(true);
        const [resTutores, resVets] = await Promise.all([
          tutoresService.list(),
          veterinariosService.list(),
        ]);
        if (!active) return;
        setTutores(resTutores.data || []);
        setVeterinarios(resVets.data || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Erro ao carregar dados do formulário');
      } finally {
        if (active) setLoading(false);
      }
    };
    carregar();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const carregarPets = async () => {
      if (!formData.tutorId) {
        setPets([]);
        return;
      }

      try {
        setLoading(true);
        const resPets = await petsService.list({ tutor_id: formData.tutorId });
        if (!active) return;
        setPets(resPets.data || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Erro ao carregar pets');
      } finally {
        if (active) setLoading(false);
      }
    };
    carregarPets();
    return () => {
      active = false;
    };
  }, [formData.tutorId]);

  const tutoresFiltrados = useMemo(() => {
    const termo = formData.tutorSearch.toLowerCase();
    if (!termo) return tutores;
    return tutores.filter((t) => t.nome.toLowerCase().includes(termo));
  }, [tutores, formData.tutorSearch]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Novo agendamento</h2>
            <p className="text-gray-400 text-sm mt-1">Marque um novo atendimento na agenda com o tipo, horário e profissional</p>
          </div>
          <button
            onClick={onGoToAgenda}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Voltar
          </button>
        </header>

        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 space-y-6 w-full max-w-4xl">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div>
          <label className={labelClass}>Tipo de atendimento (obrigatório):</label>
          <select name="type" required value={formData.type} onChange={handleChange} className={inputClass}>
            <option value="">Selecione o tipo...</option>
            <option value="EXAME">Exame</option>
            <option value="CIRURGIA">Cirurgia</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Veterinário responsável:</label>
          <select
            name="vetId"
            value={formData.vetId}
            onChange={handleChange}
            className={inputClass}
            required
            disabled={loading}
          >
            <option value="">Selecionar veterinário...</option>
            {veterinarios.map((vet) => (
              <option key={vet.id} value={vet.id}>
                {vet.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Descrição / Procedimento:</label>
          <textarea 
            name="procedure" 
            placeholder="Descreva o procedimento..." 
            value={formData.procedure} 
            onChange={handleChange} 
            className={`${inputClass} min-h-[100px] resize-none`}
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Nome do tutor:</label>
            <div className="relative">
              <input 
                name="tutorSearch" 
                type="text" 
                placeholder="Pesquisar tutor..." 
                value={formData.tutorSearch} 
                onChange={handleChange} 
                className={`${inputClass} pl-10`}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            <select
              name="tutorId"
              value={formData.tutorId}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, tutorId: e.target.value, petId: '' }));
              }}
              className={`${inputClass} mt-3`}
              disabled={loading}
            >
              <option value="">Selecionar tutor...</option>
              {tutoresFiltrados.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Animal:</label>
            <select name="petId" value={formData.petId} onChange={handleChange} className={inputClass} disabled={loading || !formData.tutorId}>
              <option value="">Selecionar animal...</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Data e Horário</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Selecione o dia:</label>
              <div className="relative">
                <input 
                  name="date" 
                  type="date" 
                  required
                  value={formData.date} 
                  onChange={handleChange} 
                  className={`${inputClass} pl-10`}
                />
                <CalendarDays className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Horários disponíveis:</label>
              {/* HORARIOS DE ACORDO COM O QUE ELES. TÊM FUTURAMENTE A GENTE PODE RETIRAR OS HORARIOS QUE JA FORAM UTILIZADOS */ }
              <select name="time" required value={formData.time} onChange={handleChange} className={inputClass}>
                <option value="">Selecione o horário...</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 border-2 border-gray-200 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-[#8A2BE2] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-[#7023b8] transition-all"
            disabled={loading}
          >
            Confirmar agendamento
          </button>
        </div>
      </form>
        </div>
    </div>
    </div>
  );
};

export default FormNewAppointment;