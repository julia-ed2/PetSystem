import { Heart, Check } from 'lucide-react';

const AnimalCard = ({ animal, isSelected = false, onToggle, onClick, onVerProntuario, onRemove, showChevron = false, hoverable = false }) => {
  const handleCardClick = () => {
    if (onToggle) return onToggle(animal.id);
    if (onClick) return onClick(animal);
  };

  const canClick = Boolean(onToggle || onClick);
  const shouldShowChevron = showChevron && !onVerProntuario && !onRemove;
  const rootInteractiveClass = (canClick || hoverable) ? 'cursor-pointer group' : '';

  return (
    <div
      onClick={canClick ? handleCardClick : undefined}
      className={`relative p-5 mb-3 rounded-2xl border-2 transition-all flex items-center justify-between
        ${isSelected ? 'bg-purple-50 border-[#8A2BE2] shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-200'}
        ${rootInteractiveClass} ${hoverable ? 'hover:bg-gray-50 hover:shadow-md' : ''}`}
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
      
      {(onVerProntuario || onRemove) ? (
        <div className="flex items-center gap-2">
          {onVerProntuario && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onVerProntuario(animal);
              }}
              className="text-xs text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors whitespace-nowrap"
            >
              Ver prontuário
            </button>
          )}
          {onRemove && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRemove(animal.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover animal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        shouldShowChevron ? (
          <div className={`text-gray-400 text-xl font-bold ${hoverable ? 'group-hover:text-[#8A2BE2] transition-colors' : ''}`}>
            {'>'}
          </div>
        ) : (
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
            ${isSelected ? 'bg-[#8A2BE2] border-[#8A2BE2]' : 'bg-white border-gray-200'}`}>
            {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
          </div>
        )
      )}
    </div>
  );
};

export default AnimalCard;