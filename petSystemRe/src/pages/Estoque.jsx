import { useState, useEffect, useRef } from "react";
import ModalRegistrarSaida from "../components/estoque/ModalRegistrarSaida";
import ModalNovoProduto from "../components/estoque/ModalNovoProduto";


// Mock data e fakeApi para teste front
export const CATEGORIAS = ["Ração", "Medicamento", "Higiene", "Acessório", "Outro"];

export const produtosMock = [
    { id: "1", nome: "Ração Premium Adulto 10kg", marca: "PetBom", categoria: "Ração", quantidade: 50, precoUnitario: 105.50 },
    { id: "2", nome: "Vermífugo Oral 10ml", marca: "SaúdePet", categoria: "Medicamento", quantidade: 20, precoUnitario: 60.00 },
    { id: "3", nome: "Shampoo Antipulgas 250ml", marca: "LimpezaPet", categoria: "Higiene", quantidade: 72, precoUnitario: 25.00 },
    { id: "4", nome: "Coleira Anti-pulgas", marca: "PetSafe", categoria: "Acessório", quantidade: 15, precoUnitario: 40.00 },
];

export const clientesMock = [
    { id: "c1", nome: "Julia Eduarda Fernandes Silva", cpf: "111.111.111-11" },
    { id: "c2", nome: "Sara Ferreira Rodrigues", cpf: "222.222.222-22" },
];

export function fmt(v) {
    return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let _produtos = [...produtosMock];
let _clientes = [...clientesMock];

export const fakeApi = {
    getProdutos: () => Promise.resolve([..._produtos]),
    getClientes: () => Promise.resolve([..._clientes]),
    addProduto: (p) => {
        const novo = { ...p, id: Date.now().toString() };
        _produtos = [..._produtos, novo];
        return Promise.resolve(novo);
    },
    registrarSaida: (itens) => {
        _produtos = _produtos.map(p => {
            const item = itens.find(i => i.produtoId === p.id);
            return item ? { ...p, quantidade: p.quantidade - item.quantidade } : p;
        });
        return Promise.resolve({ ok: true });
    }
};

export default function Estoque({ onRegistrarSaida }) {
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [tabAtiva, setTabAtiva] = useState("Todos");
    const [modalNovo, setModalNovo] = useState(false);
    const [modalSaida, setModalSaida] = useState(false);

    // carrega dados
    async function carregarDados() {
        setLoading(true);
        const [prods, cls] = await Promise.all([fakeApi.getProdutos(), fakeApi.getClientes()]);
        setProdutos(prods);
        setClientes(cls);
        setLoading(false);
    }

    useEffect(() => { carregarDados(); }, []);

    // total de itens = soma da quantidade de TODOS os produtos
    const totalItens = produtos.reduce((a, p) => a + p.quantidade, 0);
    // valor em estoque = soma de (qtd * preço) de TODOS os produtos
    const valorEstoque = produtos.reduce((a, p) => a + p.quantidade * p.precoUnitario, 0);
    const categoriasPresentes = [...new Set(produtos.map(p => p.categoria))];
    const tabs = ["Todos", ...CATEGORIAS.filter(c => categoriasPresentes.includes(c))];

    const produtosFiltrados = produtos.filter(p => {
        const t = busca.toLowerCase();
        const matchBusca = !busca ||
            p.nome.toLowerCase().includes(t) ||
            p.marca.toLowerCase().includes(t) ||
            p.categoria.toLowerCase().includes(t);
        const matchTab = tabAtiva === "Todos" || p.categoria === tabAtiva;
        return matchBusca && matchTab;
    });

    async function handleCadastrar(novo) {
        try {
            // envia  e att o novo produto para salvar na API e obtém o produto com o ID gerado
            const produtoAdicionado = await fakeApi.addProduto(novo);
            setProdutos(prev => [...prev, produtoAdicionado]);
            setModalNovo(false);
        } catch (err) {
            console.error("Erro ao cadastrar produto na fakeApi:", err);
        }
    }

    async function handleSaida(itens) {
        try {
            // registra a saída para atualizar o array em memória (_produtos)
            await fakeApi.registrarSaida(itens);
            // att
            setProdutos(prev => prev.map(p => {
                const item = itens.find(i => i.produtoId === p.id);
                return item ? { ...p, quantidade: p.quantidade - item.quantidade } : p;
            }));
            setModalSaida(false);
        } catch (err) {
            console.error("Erro ao registrar saída na fakeApi:", err);
        }
    }

    return (
        <div className="flex-1 min-h-screen bg-gray-100">
            <div className="px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Estoque e produtos</h1>
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
                        <button onClick={() => setModalNovo(true)}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                            Novo produto
                        </button>
                        <button onClick={() => setModalSaida(true)}
                            className="bg-white hover:bg-pink-50 text-pink-500 font-bold text-sm px-6 py-3 rounded-xl transition-colors border-2 border-pink-400 whitespace-nowrap">
                            Registrar saída
                        </button>
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
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[30%]">Produto</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[18%]">Marca</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[14%]">Categoria</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[10%] text-center">Quantidade</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[13%] text-right">Preço Un.</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide w-[15%] text-right">Total Estoq.</span>
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
                            </div>
                        ))
                    )}
                </div>
            </div>

            {modalNovo && (
                <ModalNovoProduto
                    onClose={() => setModalNovo(false)}
                    onCadastrar={handleCadastrar}
                />
            )}
            {modalSaida && (
                <ModalRegistrarSaida
                    produtos={produtos}
                    clientes={clientes}
                    onClose={() => setModalSaida(false)}
                    onSaida={handleSaida}
                />
            )}
        </div>
    );
}