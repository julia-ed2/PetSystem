import { useState, useRef, useEffect } from "react";

const TIPOS_ACESSO = {
  CLIENTE: "Cliente",
  USUARIO: "Usuário",
  ADMINISTRADOR: "Administrador",
};

function FiltroDropdown({ isAdmin, filtroTipo, onChange }) {
  const [open, setOpen] = useState(false);
  const [tipoLocal, setTipoLocal] = useState(filtroTipo);
  const ref = useRef(null);

  const tipos = isAdmin
    ? ["Todos", TIPOS_ACESSO.CLIENTE, TIPOS_ACESSO.USUARIO, TIPOS_ACESSO.ADMINISTRADOR]
    : ["Todos", TIPOS_ACESSO.CLIENTE];

  const ativo = filtroTipo !== "Todos";

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // sync local when closed externally (clear)
  useEffect(() => { setTipoLocal(filtroTipo); }, [filtroTipo]);

  function handleAplicar() {
    onChange(tipoLocal);
    setOpen(false);
  }

  function handleLimpar() {
    setTipoLocal("Todos");
    onChange("Todos");
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-4 rounded-2xl shadow-sm transition-all flex items-center gap-2 font-bold px-6 border-2
          ${open || ativo
            ? "bg-purple-50 border-[#8A2BE2] text-[#8A2BE2]"
            : "bg-white border-transparent text-gray-400 hover:text-[#8A2BE2]"}`}
      >
        {/* Filter icon */}
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V15a1 1 0 01-.553.894l-4 2A1 1 0 017 17v-6.586L3.293 6.707A1 1 0 013 6V3z" />
        </svg>
        <span className="hidden md:inline text-sm">Filtros</span>
        {ativo && (
          <span className="ml-1 bg-[#8A2BE2] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
            1
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-50">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-gray-800">Filtrar por</h4>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tipo de acesso</p>
            <div className="flex flex-wrap gap-2">
              {tipos.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoLocal(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                    ${tipoLocal === t
                      ? "bg-[#8A2BE2] text-white border-[#8A2BE2]"
                      : "bg-gray-50 text-gray-500 border-transparent hover:border-gray-200"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-50 flex gap-2">
            <button
              onClick={handleLimpar}
              className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleAplicar}
              className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FiltroDropdown;