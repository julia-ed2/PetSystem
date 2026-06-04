// Card de item do histórico 
function HistoricoCard({ item }) {
  return (
    <div className="flex gap-4 items-stretch">
      {/* Timeline desing */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-600 bg-white flex-shrink-0 mt-1" />
        <div className="w-0.5 bg-purple-200 flex-1 mt-1" />
      </div>

      {/* Card */}
      <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-4">
        <div className="flex justify-between gap-4">
          <div className="flex-1">
            <p className="text-purple-600 font-semibold text-sm">{item.tipo}</p>
            <p className="text-gray-500 text-xs mt-0.5">{item.data} • {item.hora}</p>
            <p className="text-gray-700 text-sm mt-2">{item.descricao}</p>
            {item.proximoReforcao && (
              <p className="text-gray-500 text-xs mt-1">Próximo reforço em {item.proximoReforcao}</p>
            )}
          </div>
          <div className="text-right min-w-[140px]">
            <p className="text-gray-700 text-sm flex items-center justify-end gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {item.veterinario}
            </p>
            {item.observacoes && (
              <div className="mt-2">
                <p className="text-gray-700 text-xs font-semibold">Observações:</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.observacoes}</p>
              </div>
            )}
            {item.arquivo && (
              <button className="mt-2 inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full hover:bg-purple-700 transition-colors">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                {item.arquivo}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoricoCard;