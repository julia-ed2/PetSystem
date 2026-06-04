import { useState } from 'react';
import { CATEGORIAS } from '../../pages/Estoque';
import Campo from '../cadastros/CampoForm';

function ModalNovoProduto({ onClose, onCadastrar }) {
  const [nome,       setNome]  = useState("");
  const [marca,      setMarca] = useState("");
  const [categoria,  setCat]   = useState("");
  const [quantidade, setQty]   = useState("");
  const [preco,      setPreco] = useState("");
  const [loading,    setLoad]  = useState(false);

  const [erro, setErro] = useState("");

  async function handleSubmit() {
    if (!nome || !marca || !categoria || !quantidade || !preco) {
      setErro("Preencha todos os campos."); return;
    }
    setErro("");
    setLoad(true);
    try {
      await onCadastrar({
        nome, marca, categoria,
        quantidade: Number(quantidade),
        precoUnitario: parseFloat(preco),
      });
    } catch (err) {
      setErro(err?.error || err?.message || "Erro ao cadastrar produto.");
    } finally {
      setLoad(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[565px] mx-4 p-6">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-bold text-gray-900">Cadastrar novo produto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="mb-5">
          <label className="text-sm text-gray-800 mb-1.5 block">Nome do produto:</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-sm text-gray-800 mb-1.5 block">Marca:</label>
            <input type="text" value={marca} onChange={e => setMarca(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-sm text-gray-800 mb-1.5 block">Categoria:</label>
            <div className="relative">
              <select value={categoria} onChange={e => setCat(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white appearance-none text-gray-500">
                <option value="" disabled>Selecione a categoria</option>
                {CATEGORIAS.map(c => <option key={c} value={c} className="text-gray-800">{c}</option>)}
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="text-sm text-gray-800 mb-1.5 block">Quantidade:</label>
            <input type="number" min="0" value={quantidade} onChange={e => setQty(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <Campo
              label="Preço unitário (R$):"
              value={preco}
              onChange={(v) => setPreco(v)}
              mask="currency"
            />
          </div>
        </div>

        {erro && <p className="text-sm text-red-600 mb-3 text-center">{erro}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNovoProduto;