import { useEffect, useMemo, useState } from "react";
import FiltroDropdown from "../../components/cadastros/Filtro";
import AcoesDropdown from "../../components/cadastros/Acoes";
import { tutoresService } from "../../services/tutoresService";
import { petsService } from "../../services/petsService";
import { usuariosService } from "../../services/usuariosService";

export const TIPOS_ACESSO = {
  CLIENTE: "Cliente",
  USUARIO: "Usuário",
  ADMINISTRADOR: "Administrador",
};

function mapTipoUsuario(tipo) {
  if (tipo === "admin") return TIPOS_ACESSO.ADMINISTRADOR;
  return TIPOS_ACESSO.USUARIO;
}

function badgeColor(tipo) {
  switch (tipo) {
    case TIPOS_ACESSO.ADMINISTRADOR:
      return "bg-purple-100 text-purple-700 border border-purple-200";
    case TIPOS_ACESSO.USUARIO:
      return "bg-blue-100 text-blue-700 border border-blue-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
}

function SortLabel({ active, direction }) {
  return (
    <span className="text-[10px] font-bold text-gray-400 leading-none">
      {active ? (direction === "asc" ? "▲" : "▼") : ""}
    </span>
  );
}

function ModalConfirmarExclusao({ usuario, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar exclusão</h3>
        <p className="text-sm text-gray-600 mb-6">
          Tem certeza que deseja excluir <span className="font-semibold text-gray-800">{usuario.nome}</span>? Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancelar}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm">
            Cancelar
          </button>
          <button onClick={onConfirmar}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}


export default function Cadastros({
  isAdmin = true,
  onCadastrarCliente,
  onCadastrarUsuario,
  onVerPerfil,
  onVerAnimais,
}) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
  const [tutorParaNovoPet, setTutorParaNovoPet] = useState(null);
  const [modalNovoPetAberta, setModalNovoPetAberta] = useState(false);
  const [novoPet, setNovoPet] = useState({ nome: "", especie: "Cachorro", raca: "", idade: 0, sexo: "M", peso: 0, observacoes: "" });
  const [sortConfig, setSortConfig] = useState({ key: "nome", direction: "asc" });

  useEffect(() => {
    const carregarRegistros = async () => {
      try {
        setLoading(true);
        setError("");

        const [resTutores, resUsuarios] = await Promise.allSettled([
          tutoresService.list(),
          usuariosService.list(),
        ]);

        const tutoresFormatados = (resTutores.status === "fulfilled" ? resTutores.value.data : []).map((tutor) => ({
          id: `tutor-${tutor.id}`,
          backendId: tutor.id,
          origem: "tutor",
          nome: tutor.nome,
          animais: tutor.pets && tutor.pets.length > 0 ? tutor.pets.map((p) => p.nome) : [],
          tipoAcesso: TIPOS_ACESSO.CLIENTE,
          cpf: tutor.cpf,
          celular: tutor.telefone,
          email: tutor.login,
        }));

        const usuariosSistemaFormatados = (
          resUsuarios.status === "fulfilled" ? (resUsuarios.value.data || []) : []
        ).map((usuario) => ({
          id: `user-${usuario.id}`,
          backendId: usuario.id,
          origem: "user",
          nome: usuario.nome,
          animais: [],
          tipoAcesso: mapTipoUsuario(usuario.tipo),
          cpf: "",
          celular: "",
          email: usuario.login,
        }));

        setUsuarios([...tutoresFormatados, ...usuariosSistemaFormatados]);

        if (resTutores.status === "rejected" && resUsuarios.status === "rejected") {
          setError("Erro ao carregar registros");
        } else if (resUsuarios.status === "rejected") {
          setError("Usuários do sistema indisponíveis no momento. Clientes foram carregados.");
        }
      } catch (err) {
        console.error("Erro ao carregar registros:", err);
        setError("Erro ao carregar registros");
      } finally {
        setLoading(false);
      }
    };

    carregarRegistros();
  }, [isAdmin]);

  const usuariosFiltrados = useMemo(() => {
    const termoBusca = busca.toLowerCase();

    const filtrados = usuarios.filter((u) => {
      const matchBusca =
        !busca ||
        u.nome.toLowerCase().includes(termoBusca) ||
        u.animais.some((a) => a.toLowerCase().includes(termoBusca)) ||
        (u.cpf || "").includes(termoBusca) ||
        (u.celular || "").includes(termoBusca) ||
        (u.email || "").toLowerCase().includes(termoBusca);

      const matchTipo = filtroTipo === "Todos" || u.tipoAcesso === filtroTipo;

      return matchBusca && matchTipo;
    });

    const factor = sortConfig.direction === "asc" ? 1 : -1;

    return [...filtrados].sort((a, b) => {
      const toText = (value) => (value || "").toString().toLowerCase();

      if (sortConfig.key === "animais") {
        return toText(a.animais.join(", ")).localeCompare(toText(b.animais.join(", ")), "pt-BR") * factor;
      }

      if (sortConfig.key === "tipoAcesso") {
        return toText(a.tipoAcesso).localeCompare(toText(b.tipoAcesso), "pt-BR") * factor;
      }

      return toText(a.nome).localeCompare(toText(b.nome), "pt-BR") * factor;
    });
  }, [usuarios, busca, filtroTipo, sortConfig]);

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function handleEditar(usuario) {
    console.log("Editar:", usuario);
  }

  function handleExcluir(usuario) {
    setUsuarioParaExcluir(usuario);
  }

  function confirmarExclusao() {
    if (!usuarioParaExcluir) return;

    const deletarRegistro = async () => {
      try {
        if (usuarioParaExcluir.origem === "tutor") {
          await tutoresService.delete(usuarioParaExcluir.backendId);
        } else {
          await usuariosService.delete(usuarioParaExcluir.backendId);
        }

        setUsuarios((prev) => prev.filter((u) => u.id !== usuarioParaExcluir.id));
        setUsuarioParaExcluir(null);
      } catch (err) {
        console.error("Erro ao deletar registro:", err);
        setError(err.message || "Erro ao deletar registro");
      }
    };

    deletarRegistro();
  }

  async function handleAdicionarPet() {
    if (!tutorParaNovoPet || tutorParaNovoPet.origem !== "tutor") {
      setError("Só é possível adicionar pet para clientes.");
      return;
    }

    if (!novoPet.nome || !novoPet.especie || !novoPet.raca) {
      alert("Nome, espécie e raça são obrigatórios");
      return;
    }

    try {
      setLoading(true);
      const dadosPet = {
        tutor_id: tutorParaNovoPet.backendId,
        nome: novoPet.nome,
        especie: novoPet.especie,
        raca: novoPet.raca,
        idade: parseInt(novoPet.idade) || 0,
        sexo: novoPet.sexo,
        observacoes: novoPet.observacoes,
      };
      
      const peso = parseFloat(novoPet.peso) || 0;
      if (peso > 0) {
        dadosPet.peso = peso;
      }
      
      await petsService.create(dadosPet);

      setUsuarios((prev) =>
        prev.map((usuario) => {
          if (usuario.id !== tutorParaNovoPet.id) {
            return usuario;
          }

          return {
            ...usuario,
            animais: [...usuario.animais, novoPet.nome],
          };
        })
      );

      setModalNovoPetAberta(false);
      setTutorParaNovoPet(null);
      setNovoPet({ nome: "", especie: "Cachorro", raca: "", idade: 0, sexo: "M", peso: 0, observacoes: "" });
    } catch (err) {
      console.error("Erro ao criar pet:", err);
      setError("Erro ao criar pet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="flex justify-end items-center gap-3 px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
        <button
          onClick={onCadastrarCliente}
          className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Cadastrar cliente
        </button>

        {isAdmin && (
          <button
            onClick={onCadastrarUsuario}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Cadastrar usuário
          </button>
        )}
      </div>

      <div className="px-8 py-6 max-w-5xl w-full mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-5">Usuários Cadastrados</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar clientes, animal, CPF, celular ou email..."
              className="w-full bg-white border-none rounded-2xl p-4 pl-14 outline-none shadow-sm focus:ring-2 ring-purple-200 transition-all text-gray-700 placeholder:text-gray-300"
            />
            <svg className="w-6 h-6 text-gray-300 absolute left-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <FiltroDropdown
            isAdmin={isAdmin}
            filtroTipo={filtroTipo}
            onChange={setFiltroTipo}
          />
        </div>

        {filtroTipo !== "Todos" && (
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="bg-purple-50 text-[#8A2BE2] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
              Tipo: {filtroTipo}
              <button onClick={() => setFiltroTipo("Todos")}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto] items-center px-5 py-3 border-b border-gray-100 gap-4">
            <button
              type="button"
              onClick={() => handleSort("nome")}
              className="text-sm font-semibold text-gray-700 flex items-center gap-2 text-left"
            >
              <span>Nome</span>
              <SortLabel active={sortConfig.key === "nome"} direction={sortConfig.direction} />
            </button>
            <button
              type="button"
              onClick={() => handleSort("animais")}
              className="text-sm font-semibold text-gray-700 flex items-center gap-2 text-left"
            >
              <span>Animais</span>
              <SortLabel active={sortConfig.key === "animais"} direction={sortConfig.direction} />
            </button>
            <button
              type="button"
              onClick={() => handleSort("tipoAcesso")}
              className="text-sm font-semibold text-gray-700 flex items-center gap-2 text-left"
            >
              <span>Tipo de acesso</span>
              <SortLabel active={sortConfig.key === "tipoAcesso"} direction={sortConfig.direction} />
            </button>
            <span className="w-8" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Nenhum usuário encontrado.
            </div>
          ) : (
            usuariosFiltrados.map((u, i) => (
              <div
                key={u.id}
                className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 ${
                  i < usuariosFiltrados.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (u.origem === "tutor") {
                      onVerPerfil?.(u.backendId);
                    }
                  }}
                  className="text-sm text-gray-800 font-medium text-left truncate"
                >
                  {u.nome}
                </button>
                <div>
                  {u.animais.length > 0 ? (
                    <button
                      onClick={() => onVerAnimais?.(u.animais, u)}
                      className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors text-left truncate"
                    >
                      {u.animais.join(", ")}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center justify-center text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor(u.tipoAcesso)}`}>
                    {u.tipoAcesso}
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {u.origem === "tutor" ? (
                    <button
                      onClick={() => {
                        setTutorParaNovoPet(u);
                        setModalNovoPetAberta(true);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Adicionar Pet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ) : (
                    <span className="p-2 w-8 h-8 invisible" aria-hidden="true" />
                  )}
                  <AcoesDropdown
                    usuario={u}
                    isAdmin={isAdmin}
                    onEditar={handleEditar}
                    onExcluir={handleExcluir}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && (
          <p className="text-xs text-gray-400 mt-3">
            {usuariosFiltrados.length} registro{usuariosFiltrados.length !== 1 ? "s" : ""} encontrado{usuariosFiltrados.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {usuarioParaExcluir && (
        <ModalConfirmarExclusao
          usuario={usuarioParaExcluir}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setUsuarioParaExcluir(null)}
        />
      )}

      {modalNovoPetAberta && tutorParaNovoPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Adicionar Pet para {tutorParaNovoPet.nome}</h2>
              <button onClick={() => setModalNovoPetAberta(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={novoPet.nome}
                  onChange={(e) => setNovoPet({ ...novoPet, nome: e.target.value })}
                  placeholder="Ex: Mel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Espécie *</label>
                  <select
                    value={novoPet.especie}
                    onChange={(e) => setNovoPet({ ...novoPet, especie: e.target.value })}
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
                    value={novoPet.raca}
                    onChange={(e) => setNovoPet({ ...novoPet, raca: e.target.value })}
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
                    value={novoPet.idade}
                    onChange={(e) => setNovoPet({ ...novoPet, idade: e.target.value })}
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Sexo</label>
                  <select
                    value={novoPet.sexo}
                    onChange={(e) => setNovoPet({ ...novoPet, sexo: e.target.value })}
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
                  value={novoPet.peso}
                  onChange={(e) => setNovoPet({ ...novoPet, peso: e.target.value })}
                  min="0"
                  step="0.1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Observações</label>
                <textarea
                  value={novoPet.observacoes}
                  onChange={(e) => setNovoPet({ ...novoPet, observacoes: e.target.value })}
                  placeholder="Notas sobre o pet..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalNovoPetAberta(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarPet}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm disabled:opacity-50"
              >
                Adicionar Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
