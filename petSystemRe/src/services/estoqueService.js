import { apiCall } from './api';

function normalizeProduto(produto) {
  return {
    id: produto.id,
    nome: produto.nome,
    marca: produto.marca || '',
    categoria: produto.categoria || 'Outro',
    descricao: produto.descricao || '',
    quantidade: Number(produto.quantidade ?? produto.quantidade_estoque ?? 0),
    precoUnitario: Number(produto.precoUnitario ?? produto.valor_unitario ?? 0),
    estoque_minimo: Number(produto.estoque_minimo ?? 0),
    ativo: produto.ativo !== false,
  };
}

function normalizeMovimentacao(movimentacao) {
  return {
    id: movimentacao.id,
    produtoId: movimentacao.produto_id,
    produtoNome: movimentacao.produto_nome,
    usuarioId: movimentacao.usuario_id,
    usuarioNome: movimentacao.usuario_nome,
    tipo: movimentacao.tipo,
    quantidade: Number(movimentacao.quantidade || 0),
    dataHora: movimentacao.data_hora,
    observacoes: movimentacao.observacoes || '',
  };
}

export async function listarProdutos(filters = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiCall(`/produtos${query}`, { method: 'GET' });
  return (response.data || []).map(normalizeProduto);
}

export async function listarSaidas(filters = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await apiCall(`/movimentacoes-estoque${query}`, { method: 'GET' });
  return (response.data || []).map(normalizeMovimentacao);
}

export async function cadastrarProduto(produto) {
  const response = await apiCall('/produtos', {
    method: 'POST',
    body: JSON.stringify(produto),
  });
  return normalizeProduto(response.data);
}

export async function deletarProduto(id) {
  await apiCall(`/produtos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ativo: false }),
  });
}

export async function relancarProduto(id, dados) {
  const response = await apiCall(`/produtos/${id}/relancar`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return normalizeProduto(response.data.produto);
}

export async function registrarSaida(itens, cliente = null) {
  const response = await apiCall('/movimentacoes-estoque', {
    method: 'POST',
    body: JSON.stringify({
      cliente_id: cliente?.id || null,
      itens,
    }),
  });

  return {
    movimentacoes: (response.data?.movimentacoes || []).map(normalizeMovimentacao),
    lancamentos: response.data?.lancamentos || [],
    produtos: (response.data?.produtos || []).map(normalizeProduto),
  };
}
