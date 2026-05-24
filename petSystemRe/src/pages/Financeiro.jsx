import { useState, useEffect, useRef } from "react";
import CategoriaDropdown from "../components/financeiro/CategoriaDropdown";
import ModalInserirGasto from "../components/financeiro/ModalInserirGasto";
import { consolidarLancamentosFinanceiros } from "../utils/financialDataTransformer";

//teste
// VAI RECEBER DADOS DO ESTOQUE E PRODUTOS E DOS AGENDAMENTOS
let _lancamentos = [
  { id: "1", data: "02/04/2026", descricao: "Consulta pronto socorro", categoria: "Consulta", valor: 500,   status: "Pago",     tipo: "receita" },
  { id: "2", data: "03/04/2026", descricao: "Vacina V10",              categoria: "Vacina",   valor: 50,    status: "Pago",     tipo: "receita" },
  { id: "3", data: "03/04/2026", descricao: "Procedimento de castração",categoria: "Cirurgia", valor: 500,  status: "Pago",     tipo: "receita" },
  { id: "4", data: "04/04/2026", descricao: "Compra de insumos",       categoria: "Gasto",    valor: 1000,  status: "Pago",     tipo: "gasto"   },
];

const fakeApi = {
  getLancamentos: () => Promise.resolve([..._lancamentos]),
  addLancamento: (l) => {
    const novo = { ...l, id: Date.now().toString() };
    _lancamentos = [..._lancamentos, novo];
    return Promise.resolve(novo);
  },
};

const MESES = ["Jan.","Fev.","Mar.","Abr.","Mai.","Jun.","Jul.","Ago.","Set.","Out.","Nov.","Dez."];
const MESES_NUM = { "Jan.":1,"Fev.":2,"Mar.":3,"Abr.":4,"Mai.":5,"Jun.":6,"Jul.":7,"Ago.":8,"Set.":9,"Out.":10,"Nov.":11,"Dez.":12 };

const CATEGORIAS_RECEITA = ["Consulta","Vacina","Cirurgia","Exame","Outro"];
const CATEGORIAS_GASTO   = ["Gasto","Insumo","Equipamento","Funcionário","Outro"];
const TODAS_CATEGORIAS   = [...new Set([...CATEGORIAS_RECEITA, ...CATEGORIAS_GASTO])];
const STATUS_OPS         = ["Pago","Pendente","Cancelado"];

function parseData(str) {
  // dd/mm/yyyy
  const [d, m, y] = str.split("/").map(Number);
  return { dia: d, mes: m, ano: y };
}

function fmt(v) {
  return Number(Math.abs(v)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function StatusBadge({ status, tipo }) {
  if (status === "Pago") {
    const cor = tipo === "gasto" ? "text-red-500" : "text-green-500";
    return <span className={`text-sm font-bold ${cor}`}>Pago</span>;
  }
  if (status === "Pendente") return <span className="text-sm font-bold text-yellow-500">Pendente</span>;
  return <span className="text-sm font-bold text-gray-400">Cancelado</span>;
}

export default function Financeiro({ agendamentos = [], prontuarios = [], vendas = [], saidasEstoque = [] }) {
  const mesAtual = new Date().getMonth() + 1;
  const mesNomeAtual = MESES[mesAtual - 1];

  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mesSel, setMesSel]           = useState(mesNomeAtual);
  const [catFiltro, setCatFiltro]     = useState("Todas as categorias");
  const [modalGasto, setModalGasto]   = useState(false);

  /**
   * Carrega dados: combina dados mock com dados de agendamentos
   * TODO: Quando a API estiver pronta, remover fakeApi e usar dados da API diretamente
   */
  async function carregar() {
    setLoading(true);
    
    // Dados mock do fakeApi (MANTER ATÉ A API ESTAR PRONTA)
    const dataMock = await fakeApi.getLancamentos();
    
    // Transforma agendamentos e outros dados em lançamentos financeiros
    const lancamentosAutomaticos = consolidarLancamentosFinanceiros({
      agendamentos,
      prontuarios,
      vendas,
      saidasEstoque,
      // TODO: Descomente quando a API estiver integrada:
      // agendamentosAPI: dados.agendamentos_realizados,
      // prontuariosAPI: dados.prontuarios_validados,
    });

    // Consolida: mantém dados mock + automaticamente gerados
    // (Mock primeiro para manter os dados de exemplo)
    setLancamentos([...dataMock, ...lancamentosAutomaticos]);
    setLoading(false);
  }

  // Recarrega quando agendamentos mudam (quando novos agendamentos são criados)
  useEffect(() => { 
    carregar(); 
  }, [agendamentos, prontuarios, vendas, saidasEstoque]);

  const mesNum = MESES_NUM[mesSel];

  const lancamentosFiltrados = lancamentos.filter(l => {
    const { mes } = parseData(l.data);
    const matchMes = mes === mesNum;
    const matchCat = catFiltro === "Todas as categorias" || l.categoria === catFiltro;
    return matchMes && matchCat;
  });

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
    const salvo = await fakeApi.addLancamento(novo);
    setLancamentos(prev => [...prev, salvo]);
    const { mes } = parseData(salvo.data);
    setMesSel(MESES[mes - 1]);
    setModalGasto(false);
  }

  function handleAlterarStatus(id) {
    setLancamentos(prev => prev.map(l => 
      l.id === id && l.status === "Pendente" ? { ...l, status: "Pago" } : l
    ));
  }

  //imprime relatório
  function handleImprimir() {
    const conteudo = `
      <html><head><title>Relatório Financeiro - ${mesSel}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        h1 { color: #7c3aed; }
        h2 { color: #555; font-size: 14px; margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid #eee; padding: 8px 12px; }
        td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        .receita { color: #16a34a; font-weight: bold; }
        .gasto   { color: #dc2626; font-weight: bold; }
        .totais  { margin-top: 24px; display: flex; gap: 32px; }
        .card    { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; min-width: 180px; }
        .label   { font-size: 12px; color: #7c3aed; font-weight: bold; }
        .valor   { font-size: 24px; font-weight: bold; margin-top: 8px; }
      </style></head><body>
      <h1>PetSystem — Controle Financeiro</h1>
      <p>Relatório de <strong>${mesSel}</strong></p>
      <div class="totais">
        <div class="card"><div class="label">Receita do mês</div><div class="valor">R$ ${fmt(receita)}</div></div>
        <div class="card"><div class="label">Gastos do mês</div><div class="valor">R$ ${fmt(gastos)}</div></div>
        <div class="card"><div class="label">Caixa</div><div class="valor">R$ ${fmt(caixa)}</div></div>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Status</th></tr></thead>
        <tbody>
          ${lancamentosFiltrados.map(l => `
            <tr>
              <td>${l.data}</td>
              <td>${l.descricao}</td>
              <td>${l.categoria}</td>
              <td class="${l.tipo === "gasto" ? "gasto" : "receita"}">${l.tipo === "gasto" ? "- " : ""}R$ ${fmt(l.valor)}</td>
              <td>${l.status}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      </body></html>
    `;
    const win = window.open("", "_blank");
    win.document.body.innerHTML = conteudo;
    win.document.close();
    win.print();
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <div className="px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
          <button
            onClick={() => setModalGasto(true)}
            className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Lançamento
          </button>
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
            <span className="text-sm font-semibold text-gray-700 w-[15%]">Data</span>
            <span className="text-sm font-semibold text-gray-700 w-[30%]">Descrição</span>
            <span className="text-sm font-semibold text-gray-700 w-[15%]">Categoria</span>
            <span className="text-sm font-semibold text-gray-700 w-[12%] text-right">Valor</span>
            <span className="text-sm font-semibold text-gray-700 w-[13%] text-right">Status</span>
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
                  {l.status === "Pendente" && (
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

      {modalGasto && (
        <ModalInserirGasto
          onClose={() => setModalGasto(false)}
          onInserir={handleInserir}
        />
      )}
    </div>
  );
}