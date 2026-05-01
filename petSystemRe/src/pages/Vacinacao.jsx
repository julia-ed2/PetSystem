import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import AnimalCard from '../components/AnimalCard';

/*
 SIMULAÇÃO DE API 
 */
const MOCK_ANIMALS = [
  { id: 1, name: 'Theo', type: 'Cachorro', breed: 'Shih Tzu', tutor: 'Julia Eduarda Fernandes Silva' },
  { id: 2, name: 'Mel', type: 'Cachorro', breed: 'Sem raça definida', tutor: 'Julia Eduarda Fernandes Silva' },
  { id: 3, name: 'Thor', type: 'Cachorro', breed: 'Golden Retriever', tutor: 'Marcos Oliveira' },
  { id: 4, name: 'Luna', type: 'Gato', breed: 'Siamês', tutor: 'Ana Beatriz Souza' },
  { id: 5, name: 'Pipoca', type: 'Gato', breed: 'Persa', tutor: 'Julia Eduarda Fernandes Silva' },
  { id: 6, name: 'Bidu', type: 'Cachorro', breed: 'Poodle', tutor: 'Ricardo Santos' },
];



const ViewVaccination = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [vaccineData, setVaccineData] = useState({
    vaccine: '',
    batch: '',
    appDate: '',
    nextReinforcement: '',
    notes: ''
  });

  // Lógica de busca funcional
  const filteredAnimals = useMemo(() => {
    return MOCK_ANIMALS.filter(animal => 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tutor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVaccineData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = () => {
    if (selectedIds.length === 0) return alert("Selecione pelo menos um animal.");
    
    // Objeto consolidado para o backend
    const payload = {
      animals: selectedIds,
      vaccineInfo: vaccineData
    };
    
    console.log("Enviando para o Backend:", payload);
    alert(`Sucesso! ${selectedIds.length} animais registrados.`);
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
            {filteredAnimals.length > 0 ? (
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
              <select name="vaccine" value={vaccineData.vaccine} onChange={handleInputChange} className={inputClass}>
                <option value="">Selecione a vacina...</option>
                <option value="v10">V10 Felina</option>
                <option value="antirrabica">Antirrábica</option>
                <option value="giardia">Giárdia</option>
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
            className="w-full bg-[#8A2BE2] text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 hover:bg-[#7023b8] transition-all mt-8"
          >
            Registrar animais
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ViewVaccination;
