function Campo({ label, value, onChange, type = "text", className = "", mask = null, ...props }) {
  // helpers
  const onlyDigits = (v = "") => (v || "").toString().replace(/\D/g, '');

  const formatCPF = (v = "") => {
    const d = onlyDigits(v).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3}\.\d{3}\.\d{3})(\d+)/, '$1-$2')
      .replace(/\.$/, '');
  };

  const formatPhone = (v = "") => {
    const d = onlyDigits(v);
    if (d.length <= 10) {
      // (00) 0000-0000
      return d.replace(/^(\d{2})(\d{0,4})(\d{0,4})/, (m, a, b, c) => {
        return (a ? `(${a})` : '') + (b ? ` ${b}` : '') + (c ? `-${c}` : '');
      }).trim();
    }
    // (00) 00000-0000
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, (m, a, b, c) => `(${a}) ${b}${c ? `-${c}` : ''}`);
  };

  const formatCEP = (v = "") => {
    const d = onlyDigits(v).slice(0, 8);
    return d.replace(/^(\d{5})(\d{0,3})/, (m, a, b) => (b ? `${a}-${b}` : a));
  };

  const formatCurrencyDisplay = (raw = "") => {
    if (raw === null || raw === undefined || raw === "") return "";
    const num = Number(raw);
    if (Number.isNaN(num)) return "";
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleChange = (e) => {
    let v = e.target.value;
    if (!mask) return onChange(v);

    if (mask === 'cpf') {
      const formatted = formatCPF(v);
      onChange(formatted);
      return;
    }

    if (mask === 'phone') {
      const formatted = formatPhone(v);
      onChange(formatted);
      return;
    }

    if (mask === 'cep') {
      const formatted = formatCEP(v);
      onChange(formatted);
      return;
    }

    if (mask === 'currency') {
      // accept digits only; last two digits are cents
      const digits = onlyDigits(v);
      if (!digits) { onChange(''); return; }
      const asNumber = (parseInt(digits, 10) / 100).toFixed(2); // raw numeric string with dot
      onChange(asNumber);
      return;
    }

    // fallback
    onChange(v);
  };

  // displayed value derived from prop `value` when using masks
  let displayValue = value || '';
  if (mask === 'cpf') displayValue = formatCPF(value);
  if (mask === 'phone') displayValue = formatPhone(value);
  if (mask === 'cep') displayValue = formatCEP(value);
  if (mask === 'currency') displayValue = formatCurrencyDisplay(value);

  return (
    <div className={className}>
      <label className="text-sm text-gray-700 mb-1.5 block">{label}</label>
      <input
        type={type === 'number' ? 'text' : type}
        value={displayValue}
        onChange={handleChange}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition-all"
        {...props}
      />
    </div>
  );
}

export default Campo;