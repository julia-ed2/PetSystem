import { useState, useEffect, useMemo } from "react";
import { useAuth } from '../hooks/useAuth';
import { tutoresService } from '../services/tutoresService';
import { cadastrarProduto, deletarProduto, listarProdutos, listarSaidas, registrarSaida, relancarProduto } from '../services/estoqueService';
import ModalRegistrarSaida from "../components/estoque/ModalRegistrarSaida";
import ModalNovoProduto from "../components/estoque/ModalNovoProduto";
import ModalRelancarProduto from "../components/estoque/ModalRelancarProduto";


export const CATEGORIAS = ["Ração", "Medicamento", "Higiene", "Acessório", "Outro"];

function SortLabel({ active, direction }) {
    return (
        <span className="text-[10px] font-bold text-gray-400 leading-none">
            {active ? (direction === "asc" ? "▲" : "▼") : ""}
        </span>
    );
}

export function fmt(v) {
    return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const VIEWS = ["Produtos", "Histórico"];

export default function Estoque({ canManage = true }) {
    const { user } = useAuth();
    const [viewAtiva, setViewAtiva] = useState("Produtos");
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [tabAtiva, setTabAtiva] = useState("Todos");
    const [modalNovo, setModalNovo] = useState(false);
    const [modalSaida, setModalSaida] = useState(false);
    const [modalRelancar, setModalRelancar] = useState(null); // produto selecionado ou null
    const podeEscrever = canManage && user?.tipo !== 'cliente';
    const [sortConfig, setSortConfig] = useState({ key: "nome", direction: "asc" });

    function handleSort(key) {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    }

    async function carregarDados() {
        setLoading(true);
        const [prods, cls, hist] = await Promise.all([
            listarProdutos(),
            tutoresService.list(),
            listarSaidas(),
        ]);
        setProdutos(prods || []);
        setClientes((cls.data || []).map((tutor) => ({
            id: tutor.id,
            nome: tutor.nome,
            cpf: tutor.cpf,
        })));
        setHistorico(hist || []);
        setLoading(false);
    }

    useEffect(() => { carregarDados(); }, []);

    // total de itens = soma da quantidade de TODOS os produtos
    const totalItens = produtos.reduce((a, p) => a + p.quantidade, 0);
    // valor em estoque = soma de (qtd * preço) de TODOS os produtos
    const valorEstoque = produtos.reduce((a, p) => a + p.quantidade * p.precoUnitario, 0);
    const tabs = ["Todos", ...CATEGORIAS];

    const produtosFiltrados = useMemo(() => {
        const t = busca.toLowerCase();
        const filtrados = produtos.filter(p => {
            const matchBusca = !busca ||
                p.nome.toLowerCase().includes(t) ||
                p.marca.toLowerCase().includes(t) ||
                p.categoria.toLowerCase().includes(t);
            const matchTab = tabAtiva === "Todos" || p.categoria === tabAtiva;
            return matchBusca && matchTab;
        });
        const factor = sortConfig.direction === "asc" ? 1 : -1;
        return [...filtrados].sort((a, b) => {
            if (sortConfig.key === "totalEstoque")
                return (a.quantidade * a.precoUnitario - b.quantidade * b.precoUnitario) * factor;
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === "number") return (aVal - bVal) * factor;
            return String(aVal || "").localeCompare(String(bVal || ""), "pt-BR") * factor;
        });
    }, [produtos, busca, tabAtiva, sortConfig]);

    async function handleCadastrar(novo) {
        try {
            const produtoAdicionado = await cadastrarProduto(novo);
            setProdutos(prev => [...prev, produtoAdicionado]);
            setModalNovo(false);
        } catch (err) {
            console.error("Erro ao cadastrar produto:", err);
            throw err;
        }
    }

    const podeRemover = user?.tipo === 'admin' || user?.tipo === 'gerente';

    async function handleRelancar(id, dados) {
        try {
            const produtoAtualizado = await relancarProduto(id, dados);
            setProdutos(prev => prev.map(p => p.id === id ? produtoAtualizado : p));
            setHistorico(await listarSaidas());
            setModalRelancar(null);
        } catch (err) {
            console.error("Erro ao relançar produto:", err);
            throw err;
        }
    }

    async function handleDeletar(id) {
        if (!window.confirm('Remover produto do estoque?')) return;
        try {
            await deletarProduto(id);
            setProdutos(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert(err?.error || err?.message || 'Erro ao remover produto.');
        }
    }

    async function handleSaida(itens, cliente) {
        try {
            const resultado = await registrarSaida(itens, cliente || null);
            setProdutos(resultado.produtos.length ? resultado.produtos : await listarProdutos());
            setHistorico(await listarSaidas());
            setModalSaida(false);
        } catch (err) {
            console.error("Erro ao registrar saída:", err);
            throw err;
        }
    }

    return (
        <div className="flex-1 min-h-screen bg-gray-100">
            <div className="px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Estoque e produtos</h1>
                    <div className="flex gap-1 bg-gray-200 rounded-xl p-1">
                        {VIEWS.map(v => (
                            <button key={v} onClick={() => setViewAtiva(v)}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${viewAtiva === v ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
                {viewAtiva === "Produtos" && (<>
                <div className="flex gap-4 mb-6 items-stretch">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-5 w-[310px] flex-shrink-0">
                        <p className="text-sm font-semibold text-purple-600 mb-2">Total de itens</p>
                        <p className="text-[40px] font-bold text-gray-900 leading-none">
                            {loading ? <span className="text-gray-300">—</span> : totalItens}
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-5 flex-1">
                        <p className="text-sm font-semibold text-purple-600 mb-2">Valor em estoque</p>
                        <p className="text-[40px] font-bold text-gray-900 leading-none">
                            {loading ? <span className="text-gray-300">—</span> : `R$ ${fmt(valorEstoque)}`}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 justify-center flex-shrink-0">
                        {podeEscrever && <button onClick={() => setModalNovo(true)}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                            Novo produto
                        </button>}
                        {podeEscrever && <button onClick={() => setModalSaida(true)}
                            className="bg-white hover:bg-pink-50 text-pink-500 font-bold text-sm px-6 py-3 rounded-xl transition-colors border-2 border-pink-400 whitespace-nowrap">
                            Registrar saída
                        </button>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 gap-4 flex-wrap">
                        <div className="flex items-center gap-1 flex-wrap">
                            {tabs.map(tab => (
                                <button key={tab} onClick={() => setTabAtiva(tab)}
                                    className={`text-sm px-4 py-1.5 font-semibold transition-colors rounded-lg ${tabAtiva === tab ? "text-purple-700" : "text-gray-500 hover:text-gray-700"
                                        }`}>
                                    {tab === "Todos" ? "Todos os produtos" : `${tab}s`}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
                                    placeholder="Pesquisar..."
                                    className="border border-gray-200 rounded-full pl-4 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 w-56 placeholder:text-gray-300 bg-white" />
                                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-5 py-3 border-t border-b border-gray-100 bg-white">
                        <button type="button" onClick={() => handleSort("nome")} className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[30%] flex items-center gap-1">
                            <span>Produto</span><SortLabel active={sortConfig.key === "nome"} direction={sortConfig.direction} />
                        </button>
                        <button type="button" onClick={() => handleSort("marca")} className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[18%] flex items-center gap-1">
                            <span>Marca</span><SortLabel active={sortConfig.key === "marca"} direction={sortConfig.direction} />
                        </button>
                        <button type="button" onClick={() => handleSort("categoria")} className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[14%] flex items-center gap-1">
                            <span>Categoria</span><SortLabel active={sortConfig.key === "categoria"} direction={sortConfig.direction} />
                        </button>
                        <button type="button" onClick={() => handleSort("quantidade")} className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[10%] flex items-center justify-center gap-1">
                            <span>Quantidade</span><SortLabel active={sortConfig.key === "quantidade"} direction={sortConfig.direction} />
                        </button>
                        <button type="button" onClick={() => handleSort("precoUnitario")} className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[13%] flex items-center justify-end gap-1">
                            <span>Preço Un.</span><SortLabel active={sortConfig.key === "precoUnitario"} direction={sortConfig.direction} />
                        </button>
                        <button type="button" onClick={() => handleSort("totalEstoque")} className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[15%] flex items-center justify-end gap-1">
                            <span>Total Estoq.</span><SortLabel active={sortConfig.key === "totalEstoque"} direction={sortConfig.direction} />
                        </button>
                        {podeEscrever && <span className="w-[8%]" />}
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : produtosFiltrados.length === 0 ? (
                        <div className="text-center py-14 text-gray-400 text-sm">Nenhum produto encontrado.</div>
                    ) : (
                        produtosFiltrados.map((p, i) => (
                            <div key={p.id}
                                className={`flex justify-between items-center px-5 py-4 bg-white transition-colors hover:bg-gray-50 ${i < produtosFiltrados.length - 1 ? "border-b border-gray-100" : ""
                                    }`}
                            >
                                <span className="text-[14px] text-gray-800 w-[30%]">{p.nome}</span>
                                <span className="text-[14px] text-gray-600 w-[18%]">{p.marca}</span>
                                <span className="text-[14px] text-gray-600 w-[14%]">{p.categoria}</span>
                                <span className="text-[14px] text-gray-800 w-[10%] text-center">{p.quantidade}</span>
                                <span className="text-[14px] text-gray-600 w-[13%] text-right">{fmt(p.precoUnitario)}</span>
                                <span className="text-[14px] font-medium text-gray-800 w-[15%] text-right">
                                    {fmt(p.quantidade * p.precoUnitario)}
                                </span>
                                {podeEscrever && (
                                    <div className="w-[8%] flex justify-end items-center gap-1.5">
                                        <button onClick={() => setModalRelancar(p)}
                                            className="text-purple-400 hover:text-purple-600 transition-colors"
                                            title="Relançar produto">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.07-6.07-.71.71M5.64 18.36l-.71.71M18.36 18.36l-.71-.71M5.64 5.64l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                            </svg>
                                        </button>
                                        {podeRemover && (
                                            <button onClick={() => handleDeletar(p.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                title="Remover produto">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                </>)}

                {viewAtiva === "Histórico" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[22%]">Produto</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[12%]">Tipo</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[10%] text-center">Qtd</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[20%]">Usuário</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[20%]">Data/Hora</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[16%]">Observação</span>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : historico.length === 0 ? (
                        <div className="text-center py-14 text-gray-400 text-sm">Nenhuma movimentação registrada.</div>
                    ) : (
                        historico.map((h, i) => {
                            const isEntrada = h.tipo === 'entrada';
                            const dataHora = h.dataHora ? new Date(h.dataHora).toLocaleString('pt-BR') : '—';
                            return (
                                <div key={h.id ?? i}
                                    className={`flex justify-between items-center px-5 py-4 bg-white transition-colors hover:bg-gray-50 ${i < historico.length - 1 ? "border-b border-gray-100" : ""}`}>
                                    <span className="text-[14px] text-gray-800 w-[22%]">{h.produtoNome || '—'}</span>
                                    <span className={`text-[13px] font-semibold w-[12%] ${isEntrada ? 'text-green-600' : 'text-red-500'}`}>
                                        {isEntrada ? 'Entrada' : 'Saída'}
                                    </span>
                                    <span className={`text-[14px] font-bold w-[10%] text-center ${isEntrada ? 'text-green-600' : 'text-red-500'}`}>
                                        {isEntrada ? '+' : '-'}{h.quantidade}
                                    </span>
                                    <span className="text-[13px] text-gray-600 w-[20%]">{h.usuarioNome || '—'}</span>
                                    <span className="text-[13px] text-gray-500 w-[20%]">{dataHora}</span>
                                    <span className="text-[13px] text-gray-400 w-[16%] truncate" title={h.observacoes}>{h.observacoes || '—'}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
            </div>{/* /px-8 py-8 */}

            {modalNovo && podeEscrever && (
                <ModalNovoProduto
                    onClose={() => setModalNovo(false)}
                    onCadastrar={handleCadastrar}
                />
            )}
            {modalSaida && podeEscrever && (
                <ModalRegistrarSaida
                    produtos={produtos}
                    clientes={clientes}
                    onClose={() => setModalSaida(false)}
                    onSaida={handleSaida}
                />
            )}
            {modalRelancar && podeEscrever && (
                <ModalRelancarProduto
                    produto={modalRelancar}
                    onClose={() => setModalRelancar(null)}
                    onRelancar={handleRelancar}
                />
            )}
        </div>
    );
}