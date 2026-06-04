// Padrão reaproveitado de ProntuarioPrint.jsx

function fmt(v) {
  return Number(Math.abs(v)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: '10px', fontWeight: 'bold', letterSpacing: '1.5px',
    textTransform: 'uppercase', color: '#5B21B6',
    marginBottom: '10px', paddingBottom: '5px',
    borderBottom: '1px solid #DDD6FE',
  }}>
    {children}
  </div>
);

const SummaryCard = ({ label, value, color = '#111827' }) => (
  <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', flex: 1 }}>
    <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#5B21B6', marginBottom: '6px' }}>
      {label}
    </div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>
      R$ {fmt(value)}
    </div>
  </div>
);

export default function FinanceiroPrint({ lancamentos, receita, gastos, caixa, mes, categoria }) {
  if (!lancamentos) return null;

  const today = new Date().toLocaleDateString('pt-BR');
  const resultado = receita - gastos;
  const totalReceitas = lancamentos.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const totalGastos   = lancamentos.filter(l => l.tipo === 'gasto').reduce((s, l) => s + l.valor, 0);

  return (
    <div className="print-only" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#111827', lineHeight: 1.5, padding: '0 8px' }}>

      {/* Cabeçalho — mesmo padrão do prontuário */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', paddingBottom: '14px', borderBottom: '2.5px solid #5B21B6' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#5B21B6', letterSpacing: '-0.5px' }}>PetSystem</div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>Clínica Veterinária</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#111827' }}>Relatório Financeiro</div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '3px' }}>
            Período: {mes} &nbsp;·&nbsp; Emitido em {today}
          </div>
          {categoria !== 'Todas as categorias' && (
            <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>Categoria: {categoria}</div>
          )}
        </div>
      </div>

      {/* Resumo do período */}
      <section style={{ marginBottom: '20px' }}>
        <SectionTitle>Resumo do Período — {mes}</SectionTitle>
        <div style={{ display: 'flex', gap: '12px' }}>
          <SummaryCard label="Receita do mês"  value={receita}   color="#15803D" />
          <SummaryCard label="Gastos do mês"   value={gastos}    color="#B91C1C" />
          <SummaryCard label="Resultado"        value={resultado} color={resultado >= 0 ? '#15803D' : '#B91C1C'} />
          <SummaryCard label="Caixa acumulado" value={caixa}     color={caixa    >= 0 ? '#1D4ED8' : '#B91C1C'} />
        </div>
      </section>

      {/* Tabela de lançamentos */}
      <section style={{ marginBottom: '24px' }}>
        <SectionTitle>
          Lançamentos — {lancamentos.length} {lancamentos.length === 1 ? 'registro' : 'registros'}
        </SectionTitle>

        {lancamentos.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>
            Nenhum lançamento no período selecionado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                {['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: h === 'Valor' ? 'right' : 'left', fontWeight: 'bold', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l, i) => {
                const isGasto = l.tipo === 'gasto';
                return (
                  <tr
                    key={l.id}
                    style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA', pageBreakInside: 'avoid' }}
                  >
                    <td style={{ padding: '7px 10px', color: '#6B7280' }}>{l.data}</td>
                    <td style={{ padding: '7px 10px', color: '#1F2937' }}>{l.descricao}</td>
                    <td style={{ padding: '7px 10px', color: '#6B7280' }}>{l.categoria}</td>
                    <td style={{ padding: '7px 10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '9999px', backgroundColor: isGasto ? '#FEF2F2' : '#F0FDF4', color: isGasto ? '#B91C1C' : '#15803D' }}>
                        {isGasto ? 'Gasto' : 'Receita'}
                      </span>
                    </td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 'bold', color: isGasto ? '#B91C1C' : '#15803D' }}>
                      {isGasto ? '- ' : ''}R$ {fmt(l.valor)}
                    </td>
                    <td style={{ padding: '7px 10px', color: l.status === 'Pago' ? '#374151' : l.status === 'Pendente' ? '#B45309' : '#9CA3AF' }}>
                      {l.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totais */}
            <tfoot>
              <tr style={{ borderTop: '2px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <td colSpan={4} style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 'bold', color: '#374151' }}>
                  Totais dos registros exibidos
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: '#111827' }}>
                  {totalGastos > 0 && (
                    <div style={{ color: '#B91C1C' }}>- R$ {fmt(totalGastos)}</div>
                  )}
                  {totalReceitas > 0 && (
                    <div style={{ color: '#15803D' }}>+ R$ {fmt(totalReceitas)}</div>
                  )}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </section>
    </div>
  );
}
