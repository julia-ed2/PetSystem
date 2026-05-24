import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ChevronRight, Filter, Plus, X, Check } from 'lucide-react';
import AnimalCard from '../../components/AnimalCard';


// teste
const MOCK_PRONTUARIOS = [
  { 
    id: 1, 
    animalName: 'Theo', 
    species: 'Cachorro', 
    breed: 'Shih Tzu', 
    tutor: 'Julia Eduarda Fernandes Silva', 
    lastVisit: '12/04/2026', 
    status: 'Ativo',
    avatarColor: 'bg-blue-100 text-blue-600'
  },
  { 
    id: 2, 
    animalName: 'Mel', 
    species: 'Cachorro', 
    breed: 'SRD', 
    tutor: 'Julia Eduarda Fernandes Silva', 
    lastVisit: '10/04/2026', 
    status: 'Ativo',
    avatarColor: 'bg-purple-100 text-purple-600'
  },
  { 
    id: 3, 
    animalName: 'Luna', 
    species: 'Gato', 
    breed: 'Siamês', 
    tutor: 'Ana Beatriz Souza', 
    lastVisit: '05/04/2026', 
    status: 'Ativo',
    avatarColor: 'bg-pink-100 text-pink-600'
  },
  { 
    id: 4, 
    animalName: 'Thor', 
    species: 'Cachorro', 
    breed: 'Golden Retriever', 
    tutor: 'Marcos Oliveira', 
    lastVisit: '28/03/2026', 
    status: 'Inativo',
    avatarColor: 'bg-orange-100 text-orange-600'
  },
  { 
    id: 5, 
    animalName: 'Pipoca', 
    species: 'Gato', 
    breed: 'Persa', 
    tutor: 'Julia Eduarda Fernandes Silva', 
    lastVisit: '15/03/2026', 
    status: 'Ativo',
    avatarColor: 'bg-yellow-100 text-yellow-600'
  },
  { 
    id: 6, 
    animalName: 'Bidu', 
    species: 'Cachorro', 
    breed: 'Poodle', 
    tutor: 'Ricardo Santos', 
    lastVisit: '01/03/2026', 
    status: 'Ativo',
    avatarColor: 'bg-green-100 text-green-600'
  }
];

const ViewProntuarios = ({ onOpenRecord }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  

  const [filterSpecies, setFilterSpecies] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredRecords = useMemo(() => {
    return MOCK_PRONTUARIOS.filter(record => {
      const matchesSearch = 
        record.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.species.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecies = filterSpecies === 'Todos' || record.species === filterSpecies;
      const matchesStatus = filterStatus === 'Todos' || record.status === filterStatus;

      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [searchTerm, filterSpecies, filterStatus]);

  const activeFiltersCount = (filterSpecies !== 'Todos' ? 1 : 0) + (filterStatus !== 'Todos' ? 1 : 0);

  return (
    <div className="flex-1 bg-[#F0F2F5] min-h-screen p-8 flex flex-col gap-8 relative overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Prontuários Médicos</h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">Consulte e gira o histórico de saúde de todos os pacientes</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder="Pesquisar por nome do pet, tutor ou espécie..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-none rounded-2xl p-4 pl-14 outline-none shadow-sm focus:ring-2 ring-purple-200 transition-all text-gray-700 placeholder:text-gray-300"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-2xl shadow-sm transition-all flex items-center gap-2 font-bold px-6 border-2
              ${showFilters || activeFiltersCount > 0 
                ? 'bg-purple-50 border-[#8A2BE2] text-[#8A2BE2]' 
                : 'bg-white border-transparent text-gray-400 hover:text-[#8A2BE2]'}`}
          >
            <Filter size={20} /> 
            <span className="hidden md:inline text-sm">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-[#8A2BE2] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-gray-800">Filtrar por</h4>
                <button onClick={() => setShowFilters(false)} className="text-gray-300 hover:text-gray-500">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* filtro espécie */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Espécie</p>
                  <div className="flex flex-wrap gap-2">
                    {['Todos', 'Cachorro', 'Gato'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFilterSpecies(opt)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                          ${filterSpecies === opt 
                            ? 'bg-[#8A2BE2] text-white border-[#8A2BE2]' 
                            : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* filtro status */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['Todos', 'Ativo', 'Inativo'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setFilterStatus(opt)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                          ${filterStatus === opt 
                            ? 'bg-[#8A2BE2] text-white border-[#8A2BE2]' 
                            : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-200'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-50 flex gap-2">
                <button 
                  onClick={() => { setFilterSpecies('Todos'); setFilterStatus('Todos'); }}
                  className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Limpar
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(filterSpecies !== 'Todos' || filterStatus !== 'Todos') && (
        <div className="flex gap-2 flex-wrap -mt-4">
          {filterSpecies !== 'Todos' && (
            <span className="bg-purple-50 text-[#8A2BE2] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
              Espécie: {filterSpecies}
              <X size={12} className="cursor-pointer" onClick={() => setFilterSpecies('Todos')} />
            </span>
          )}
          {filterStatus !== 'Todos' && (
            <span className="bg-purple-50 text-[#8A2BE2] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
              Status: {filterStatus}
              <X size={12} className="cursor-pointer" onClick={() => setFilterStatus('Todos')} />
            </span>
          )}
        </div>
      )}

      {/* listagem */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <AnimalCard
              key={record.id}
              animal={{
                id: record.id,
                name: record.animalName,
                type: record.species,
                breed: record.breed,
                tutor: record.tutor,
              }}
                onClick={() => navigate(`/dashboard/prontuarios/${record.id}`)}
                showChevron
                hoverable
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <FileText className="text-gray-200" size={48} />
            </div>
            <h4 className="text-xl font-bold text-gray-400">Nenhum prontuário encontrado</h4>
            <p className="text-gray-300 text-sm max-w-xs mt-2">
              Tente ajustar a sua pesquisa ou os filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProntuarios;