import { useState } from 'react';
import Campo from '../cadastros/CampoForm';

function ModalRelancarProduto({ produto, onClose, onRelancar }) {
  const [quantidade,  setQty]   = useState("");
  const [preco,       setPreco] = useState(String(produto?.precoUnitario ?? ""));
  const [observacoes, setObs]   = useState("");
  const [loading,     setLoad]  = useState(false);
  const [erro,        setErro]  = useState("");

  async function handleSubmit() {
    if (!quantidade || Number(quantidade) <= 0) {
      setErro("Informe uma quantidade válida."); return;
    }
    setErro("");
    setLoad(true);
    try {
      await onRelancar(produto.id, {
        quantidade: Number(quantidade),
        precoUnitario: preco ? parseFloat(preco) : undefined,
        observacoes: observacoes || undefined,
      });
    } catch (err) {
      setErro(err?.error || err?.message || "Erro ao relançar produto.");
    } finally {
      setLoad(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] mx-4 p-6">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">Relançar produto</h2>
            <p className="text-sm text-gray-500 mt-0.5">{produto?.nome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-5 flex gap-6 text-sm">
          <span className="text-gray-600">Estoque atual: <strong className="text-gray-900">{produto?.quantidade ?? 0} un</strong></span>
          <span className="text-gray-600">Preço atual: <strong className="text-gray-900">R$ {Number(produto?.precoUnitario ?? 0).toFixed(2).replace('.', ',')}</strong></span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-sm text-gray-800 mb-1.5 block">Quantidade a adicionar:</label>
            <input
              type="number" min="1" value={quantidade}
              onChange={e => setQty(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="0"
            />
          </div>
          <div>
            <Campo
              label="Novo preço unitário (R$):"
              value={preco}
              onChange={v => setPreco(v)}
              mask="currency"
            />
            <p className="text-[11px] text-gray-400 mt-1">Deixe em branco para manter o atual</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-800 mb-1.5 block">Observação (opcional):</label>
          <input
            type="text" value={observacoes}
            onChange={e => setObs(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Ex: Reposição mensal, fornecedor X..."
          />
        </div>

        {erro && <p className="text-sm text-red-600 mb-3 text-center">{erro}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            {loading ? "Relançando..." : "Relançar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalRelancarProduto;
