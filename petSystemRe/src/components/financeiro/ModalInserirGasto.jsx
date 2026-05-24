import { useState } from 'react';
import Campo from '../cadastros/CampoForm';

const CATEGORIAS_RECEITA = ["Consulta","Vacina","Cirurgia","Exame","Outro"];
const CATEGORIAS_GASTO = ["Gasto","Insumo","Equipamento","Funcionário","Outro"];
const STATUS_OPS = ["Pago","Pendente","Cancelado"];

function ModalInserirGasto({ onClose, onInserir }) {
  const [descricao,  setDesc]   = useState("");
  const [data,       setData]   = useState("");
  const [categoria,  setCat]    = useState("");
  const [valor,      setValor]  = useState("");
  const [status,     setStatus] = useState("");
  const [loading,    setLoad]   = useState(false);

  async function handleInserir() {
    if (!descricao || !data || !categoria || !valor || !status) {
      alert("Preencha todos os campos."); return;
    }
    setLoad(true);
    // dd/mm/yyyy
    const [y, m, d] = data.split("-");
    const dataFmt = `${d}/${m}/${y}`;
    const tipo = CATEGORIAS_GASTO.includes(categoria) && categoria !== "Outro" ? "gasto" : "receita";
    const novo = {
      descricao,
      data: dataFmt,
      categoria,
      valor: parseFloat(valor),
      status,
      tipo,
    };
    setLoad(false);
    onInserir(novo);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[565px] mx-4 p-6">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-bold text-gray-900">Inserir gasto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="mb-5">
          <label className="text-sm text-gray-800 mb-1.5 block">Descrição:</label>
          <input type="text" value={descricao} onChange={e => setDesc(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-sm text-gray-800 mb-1.5 block">Data:</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-sm text-gray-800 mb-1.5 block">Categoria:</label>
            <div className="relative">
              <select value={categoria} onChange={e => setCat(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white appearance-none text-gray-500">
                <option value="" disabled>Selecione a categoria</option>
                <optgroup label="Receitas">
                  {CATEGORIAS_RECEITA.map(c => <option key={c} value={c} className="text-gray-800">{c}</option>)}
                </optgroup>
                <optgroup label="Gastos">
                  {CATEGORIAS_GASTO.map(c => <option key={c} value={c} className="text-gray-800">{c}</option>)}
                </optgroup>
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <Campo
              label="Valor (R$):"
              value={valor}
              onChange={(v) => setValor(v)}
              mask="currency"
            />
          </div>
          <div>
            <label className="text-sm text-gray-800 mb-1.5 block">Status:</label>
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white appearance-none text-gray-500">
                <option value="" disabled></option>
                {STATUS_OPS.map(s => <option key={s} value={s} className="text-gray-800">{s}</option>)}
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={handleInserir} disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            {loading ? "Inserindo..." : "Inserir"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalInserirGasto;