import { useState, useRef, useEffect } from 'react';
import { fmt } from '../../pages/Estoque';

function ModalRegistrarSaida({ produtos, clientes, onClose, onSaida }) {
  const [buscaCliente, setBusca]     = useState("");
  const [clienteSel, setClienteSel]  = useState(null);
  const [showDrop, setShowDrop]      = useState(false);
  const [produtoSel, setProdSel]     = useState("");
  const [quantidade, setQty]         = useState("");
  const [itens, setItens]            = useState([]);
  const [loading, setLoad]           = useState(false);
  const [erro, setErro]              = useState("");
  const clienteRef = useRef(null);

  useEffect(() => {
    const h = e => { if (clienteRef.current && !clienteRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) || c.cpf.includes(buscaCliente)
  );

  function handleAdicionar() {
    if (!produtoSel || !quantidade) { setErro("Selecione o produto e a quantidade."); return; }
    const prod = produtos.find(p => p.id === produtoSel);
    const qty  = Number(quantidade);
    if (qty <= 0) { setErro("Quantidade inválida."); return; }
    const jaReservado = itens.find(i => i.produtoId === produtoSel)?.quantidade || 0;
    if (qty + jaReservado > prod.quantidade) {
      setErro(`Estoque insuficiente. Disponível: ${prod.quantidade - jaReservado}`); return;
    }
    setErro("");

    setItens(prev => {
      const ex = prev.find(i => i.produtoId === produtoSel);
      if (ex) return prev.map(i => i.produtoId === produtoSel
        ? { ...i, quantidade: i.quantidade + qty, total: (i.quantidade + qty) * prod.precoUnitario }
        : i
      );
      return [...prev, {
        produtoId: prod.id, nome: prod.nome,
        quantidade: qty, precoUnitario: prod.precoUnitario,
        total: qty * prod.precoUnitario,
      }];
    });
    setProdSel(""); setQty("");
  }

  function remover(id) { setItens(prev => prev.filter(i => i.produtoId !== id)); }

  const subtotal = itens.reduce((a, i) => a + i.total, 0);

  async function handleRegistrar() {
    if (itens.length === 0) { setErro("Adicione pelo menos um item."); return; }
    setErro("");
    setLoad(true);
    try {
      await onSaida(itens, clienteSel);
    } catch (err) {
      setErro(err?.error || err?.message || "Erro ao registrar saída.");
    } finally {
      setLoad(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[644px] mx-4 p-6 max-h-[95vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-bold text-gray-900">Registrar saída</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Selecionar cliente */}
        <div className="mb-4" ref={clienteRef}>
          <p className="text-sm text-gray-800 mb-2">Selecionar Cliente</p>
          <div className="relative">
            <input type="text"
              value={clienteSel ? clienteSel.nome : buscaCliente}
              onChange={e => { setBusca(e.target.value); setClienteSel(null); setShowDrop(true); }}
              onFocus={() => setShowDrop(true)}
              placeholder="Pesquisar por nome ou cpf..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-gray-300"
            />
            <svg className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {showDrop && clientesFiltrados.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
                {clientesFiltrados.map(c => (
                  <button key={c.id} onClick={() => { setClienteSel(c); setBusca(""); setShowDrop(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors">
                    <span className="font-medium text-gray-800">{c.nome}</span>
                    <span className="text-gray-400 ml-2 text-xs">{c.cpf}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Adicionar item */}
        <div className="bg-purple-100 border border-purple-200 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-purple-600 mb-3">Adicionar item à lista</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-800 mb-1.5 block">Categoria:</label>
              <div className="relative">
                <select value={produtoSel} onChange={e => setProdSel(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white appearance-none text-gray-500">
                  <option value="" disabled>Selecionar produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id} className="text-gray-800">
                      {p.nome} — {p.categoria} (est: {p.quantidade})
                    </option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="w-28">
              <label className="text-sm text-gray-800 mb-1.5 block">Quantidade:</label>
              <input type="number" min="1" value={quantidade} onChange={e => setQty(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
            </div>
            <button onClick={handleAdicionar}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap h-[42px]">
              Adicionar
            </button>
          </div>
        </div>

        {/* Itens na saída */}
        <div className="mb-5">
          <p className="text-sm font-bold text-gray-900 mb-3">Itens na saída</p>
          {itens.length === 0 ? (
            <div className="border border-gray-100 rounded-xl px-4 py-6 text-center">
              <p className="text-sm text-gray-400">Nenhum item adicionado ainda.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {itens.map(item => (
                <div key={item.produtoId} className="flex items-center justify-between px-4 py-3.5 bg-white">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.nome}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.quantidade} un x R$ {fmt(item.precoUnitario)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">R$ {fmt(item.total)}</span>
                    <button onClick={() => remover(item.produtoId)} className="text-red-500 hover:text-red-700 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totais */}
        {itens.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mb-5 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-sm font-bold text-purple-600">{fmt(subtotal)}</span>
            </div>
          </div>
        )}

        {erro && <p className="text-sm text-red-600 mb-3 text-center">{erro}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            Cancelar
          </button>
          <button onClick={handleRegistrar} disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold rounded-2xl py-3.5 text-sm transition-colors">
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalRegistrarSaida;