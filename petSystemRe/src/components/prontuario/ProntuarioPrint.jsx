const TYPE_COLORS = {
  Consulta:  { bg: '#EFF6FF', border: '#BFDBFE', accent: '#1D4ED8' },
  Vacinação: { bg: '#F0FDF4', border: '#BBF7D0', accent: '#15803D' },
  Cirurgia:  { bg: '#FEF2F2', border: '#FECACA', accent: '#B91C1C' },
  Exame:     { bg: '#FFFBEB', border: '#FDE68A', accent: '#B45309' },
};
const DEFAULT_COLOR = { bg: '#F9FAFB', border: '#E5E7EB', accent: '#374151' };

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

const Field = ({ label, value, fullWidth = false }) => {
  if (!value) return null;
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined, fontSize: '12px', marginBottom: '3px' }}>
      <span style={{ fontWeight: 'bold', color: '#374151' }}>{label}: </span>
      <span style={{ color: '#1F2937' }}>{value}</span>
    </div>
  );
};

export default function ProntuarioPrint({ dados }) {
  if (!dados) return null;
  const { pet, tutor, historico } = dados;
  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="print-only" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#111827', lineHeight: 1.5, padding: '0 8px' }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', paddingBottom: '14px', borderBottom: '2.5px solid #5B21B6' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#5B21B6', letterSpacing: '-0.5px' }}>PetSystem</div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>Clínica Veterinária</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#111827' }}>Prontuário Médico</div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '3px' }}>Emitido em {today}</div>
        </div>
      </div>

      {/* Dados do Paciente */}
      <section style={{ marginBottom: '18px' }}>
        <SectionTitle>Dados do Paciente</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <Field label="Nome" value={pet.nome} />
          <Field label="Espécie" value={pet.especie} />
          <Field label="Raça" value={pet.raca || 'SRD'} />
          <Field label="Sexo" value={pet.sexo} />
          <Field label="Idade" value={pet.idade} />
          <Field label="Observações" value={pet.observacoes} fullWidth />
        </div>
      </section>

      {/* Dados do Tutor */}
      <section style={{ marginBottom: '18px' }}>
        <SectionTitle>Dados do Tutor / Responsável</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <Field label="Nome" value={tutor.nome} fullWidth />
          <Field label="CPF" value={tutor.cpf} />
          <Field label="Celular" value={tutor.celular} />
          <Field label="E-mail" value={tutor.email} />
          <Field label="Endereço" value={tutor.endereco ? `${tutor.endereco}${tutor.complemento ? ` — ${tutor.complemento}` : ''}` : null} fullWidth />
        </div>
      </section>

      {/* Histórico */}
      <section style={{ marginBottom: '32px' }}>
        <SectionTitle>
          Histórico Médico — {historico.length} {historico.length === 1 ? 'registro' : 'registros'}
        </SectionTitle>

        {historico.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>Nenhum registro encontrado.</div>
        ) : (
          historico.map((item) => {
            const c = TYPE_COLORS[item.tipo] || DEFAULT_COLOR;
            return (
              <div
                key={item.id}
                style={{
                  marginBottom: '8px', padding: '10px 14px',
                  border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.accent}`,
                  borderRadius: '6px', backgroundColor: c.bg,
                  pageBreakInside: 'avoid',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: c.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.tipo}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>
                    {item.data}{item.hora ? ` • ${item.hora}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#374151', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 'bold' }}>Veterinário: </span>{item.veterinario}
                </div>
                {item.descricao && (
                  <div style={{ fontSize: '12px', color: '#1F2937', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 'bold' }}>Descrição: </span>{item.descricao}
                  </div>
                )}
                {item.observacoes && (
                  <div style={{ fontSize: '12px', color: '#374151' }}>
                    <span style={{ fontWeight: 'bold' }}>Observações: </span>{item.observacoes}
                  </div>
                )}
                {item.proximoReforcao && (
                  <div style={{ fontSize: '11px', color: '#15803D', marginTop: '4px', fontStyle: 'italic' }}>
                    ↻ Próximo reforço: {item.proximoReforcao}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Assinatura */}
      <div style={{ borderTop: '1px solid #D1D5DB', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '11px', color: '#6B7280' }}>
        <div>
          <div style={{ borderBottom: '1px solid #374151', marginBottom: '6px', height: '36px' }} />
          <div>Assinatura do Veterinário Responsável</div>
        </div>
        <div>
          <div style={{ borderBottom: '1px solid #374151', marginBottom: '6px', height: '36px' }} />
          <div>CRMV</div>
        </div>
      </div>
    </div>
  );
}
