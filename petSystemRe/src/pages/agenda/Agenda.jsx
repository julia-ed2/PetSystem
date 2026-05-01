import React from 'react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon } from 'lucide-react';
import AppointmentCard from '../../components/AppointmentCard';

const ViewAgenda = ({ appointments, loading, onNewAppointment }) => {
  const [viewMode, setViewMode] = useState('mes'); 
  const [currentDate, setCurrentDate] = useState(new Date()); // Controla o mês/semana visível
  const [selectedDate, setSelectedDate] = useState(new Date()); // Data selecionada para a lateral

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const selectedDateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);

  // mes
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({ 
        day: i, 
        dateObj: date,
        dateStr, 
        appointments: appointments.filter(a => a.date === dateStr) 
      });
    }
    return days;
  }, [currentDate, appointments]);

  // semana
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      return {
        dateObj: date,
        dateStr,
        label: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        dayNum: date.getDate(),
        appointments: appointments.filter(a => a.date === dateStr)
      };
    });
  }, [currentDate, appointments]);

  const displayedAppointments = useMemo(() => 
    appointments.filter(app => app.date === selectedDateStr).sort((a,b) => a.time.localeCompare(b.time))
  , [appointments, selectedDateStr]);

  const changePeriod = (offset) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'mes') {
      newDate.setMonth(currentDate.getMonth() + offset);
    } else {
      newDate.setDate(currentDate.getDate() + (offset * 7));
    }
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white m-8 rounded-3xl">
        <div className="w-10 h-10 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden h-full">
      <header className="flex justify-between items-center shrink-0">
        <h2 className="text-3xl font-bold text-gray-800">Agenda de atendimentos</h2>
        <div className="flex items-center gap-4">
          <div className="bg-[#EFEFEF] rounded-xl p-1 flex">
            <button 
              onClick={() => setViewMode('mes')} 
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'mes' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              Mês
            </button>
            <button 
              onClick={() => setViewMode('semana')} 
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${viewMode === 'semana' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              Semana
            </button>
          </div>
          <button onClick={onNewAppointment} className="bg-[#D81B60] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#b0164e]">
            <Plus size={20} /> Novo agendamento
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Calendário Principal */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center gap-8 mb-8 shrink-0">
            <button onClick={() => changePeriod(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft /></button>
            <h3 className="text-2xl font-bold text-gray-700 capitalize">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => changePeriod(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight /></button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {viewMode === 'mes' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-7 mb-2 text-center font-bold text-gray-400 text-xs uppercase tracking-wider">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                <div className="flex-1 grid grid-cols-7 border-t border-l rounded-xl overflow-hidden min-h-0 bg-gray-50/30">
                  {calendarDays.map((day, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => day && setSelectedDate(day.dateObj)}
                      className={`border-r border-b p-2 flex flex-col cursor-pointer transition-colors min-h-[60px] 
                        ${!day ? 'bg-gray-50/50' : 'bg-white hover:bg-purple-50'} 
                        ${day?.dateStr === selectedDateStr ? 'ring-2 ring-[#8A2BE2] ring-inset z-10' : ''}`}
                    >
                      {day && (
                        <>
                          <span className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full 
                            ${day.dateStr === todayStr ? 'bg-[#8A2BE2] text-white' : 'text-gray-400'}`}>
                            {day.day}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {day.appointments.map(a => (
                              <div key={a.id} className={`w-2 h-2 rounded-full ${a.type === 'CIRURGIA' ? 'bg-red-500' : 'bg-blue-500'}`} title={a.patient} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200 border rounded-xl overflow-hidden min-h-0">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="bg-white flex flex-col min-h-0">
                    <div className="p-4 border-b text-center shrink-0">
                       <span className="text-[10px] font-bold text-gray-400 uppercase">{day.label}</span>
                       <div 
                         onClick={() => setSelectedDate(day.dateObj)}
                         className={`mt-1 mx-auto w-10 h-10 flex items-center justify-center rounded-full cursor-pointer font-black text-xl transition-colors
                         ${day.dateStr === selectedDateStr ? 'bg-[#8A2BE2] text-white shadow-lg' : 'text-gray-800 hover:bg-gray-100'}`}>
                         {day.dayNum}
                       </div>
                    </div>
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-gray-50/30">
                      {day.appointments.map(app => (
                        <div key={app.id} className={`p-2 rounded-lg border-l-4 shadow-sm text-[10px] bg-white border-${app.type === 'CIRURGIA' ? 'red' : 'blue'}-500`}>
                           <div className="flex justify-between font-bold">
                             <span className={app.type === 'CIRURGIA' ? 'text-red-600' : 'text-blue-600'}>{app.type}</span>
                             <span>{app.time}</span>
                           </div>
                           <div className="font-bold text-gray-800 text-[11px] mt-1">{app.patient}</div>
                           <div className="text-gray-500 truncate">{app.procedure}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barra Lateral */}
        <aside className="w-80 bg-white p-6 shadow-sm rounded-3xl border border-gray-100 flex flex-col shrink-0">
           <div className="mb-6">
              <h3 className="text-[#8A2BE2] font-black text-lg text-center capitalize">
                {selectedDateStr === todayStr ? 'Hoje' : selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
              </h3>
              <p className="text-center text-gray-400 text-xs font-bold mt-1">
                {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </p>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1">
              {displayedAppointments.length > 0 ? (
                displayedAppointments.map(app => <AppointmentCard key={app.id} {...app} />)
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                   <div className="bg-gray-50 p-4 rounded-full mb-3">
                      <Clock className="text-gray-300" size={32} />
                   </div>
                   <p className="text-gray-400 text-sm font-medium">Nenhum agendamento para este dia.</p>
                </div>
              )}
           </div>
        </aside>
      </div>
    </div>
  );
};

export default ViewAgenda;