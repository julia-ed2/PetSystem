import { useState, useEffect, useMemo } from "react";
import CategoriaDropdown from "../components/financeiro/CategoriaDropdown";
import ModalInserirGasto from "../components/financeiro/ModalInserirGasto";
import FinanceiroPrint from "../components/financeiro/FinanceiroPrint";
import { useAuth } from '../hooks/useAuth';
import { adicionarLancamento, atualizarStatusLancamento, listarLancamentos } from '../services/financeiroService';

const MESES = ["Jan.","Fev.","Mar.","Abr.","Mai.","Jun.","Jul.","Ago.","Set.","Out.","Nov.","Dez."];
const MESES_NUM = { "Jan.":1,"Fev.":2,"Mar.":3,"Abr.":4,"Mai.":5,"Jun.":6,"Jul.":7,"Ago.":8,"Set.":9,"Out.":10,"Nov.":11,"Dez.":12 };

const CATEGORIAS_RECEITA = ["Consulta","Vacina","Cirurgia","Exame","Outro"];
const CATEGORIAS_GASTO   = ["Gasto","Insumo","Equipamento","Funcionário","Outro"];
const TODAS_CATEGORIAS   = [...new Set([...CATEGORIAS_RECEITA, ...CATEGORIAS_GASTO])];
const STATUS_OPS         = ["Pago","Pendente","Cancelado"];

function parseData(str) {
  if (!str) return { dia: 0, mes: 0, ano: 0 };
  const parts = String(str).split("/");
  if (parts.length !== 3) return { dia: 0, mes: 0, ano: 0 };
  const [d, m, y] = parts.map(Number);
  if (!m || !y) return { dia: 0, mes: 0, ano: 0 };
  return { dia: d, mes: m, ano: y };
}

function fmt(v) {
  return Number(Math.abs(v)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function SortLabel({ active, direction }) {
  return (
    <span className="text-[10px] font-bold text-gray-400 leading-none">
      {active ? (direction === "asc" ? "▲" : "▼") : ""}
    </span>
  );
}

function StatusBadge({ status, tipo }) {
  if (status === "Pago") {
    const cor = tipo === "gasto" ? "text-red-500" : "text-green-500";
    return <span className={`text-sm font-bold ${cor}`}>Pago</span>;
  }
  if (status === "Pendente") return <span className="text-sm font-bold text-yellow-500">Pendente</span>;
  return <span className="text-sm font-bold text-gray-400">Cancelado</span>;
}

export default function Financeiro({ agendamentos = [], prontuarios = [], vendas = [], saidasEstoque = [], canManage = true }) {
  const { user } = useAuth();
  const mesAtual = new Date().getMonth() + 1;
  const mesNomeAtual = MESES[mesAtual - 1];

  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mesSel, setMesSel]           = useState(mesNomeAtual);
  const [catFiltro, setCatFiltro]     = useState("Todas as categorias");
  const [modalGasto, setModalGasto]   = useState(false);
  const podeEscrever = canManage && user?.tipo !== 'cliente';
  const [sortConfig, setSortConfig] = useState({ key: "data", direction: "desc" });

  function handleSort(key) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  async function carregar() {
    setLoading(true);
    const dataApi = await listarLancamentos({ ano: new Date().getFullYear() });
    setLancamentos(dataApi);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const mesNum = MESES_NUM[mesSel];

  const lancamentosFiltrados = useMemo(() => {
    const filtrados = lancamentos.filter(l => {
      const { mes } = parseData(l.data);
      return mes === mesNum && (catFiltro === "Todas as categorias" || l.categoria === catFiltro);
    });
    const factor = sortConfig.direction === "asc" ? 1 : -1;
    return [...filtrados].sort((a, b) => {
      if (sortConfig.key === "data") {
        const { ano: ay, mes: am, dia: ad } = parseData(a.data);
        const { ano: by, mes: bm, dia: bd } = parseData(b.data);
        return (ay * 10000 + am * 100 + ad - (by * 10000 + bm * 100 + bd)) * factor;
      }
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === "number") return (aVal - bVal) * factor;
      return String(aVal || "").localeCompare(String(bVal || ""), "pt-BR") * factor;
    });
  }, [lancamentos, mesNum, catFiltro, sortConfig]);

  const lancamentosMes = lancamentos.filter(l => parseData(l.data).mes === mesNum);

  const receita = lancamentosMes
    .filter(l => l.tipo === "receita")
    .reduce((a, l) => a + l.valor, 0);

  const gastos = lancamentosMes
    .filter(l => l.tipo === "gasto")
    .reduce((a, l) => a + l.valor, 0);

  // caixa = somatória de todos os meses até o atual (receitas - gastos)
  const caixa = lancamentos
    .filter(l => {
      const { mes } = parseData(l.data);
      return mes <= mesNum;
    })
    .reduce((a, l) => l.tipo === "receita" ? a + l.valor : a - l.valor, 0);

  async function handleInserir(novo) {
    try {
      const salvo = await adicionarLancamento(novo);
      setLancamentos(prev => [...prev, salvo]);
      const { mes } = parseData(salvo.data);
      setMesSel(MESES[mes - 1]);
      setModalGasto(false);
    } catch (err) {
      console.error('Erro ao inserir lançamento:', err);
      throw err;
    }
  }

  async function handleAlterarStatus(id) {
    const atualizado = await atualizarStatusLancamento(id, "Pago");
    if (!atualizado) return;
    setLancamentos(prev => prev.map(l => 
      l.id === id && l.status === "Pendente" ? { ...l, status: "Pago" } : l
    ));
  }

  function handleImprimir() {
    window.print();
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <FinanceiroPrint
        lancamentos={lancamentosFiltrados}
        receita={receita}
        gastos={gastos}
        caixa={caixa}
        mes={mesSel}
        categoria={catFiltro}
      />
      <div className="screen-only px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
          {podeEscrever && <button
            onClick={() => setModalGasto(true)}
            className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Lançamento
          </button>}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <p className="text-sm font-semibold text-purple-600 mb-2">Receita do mês</p>
            <p className="text-[32px] font-bold text-gray-900 leading-none">
              {loading ? <span className="text-gray-300">—</span> : `R$ ${fmt(receita)}`}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <p className="text-sm font-semibold text-purple-600 mb-2">Gastos do mês</p>
            <p className="text-[32px] font-bold text-gray-900 leading-none">
              {loading ? <span className="text-gray-300">—</span> : `R$ ${fmt(gastos)}`}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <p className="text-sm font-semibold text-purple-600 mb-2">Caixa</p>
            <p className="text-[32px] font-bold text-gray-900 leading-none">
              {loading ? <span className="text-gray-300">—</span> : `R$ ${fmt(caixa)}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {MESES.map(m => (
            <button
              key={m}
              onClick={() => setMesSel(m)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                mesSel === m
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">

          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <button
              onClick={handleImprimir}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir relatório
            </button>

            <CategoriaDropdown valor={catFiltro} onChange={setCatFiltro} />
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-t border-b border-gray-100 bg-gray-50">
            <button type="button" onClick={() => handleSort("data")} className="text-sm font-semibold text-gray-700 w-[15%] flex items-center gap-1">
              <span>Data</span><SortLabel active={sortConfig.key === "data"} direction={sortConfig.direction} />
            </button>
            <button type="button" onClick={() => handleSort("descricao")} className="text-sm font-semibold text-gray-700 w-[30%] flex items-center gap-1">
              <span>Descrição</span><SortLabel active={sortConfig.key === "descricao"} direction={sortConfig.direction} />
            </button>
            <button type="button" onClick={() => handleSort("categoria")} className="text-sm font-semibold text-gray-700 w-[15%] flex items-center gap-1">
              <span>Categoria</span><SortLabel active={sortConfig.key === "categoria"} direction={sortConfig.direction} />
            </button>
            <button type="button" onClick={() => handleSort("valor")} className="text-sm font-semibold text-gray-700 w-[12%] flex items-center justify-end gap-1">
              <span>Valor</span><SortLabel active={sortConfig.key === "valor"} direction={sortConfig.direction} />
            </button>
            <button type="button" onClick={() => handleSort("status")} className="text-sm font-semibold text-gray-700 w-[13%] flex items-center justify-end gap-1">
              <span>Status</span><SortLabel active={sortConfig.key === "status"} direction={sortConfig.direction} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : lancamentosFiltrados.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">
              Nenhum lançamento em {mesSel}.
            </div>
          ) : (
            lancamentosFiltrados.map((l, i) => (
              <div
                key={l.id}
                className={`flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors ${
                  i < lancamentosFiltrados.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-sm text-gray-700 w-[15%]">{l.data}</span>
                <span className="text-sm text-gray-800 w-[30%]">{l.descricao}</span>
                <span className="text-sm text-gray-600 w-[15%]">{l.categoria}</span>
                <span className={`text-sm font-medium w-[12%] text-right ${l.tipo === "gasto" ? "text-gray-800" : "text-gray-800"}`}>
                  {l.tipo === "gasto" ? `- ${fmt(l.valor)}` : fmt(l.valor)}
                </span>
                <div className="w-[13%] text-right flex items-center justify-end gap-2">
                  <StatusBadge status={l.status} tipo={l.tipo} />
                  {podeEscrever && l.status === "Pendente" && (
                    <button
                      onClick={() => handleAlterarStatus(l.id)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-semibold transition-colors"
                      title="Marcar como pago"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {modalGasto && podeEscrever && (
        <ModalInserirGasto
          onClose={() => setModalGasto(false)}
          onInserir={handleInserir}
        />
      )}
    </div>
  );
}