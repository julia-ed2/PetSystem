import { useState } from "react";
import ModalAdicionarAnimal from "../../components/cadastros/AdicionarAnimal";
import AnimalCard from '../../components/AnimalCard';
import Campo from "../../components/cadastros/CampoForm";
import { tutoresService } from "../../services/tutoresService";
import { petsService } from "../../services/petsService";

export default function CadastrarCliente({ onVoltar, onSalvar, onVerProntuario }) {
  const [tutor, setTutor] = useState({
    nome: "", cpf: "", dataNascimento: "", celular: "", genero: "",
    email: "", cep: "", estado: "", cidade: "", endereco: "",
    bairro: "", numero: "", complemento: "", pontoReferencia: "",
  });

  const [animais, setAnimais] = useState([]);
  const [modalAnimal, setModalAnimal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setT(key, value) {
    setTutor((prev) => ({ ...prev, [key]: value }));
  }

  function handleAdicionarAnimal(animal) {
    setAnimais((prev) => [...prev, animal]);
    setModalAnimal(false);
  }

  function handleRemoverAnimal(id) {
    setAnimais((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSalvar() {
    if (!tutor.nome || !tutor.cpf || !tutor.celular) {
      setError("Preencha os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formatarEndereco = () => {
        let endereco = tutor.endereco || "";
        if (tutor.numero) endereco += `, ${tutor.numero}`;
        if (tutor.bairro) endereco += ` - ${tutor.bairro}`;
        if (tutor.cidade) endereco += `, ${tutor.cidade}`;
        if (tutor.estado) endereco += ` - ${tutor.estado}`;
        if (tutor.complemento) endereco += ` (${tutor.complemento})`;
        return endereco;
      };

      const novoTutor = {
        nome: tutor.nome,
        cpf: tutor.cpf,
        telefone: tutor.celular,
        endereco: formatarEndereco(),
        ...(tutor.email && { login: tutor.email }),
      };

      const resTutor = await tutoresService.create(novoTutor);
      const tutoraId = resTutor.data.id;

      await Promise.all(animais.map((animal) => {
        const petPayload = {
          tutor_id: tutoraId,
          nome: animal.nome,
          especie: animal.especie,
          raca: animal.raca,
          idade: parseInt(animal.idade) || 0,
          sexo: animal.sexo,
          observacoes: animal.observacoes,
        };

        const peso = parseFloat(animal.peso) || 0;
        if (peso > 0) {
          petPayload.peso = peso;
        }

        return petsService.create(petPayload);
      }));

      onSalvar?.({ tutor: resTutor.data, animais });
    } catch (err) {
      setError(err.message || "Erro ao salvar tutor");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscarCep(cep) {
    setT("cep", cep);
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setTutor((prev) => ({
          ...prev,
          estado: data.uf || prev.estado,
          cidade: data.localidade || prev.cidade,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
        }));
      }
    } catch (_) { }
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="max-w-4xl w-full mx-auto px-8 py-8 pb-28">

        <button
          onClick={onVoltar}
          className="flex items-center gap-1 text-gray-500 hover:text-purple-700 text-sm mb-6 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Cliente</h1>
          <p className="text-sm text-gray-400 mt-1">Preencha as informações do tutor</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">

          <Campo
            label="Nome completo (obrigatório):"
            value={tutor.nome}
            onChange={(v) => setT("nome", v)}
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-5">
            <Campo
              label="CPF (obrigatório):"
              value={tutor.cpf}
              onChange={(v) => setT("cpf", v)}
              mask="cpf"
              placeholder="000.000.000-00"
            />
            <Campo
              label="Data de Nascimento (opcional):"
              value={tutor.dataNascimento}
              onChange={(v) => setT("dataNascimento", v)}
              type="date"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Campo
              label="Celular (obrigatório):"
              value={tutor.celular}
              onChange={(v) => setT("celular", v)}
              mask="phone"
              placeholder="(00) 00000-0000"
            />
            <div>
              <label className="text-sm text-gray-700 mb-1.5 block">Gênero (opcional):</label>
              <select
                value={tutor.genero}
                onChange={(e) => setT("genero", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Campo
              label="Email (opcional):"
              value={tutor.email}
              onChange={(v) => setT("email", v)}
              type="email"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="pt-2">
            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Endereço</p>

            <div className="grid grid-cols-3 gap-5 mb-5">
              <div>
                <label className="text-sm text-gray-700 mb-1.5 block">CEP:</label>
                <input
                  type="text"
                  value={tutor.cep}
                  onChange={(e) => handleBuscarCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <Campo
                label="Estado (obrigatório):"
                value={tutor.estado}
                onChange={(v) => setT("estado", v)}
              />
              <Campo
                label="Cidade (obrigatório):"
                value={tutor.cidade}
                onChange={(v) => setT("cidade", v)}
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-5 mb-5" style={{ gridTemplateColumns: "1fr 300px" }}>
              <Campo
                label="Endereço (obrigatório):"
                value={tutor.endereco}
                onChange={(v) => setT("endereco", v)}
              />
              <Campo
                label="Bairro (obrigatório):"
                value={tutor.bairro}
                onChange={(v) => setT("bairro", v)}
              />
            </div>

            <div className="grid grid-cols-3 gap-5">
              <Campo
                label="Número (opcional):"
                value={tutor.numero}
                onChange={(v) => setT("numero", v)}
              />
              <Campo
                label="Complemento: (opcional):"
                value={tutor.complemento}
                onChange={(v) => setT("complemento", v)}
              />
              <Campo
                label="Ponto de referência: (opcional):"
                value={tutor.pontoReferencia}
                onChange={(v) => setT("pontoReferencia", v)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Animais:</p>
              <p className="text-xs text-gray-400 mt-0.5">Clique para adicionar os animais pertencentes a esse tutor:</p>
            </div>
            <button
              onClick={() => setModalAnimal(true)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Animal
            </button>
          </div>

          <div className="mt-4">
            {animais.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-8 text-center">
                <p className="text-sm text-gray-400">Ainda não há animais cadastrados nesse tutor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {animais.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={{
                      id: animal.id,
                      name: animal.nome,
                      type: animal.especie,
                      breed: animal.raca,
                      tutor: tutor.nome || "Novo cliente",
                    }}
                    onVerProntuario={onVerProntuario}
                    onRemove={handleRemoverAnimal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5">
          <div className="bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-100 flex justify-between items-center py-5 px-8">
            <button
              onClick={onVoltar}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-24 py-4 rounded-2xl transition-colors shadow-md cursor-pointer disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-24 py-4 rounded-2xl transition-colors shadow-md cursor-pointer disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

      </div>


      {modalAnimal && (
        <ModalAdicionarAnimal
          onClose={() => setModalAnimal(false)}
          onAdicionar={handleAdicionarAnimal}
        />
      )}
    </div>
  );
}