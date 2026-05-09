import { useState, useRef } from 'react';

function ModalAdicionarAnimal({ onClose, onAdicionar }) {
  const [form, setForm] = useState({
    nome: "", especie: "", raca: "", idade: "", sexo: "", observacoes: "", foto: null,
  });
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    set("foto", file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleAdicionar() {
    if (!form.nome || !form.especie || !form.raca || !form.idade || !form.sexo) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    onAdicionar({ ...form, id: Date.now().toString(), preview });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Adicionar Animal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {/* Nome */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 mb-1 block">Nome do Animal (obrigatório):</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Espécie + Raça */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Espécie (obrigatório):</label>
            <input
              type="text"
              value={form.especie}
              onChange={(e) => set("especie", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Raça (obrigatório):</label>
            <input
              type="text"
              value={form.raca}
              onChange={(e) => set("raca", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        {/* Idade + Sexo */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Idade (obrigatório):</label>
            <input
              type="text"
              value={form.idade}
              onChange={(e) => set("idade", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Sexo (obrigatório):</label>
            <select
              value={form.sexo}
              onChange={(e) => set("sexo", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            >
              <option value="">Selecione</option>
              <option value="Macho">Macho</option>
              <option value="Fêmea">Fêmea</option>
            </select>
          </div>
        </div>

        {/* Observações */}
        <div className="mb-4">
          <label className="text-sm text-gray-700 mb-1 block">Observações (opcional):</label>
          <textarea
            rows={4}
            value={form.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </div>

        {/* Foto */}
        <div className="mb-6">
          <label className="text-sm text-gray-700 mb-1 block">Foto do Animal (opcional):</label>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-20 h-20 rounded-xl object-cover" />
            ) : (
              <>
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs text-gray-400">Clique para adicionar uma foto</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 transition-colors text-sm"
          >
            Voltar
          </button>
          <button
            onClick={handleAdicionar}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 transition-colors text-sm"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalAdicionarAnimal;