/**
  TRANSFORMADOR DE DADOS FINANCEIROS
  
  Este arquivo contém funções para transformar dados de:
  - Agendamentos/Consultas (RECEITA)
  - Cirurgias/Procedimentos (RECEITA)
  - Medicamentos/Vacinação (RECEITA)
  - Vendas de Estoque (RECEITA)
  - Compras de Insumos (GASTO)
  
  Em lançamentos financeiros para o painel de Controle Financeiro.
  TEM QUE INTEGRAR COM A API
 */

// mapeamento de tipos de atendimento para categorias financeiras
const TIPO_ATENDIMENTO_MAP = {
  'CONSULTA': 'Consulta',
  'EXAME': 'Exame',
  'CIRURGIA': 'Cirurgia',
  'VACINACAO': 'Vacina',
  'PROCEDIMENTO': 'Procedimento',
};

// preços padrão para tipos (SUBSTITUIR POR DADOS DA API)
const PRECOS_PADRAO = {
  'Consulta': 150,
  'Exame': 200,
  'Cirurgia': 500,
  'Vacina': 50,
  'Procedimento': 300,
};

/**
 * converte agendamentos realizados em lançamentos de receita
 * @param {Array} agendamentos 
 * @param {Array} agendamentosRealizados
 * @returns {Array}
 */
export function transformarAgendamentosEmReceitas(agendamentos = [], agendamentosRealizados = null) {
  // usar agendamentosRealizados ao invés de agendamentos
  // const dados = agendamentosRealizados || agendamentos;
  
  const dados = agendamentos.filter(a => a.date && a.type); // Mock: apenas com data e tipo

  return dados.map((agendamento) => ({
    id: `agende-${agendamento.id}`,
    data: formatarDataParaLancamento(agendamento.date),
    descricao: `${TIPO_ATENDIMENTO_MAP[agendamento.type] || agendamento.type} - ${agendamento.patient}`,
    categoria: TIPO_ATENDIMENTO_MAP[agendamento.type] || 'Consulta',
    valor: PRECOS_PADRAO[TIPO_ATENDIMENTO_MAP[agendamento.type]] || 150,
    status: 'Pago', // será 'Pendente' até ser validado 
    tipo: 'receita',
    origem: 'agendamento',
    referenciaId: agendamento.id,
  }));
}

/**
 * converte prontuários/registros médicos em lançamentos de receita
 * @param {Array} prontuarios 
 * @param {Array} prontuariosValidados 
 * @returns {Array}
 */
export function transformarProntuariosEmReceitas(prontuarios = [], prontuariosValidados = null) {
  //  Integrar com histórico de prontuários
  // const dados = prontuariosValidados || prontuarios;
  
  return [];
}

/**
 * converte vendas de produtos em lançamentos de receita
 * @param {Array} vendas - lista de vendas realizadas
 * @param {Array} vendasAPI -
 * @returns {Array} 
 */
export function transformarVendasEmReceitas(vendas = [], vendasAPI = null) {
  // TODO: Quando implementar vendas, usar dados da API
  // const dados = vendasAPI || vendas;
  
  return [];
}

/**
 * Converte saídas de estoque em lançamentos de gasto
 * @param {Array} saidasEstoque 
 * @param {Array} saidasAPI 
 * @returns {Array} 
 */
export function transformarSaidasEstoqueEmGastos(saidasEstoque = [], saidasAPI = null) {
  // integrar com histórico de saídas 
  // const dados = saidasAPI || saidasEstoque;
  
  return [];
}

/**
 * Consolida todos os lançamentos de múltiplas fontes
 * @param {Object} dados - Objeto contendo arrays de diferentes fontes
 * @returns {Array} Array consolidado de lançamentos
 */
export function consolidarLancamentosFinanceiros(dados = {}) {
  const {
    agendamentos = [],
    prontuarios = [],
    vendas = [],
    saidasEstoque = [],
    agendamentosAPI = null,
    prontuariosAPI = null,
    vendasAPI = null,
    saidasAPI = null,
  } = dados;

  const receitas = [
    ...transformarAgendamentosEmReceitas(agendamentos, agendamentosAPI),
    ...transformarProntuariosEmReceitas(prontuarios, prontuariosAPI),
    ...transformarVendasEmReceitas(vendas, vendasAPI),
  ];

  const gastos = [
    ...transformarSaidasEstoqueEmGastos(saidasEstoque, saidasAPI),
  ];

  return [...receitas, ...gastos];
}

/**
 * Formata data de agendamento (YYYY-MM-DD) para formato de lançamento (DD/MM/YYYY)
 * @param {string} data - Data em formato YYYY-MM-DD
 * @returns {string} Data em formato DD/MM/YYYY
 */
function formatarDataParaLancamento(data) {
  if (!data) return new Date().toLocaleDateString('pt-BR');
  
  try {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch {
    return new Date().toLocaleDateString('pt-BR');
  }
}

/**
 * Hook para simular carregamento de dados da API
 * REMOVER QUANDO A API ESTIVER INTEGRADA
 */
export function simuladorDadosAPI(dadosLocais) {
  // Estrutura esperada da API:
  // {
  //   agendamentosRealizados: [],
  //   prontuariosValidados: [],
  //   vendas: [],
  //   saidasEstoque: []
  // }
  return Promise.resolve(null);
}
