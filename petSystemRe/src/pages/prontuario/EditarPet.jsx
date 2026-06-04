import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { petsService } from "../../services/petsService";
import { tutoresService } from "../../services/tutoresService";

export default function EditarPet() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({ nome: '', especie: '', raca: '', sexo: '', idade: '', observacoes: '' });
  const [formTutor, setFormTutor] = useState({ nome: '', cpf: '', celular: '', email: '', endereco: '', complemento: '' });
  const [tutorId, setTutorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    const carregar = async () => {
      try {
        setLoading(true);
        setError('');
        const resPet = await petsService.getById(parseInt(id));
        const pet = resPet.data;
        if (!active) return;

        setForm({
          nome: pet.nome || '',
          especie: pet.especie || '',
          raca: pet.raca || '',
          sexo: pet.sexo || '',
          idade: pet.idade != null ? String(pet.idade) : '',
          observacoes: pet.observacoes || '',
        });

        if (pet.tutor_id) {
          setTutorId(pet.tutor_id);
          const resTutor = await tutoresService.getById(pet.tutor_id);
          if (!active) return;
          const t = resTutor.data;
          setFormTutor({
            nome: t.nome || '',
            cpf: t.cpf || '',
            celular: t.telefone || '',
            email: t.login || '',
            endereco: t.endereco || '',
            complemento: '',
          });
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Erro ao carregar dados do pet.');
      } finally {
        if (active) setLoading(false);
      }
    };
    carregar();
    return () => { active = false; };
  }, [id]);

  async function handleSalvar() {
    setSaving(true);
    setError('');
    try {
      await petsService.update(parseInt(id), {
        nome: form.nome,
        especie: form.especie,
        raca: form.raca || null,
        sexo: form.sexo || null,
        idade: form.idade ? parseInt(form.idade) : null,
        observacoes: form.observacoes || null,
      });

      if (tutorId) {
        await tutoresService.update(tutorId, {
          nome: formTutor.nome,
          cpf: formTutor.cpf,
          telefone: formTutor.celular || null,
          endereco: formTutor.endereco || null,
        });
      }

      navigate(`/dashboard/prontuarios/${id}`);
    } catch (err) {
      setError(err?.error || err?.message || 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 flex flex-col">

      <button
        onClick={() => navigate(`/dashboard/prontuarios/${id}`)}
        className="flex items-center gap-1 text-gray-500 hover:text-purple-700 text-sm p-8 pb-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <div className="flex-1 px-8 py-6 max-w-4xl w-full mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cadastro do Pet</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">Dados do Animal</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[["Nome", "nome"], ["Espécie", "especie"], ["Raça", "raca"], ["Sexo", "sexo"], ["Idade (anos)", "idade"]].map(([label, key]) => (
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

          {tutorId && (<>
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">Dados do Tutor</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[["Nome", "nome"], ["CPF", "cpf"], ["Celular", "celular"], ["Email", "email"]].map(([label, key]) => (
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
            </div>
          </>)}

          <div className="flex gap-3">
            <button onClick={() => navigate(`/dashboard/prontuarios/${id}`)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 transition-colors disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
