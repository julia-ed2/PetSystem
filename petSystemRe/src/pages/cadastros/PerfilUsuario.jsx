import { useState, useEffect } from "react";
import { tutoresService } from "../../services/tutoresService";
import { petsService } from "../../services/petsService";

function TipoBadge({ tipo }) {
  const styles = {
    Administrador: "bg-purple-100 text-purple-700 border border-purple-200",
    Usuário: "bg-blue-100 text-blue-700 border border-blue-200",
    Cliente: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${styles[tipo] || styles.Cliente}`}>
      {tipo}
    </span>
  );
}

function AnimalCard({ animal, onVerProntuario, onEditar, onDeletar, isAdmin }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group relative">
      <div
        onClick={() => onVerProntuario?.(animal)}
        className="cursor-pointer"
      >
        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
          {animal.foto ? (
            <img src={animal.foto} alt={animal.nome} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </div>

        <p className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{animal.nome}</p>
        <p className="text-xs text-gray-400 mt-0.5">{animal.especie} • {animal.raca}</p>
        <p className="text-xs text-gray-400">{animal.sexo} • {animal.idade}</p>

        {animal.observacoes && (
          <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-2 py-1">{animal.observacoes}</p>
        )}

        <div className="mt-3 flex items-center gap-1 text-purple-600 text-xs font-semibold group-hover:gap-2 transition-all">
          <span>Ver prontuário</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditar?.(animal);
            }}
            className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletar?.(animal);
            }}
            className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
            title="Deletar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
    </div>
  );
}

export default function PerfilUsuario({
  usuarioId,
  isAdmin = false,
  onVoltar,
  onEditar,
  onVerProntuario,
}) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [petEditando, setPetEditando] = useState(null);
  const [petDeletando, setPetDeletando] = useState(null);
  const [modalAberta, setModalAberta] = useState(false);
  const [editPetForm, setEditPetForm] = useState({});

  useEffect(() => {
    const carregarTutor = async () => {
      try {
        setLoading(true);
        setError("");
        const resTutor = await tutoresService.getById(parseInt(usuarioId));
        const resPets = await petsService.list({ tutor_id: usuarioId });

        const perfilFormatado = {
          id: resTutor.data.id,
          nome: resTutor.data.nome,
          cpf: resTutor.data.cpf,
          dataNascimento: "",
          celular: resTutor.data.telefone,
          genero: "",
          email: resTutor.data.login || "",
          tipoAcesso: "Cliente",
          endereco: {
            logradouro: resTutor.data.endereco || "",
            numero: "",
            bairro: "",
            cidade: "",
            estado: "",
            cep: "",
            complemento: "",
            pontoReferencia: "",
          },
          animais: resPets.data.map((pet) => ({
            id: pet.id.toString(),
            nome: pet.nome,
            especie: pet.especie,
            raca: pet.raca || "",
            sexo: pet.sexo || "",
            idade: pet.idade ? `${pet.idade} anos` : "",
            idade_anos: pet.idade || 0,
            peso: pet.peso || 0,
            observacoes: pet.observacoes || "",
            foto: null,
          })),
        };

        setPerfil(perfilFormatado);
      } catch (err) {
        console.error("Erro ao carregar tutor:", err);
        setError(err.message || "Erro ao carregar dados do tutor");
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) {
      carregarTutor();
    }
  }, [usuarioId]);

  async function handleSalvarPet(dadosPet) {
    try {
      setLoading(true);
      if (petEditando) {
        const dadosAtualizar = {
          nome: dadosPet.nome,
          especie: dadosPet.especie,
          raca: dadosPet.raca,
          idade: dadosPet.idade,
          sexo: dadosPet.sexo,
          observacoes: dadosPet.observacoes,
        };
        
        if (dadosPet.peso > 0) {
          dadosAtualizar.peso = dadosPet.peso;
        }
        
        await petsService.update(parseInt(petEditando.id), dadosAtualizar);
      }
      setModalAberta(false);
      setPetEditando(null);
      await carregarPerfil();
    } catch (err) {
      console.error("Erro ao salvar pet:", err);
      setError("Erro ao salvar pet");
    } finally {
      setLoading(false);
    }
  }

  async function carregarPerfil() {
    try {
      const resTutor = await tutoresService.getById(parseInt(usuarioId));
      const resPets = await petsService.list({ tutor_id: usuarioId });

      const perfilFormatado = {
        id: resTutor.data.id,
        nome: resTutor.data.nome,
        cpf: resTutor.data.cpf,
        dataNascimento: "",
        celular: resTutor.data.telefone,
        genero: "",
        email: resTutor.data.login || "",
        tipoAcesso: "Cliente",
        endereco: {
          logradouro: resTutor.data.endereco || "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          complemento: "",
          pontoReferencia: "",
        },
        animais: resPets.data.map((pet) => ({
          id: pet.id.toString(),
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca || "",
          sexo: pet.sexo || "",
          idade: pet.idade ? `${pet.idade} anos` : "",
          idade_anos: pet.idade || 0,
          peso: pet.peso || 0,
          observacoes: pet.observacoes || "",
          foto: null,
        })),
      };

      setPerfil(perfilFormatado);
    } catch (err) {
      console.error("Erro ao carregar tutor:", err);
      setError(err.message || "Erro ao carregar dados do tutor");
    }
  }

  async function handleDeletarPet() {
    if (!petDeletando) return;
    try {
      setLoading(true);
      await petsService.delete(parseInt(petDeletando.id));
      setPetDeletando(null);
      await carregarPerfil();
    } catch (err) {
      console.error("Erro ao deletar pet:", err);
      setError("Erro ao deletar pet");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">{error || "Usuário não encontrado."}</p>
          <button
            onClick={onVoltar}
            className="text-purple-600 hover:text-purple-800 text-sm font-semibold"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const temEndereco = perfil.endereco?.logradouro || perfil.endereco?.cidade;

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="max-w-4xl w-full mx-auto px-8 py-8">

        <button
          onClick={onVoltar}
          className="flex items-center gap-1 text-gray-400 hover:text-purple-700 text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-purple-600">
                  {perfil.nome.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">{perfil.nome}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <TipoBadge tipo={perfil.tipoAcesso} />
                  {perfil.email && (
                    <span className="text-xs text-gray-400">{perfil.email}</span>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => onEditar?.(perfil)}
                className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-semibold border border-purple-200 hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar cadastro
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Dados Pessoais</p>
          <div className="grid grid-cols-2 gap-5">
            <InfoRow label="CPF" value={perfil.cpf} />
            <InfoRow label="Data de Nascimento" value={perfil.dataNascimento} />
            <InfoRow label="Celular" value={perfil.celular} />
            <InfoRow label="Gênero" value={perfil.genero} />
            <InfoRow label="Email" value={perfil.email} />
          </div>
        </div>

        {temEndereco && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Endereço</p>
            <div className="grid grid-cols-3 gap-5 mb-5">
              <InfoRow label="CEP" value={perfil.endereco.cep} />
              <InfoRow label="Estado" value={perfil.endereco.estado} />
              <InfoRow label="Cidade" value={perfil.endereco.cidade} />
            </div>
            <div className="grid grid-cols-3 gap-5 mb-5">
              <div className="col-span-2">
                <InfoRow label="Endereço" value={perfil.endereco.logradouro} />
              </div>
              <InfoRow label="Bairro" value={perfil.endereco.bairro} />
            </div>
            <div className="grid grid-cols-3 gap-5">
              <InfoRow label="Número" value={perfil.endereco.numero} />
              <InfoRow label="Complemento" value={perfil.endereco.complemento} />
              <InfoRow label="Ponto de referência" value={perfil.endereco.pontoReferencia} />
            </div>
          </div>
        )}

        {perfil.tipoAcesso === "Cliente" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Animais Vinculados
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {perfil.animais.length} animal{perfil.animais.length !== 1 ? "is" : ""} cadastrado{perfil.animais.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {perfil.animais.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-10 text-center">
                <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-sm text-gray-400">Nenhum animal vinculado a este tutor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {perfil.animais.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    onVerProntuario={onVerProntuario}
                    onEditar={(pet) => {
                      setPetEditando(pet);
                      setEditPetForm({
                        nome: pet.nome,
                        especie: pet.especie,
                        raca: pet.raca,
                        idade: pet.idade_anos || 0,
                        sexo: pet.sexo || 'M',
                        peso: pet.peso || 0,
                        observacoes: pet.observacoes || '',
                      });
                      setModalAberta(true);
                    }}
                    onDeletar={setPetDeletando}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      {modalAberta && petEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Editar Pet</h2>
              <button onClick={() => { setModalAberta(false); setPetEditando(null); }}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={editPetForm.nome || ''}
                  onChange={(e) => setEditPetForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Mel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Espécie *</label>
                  <select
                    value={editPetForm.especie || ''}
                    onChange={(e) => setEditPetForm(prev => ({ ...prev, especie: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-white"
                  >
                    {["Cachorro", "Gato", "Coelho", "Pássaro", "Réptil", "Roedor", "Outros"].map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Raça *</label>
                  <input
                    type="text"
                    value={editPetForm.raca || ''}
                    onChange={(e) => setEditPetForm(prev => ({ ...prev, raca: e.target.value }))}
                    placeholder="Ex: Shih Tzu"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Idade (anos)</label>
                  <input
                    type="number"
                    value={editPetForm.idade ?? 0}
                    onChange={(e) => setEditPetForm(prev => ({ ...prev, idade: e.target.value }))}
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Sexo</label>
                  <select
                    value={editPetForm.sexo || 'M'}
                    onChange={(e) => setEditPetForm(prev => ({ ...prev, sexo: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-white"
                  >
                    <option value="M">Macho</option>
                    <option value="F">Fêmea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Peso (kg)</label>
                <input
                  type="number"
                  value={editPetForm.peso ?? 0}
                  onChange={(e) => setEditPetForm(prev => ({ ...prev, peso: e.target.value }))}
                  min="0"
                  step="0.1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Observações</label>
                <textarea
                  value={editPetForm.observacoes || ''}
                  onChange={(e) => setEditPetForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Notas sobre o pet..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setModalAberta(false); setPetEditando(null); }}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editPetForm.nome || !editPetForm.especie || !editPetForm.raca) {
                    alert("Nome, espécie e raça são obrigatórios");
                    return;
                  }
                  handleSalvarPet({
                    nome: editPetForm.nome,
                    especie: editPetForm.especie,
                    raca: editPetForm.raca,
                    idade: parseInt(editPetForm.idade) || 0,
                    sexo: editPetForm.sexo,
                    peso: parseFloat(editPetForm.peso) || 0,
                    observacoes: editPetForm.observacoes,
                  });
                }}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {petDeletando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja excluir <span className="font-semibold text-gray-800">{petDeletando.nome}</span>? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPetDeletando(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletarPet}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
