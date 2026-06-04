import { useState } from 'react';

function ModalEditarPet({ pet, tutor, onClose, onSave }) {
  const [form, setForm] = useState({ ...pet });
  const [formTutor, setFormTutor] = useState({ ...tutor });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Editar Cadastro do Pet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>

        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">Dados do Animal</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[["Nome", "nome"], ["Espécie", "especie"], ["Raça", "raca"], ["Sexo", "sexo"], ["Idade", "idade"]].map(([label, key]) => (
            <div key={key}>
              <label className="text-sm text-gray-700 mb-1 block">{label}:</label>
              <input value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-sm text-gray-700 mb-1 block">Observações:</label>
            <input value={form.observacoes || ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
        </div>

        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">Dados do Tutor</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[["Nome", "nome"], ["Gênero", "genero"], ["Data de Nascimento", "dataNascimento"], ["CPF", "cpf"], ["Celular", "celular"], ["Email", "email"]].map(([label, key]) => (
            <div key={key}>
              <label className="text-sm text-gray-700 mb-1 block">{label}:</label>
              <input value={formTutor[key] || ""} onChange={(e) => setFormTutor({ ...formTutor, [key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-sm text-gray-700 mb-1 block">Endereço:</label>
            <input value={formTutor.endereco || ""} onChange={(e) => setFormTutor({ ...formTutor, endereco: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-700 mb-1 block">Complemento:</label>
            <input value={formTutor.complemento || ""} onChange={(e) => setFormTutor({ ...formTutor, complemento: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(form, formTutor)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 transition-colors">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
} 

export default ModalEditarPet;