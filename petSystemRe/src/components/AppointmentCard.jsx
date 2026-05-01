import { useState } from 'react';

// card de vizualização de agendamentos

const AppointmentCard = ({ appointment, type, time, patient, procedure, doctor, colorClass }) => {
  const item = appointment || { type, time, patient, procedure, doctor, colorClass };
  const itemColorClass = item.colorClass || (item.type === 'CIRURGIA' ? 'border-red-500' : 'border-blue-500');
  const [notified, setNotified] = useState(false);

  return (
    <div className={`relative pl-4 mb-4 border-l-4 ${itemColorClass}`}>
      <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            type === 'EXAME' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-red-600 border-red-200 bg-red-50'
          }`}>
            {type}
          </span>
          <span className="text-gray-900 font-bold text-sm">{time}</span>
        </div>
        <h4 className="font-bold text-gray-800">{patient}</h4>
        <p className="text-xs text-gray-500 mb-1">{procedure}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          {doctor}
        </div>
        <button 
          onClick={() => setNotified(!notified)}
          className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            notified ? 'bg-green-500 text-white' : 'bg-[#8A2BE2] text-white hover:bg-purple-700'
          }`}
        >
          {notified ? 'Chegada Notificada!' : 'Notificar chegada'}
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;

