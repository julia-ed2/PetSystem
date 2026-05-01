import { Heart, Check } from 'lucide-react';

const AnimalCard = ({ animal, isSelected, onToggle }) => {
  return (
    <div 
      onClick={() => onToggle(animal.id)}
      className={`relative p-5 mb-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between
        ${isSelected 
          ? 'bg-purple-50 border-[#8A2BE2] shadow-sm' 
          : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Heart size={16} className={isSelected ? 'text-[#8A2BE2] fill-[#8A2BE2]' : 'text-gray-400'} />
          <span className="font-bold text-gray-800 text-lg">{animal.name}</span>
          <span className="text-sm text-gray-500 font-medium">{animal.type} - {animal.breed}</span>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-bold text-gray-600">Tutor(a):</span> {animal.tutor}
        </div>
      </div>
      
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
        ${isSelected ? 'bg-[#8A2BE2] border-[#8A2BE2]' : 'bg-white border-gray-200'}`}>
        {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
      </div>
    </div>
  );
};

export default AnimalCard;