function Campo({ label, value, onChange, type = "text", className = "", ...props }) {
  return (
    <div className={className}>
      <label className="text-sm text-gray-700 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition-all"
        {...props}
      />
    </div>
  );
}

export default Campo;