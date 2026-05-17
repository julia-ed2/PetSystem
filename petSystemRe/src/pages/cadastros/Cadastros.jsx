import { useState, useEffect, useRef, useCallback } from "react";
import FiltroDropdown from "../../components/cadastros/Filtro";
import AcoesDropdown from "../../components/cadastros/Acoes";
import ModalConfirmarExclusao from "../../components/cadastros/ModalConfirmarExclusao";

//  tipos de acesso 
export const TIPOS_ACESSO = {
  CLIENTE: "Cliente",
  USUARIO: "Usuário",
  ADMINISTRADOR: "Administrador",
};

// Mock data - APAGAR DEPOIS
const mockUsuarios = [
  {
    id: "1",
    nome: "Julia Eduarda Fernandes Silva",
    animais: ["Theo", "Mel", "Pitoco"],
    tipoAcesso: TIPOS_ACESSO.CLIENTE,
    cpf: "111.111.111-11",
    celular: "(34) 99999-9999",
    email: "juliaefs@unipam.edu.br",
  },
  {
    id: "2",
    nome: "Sara Ferreira Rodrigues",
    animais: ["Nego Ney", "Neve", "Maya"],
    tipoAcesso: TIPOS_ACESSO.CLIENTE,
    cpf: "222.222.222-22",
    celular: "(34) 98888-8888",
    email: "sara@email.com",
  },
  {
    id: "3",
    nome: "Julia Eduarda",
    animais: [],
    tipoAcesso: TIPOS_ACESSO.ADMINISTRADOR,
    cpf: "333.333.333-33",
    celular: "(34) 97777-7777",
    email: "julia.admin@petsystem.com",
  },
];

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

/**
 * Cadastros
 *
 * Props:
 *  - isAdmin: boolean           → true = Administrador (vê todos os tipos)
 *  - onCadastrarCliente: fn     → abre o modal/página de cadastro de cliente
 *  - onCadastrarUsuario: fn     → abre o modal/página de cadastro de usuário
 *  - onVerAnimais: (nomes) => void → callback ao clicar nos animais de um cliente
 *
 * substituir `mockUsuarios` pela resposta da API.
 */
export default function Cadastros({
  isAdmin = true,
  onCadastrarCliente,
  onCadastrarUsuario,
  onVerPerfil,
  onVerAnimais,
}) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);

  //Carregar dados 
  useEffect(() => {
    // Simulação de fetch 
    // fetch(`/api/cadastros?isAdmin=${isAdmin}`)
    //   .then(r => r.json())
    //   .then(data => setUsuarios(data))
    //   .finally(() => setLoading(false));

    setTimeout(() => {
      // usuários normais só veem clientes (TEM QUE MUDAR ESSE NOME DEPOIS)
      setUsuarios(
        isAdmin
          ? mockUsuarios
          : mockUsuarios.filter((u) => u.tipoAcesso === TIPOS_ACESSO.CLIENTE)
      );
      setLoading(false);
    }, 400);
  }, [isAdmin]);


  const usuariosFiltrados = usuarios.filter((u) => {
    const termoBusca = busca.toLowerCase();
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

  
  function handleEditar(usuario) {
    console.log("Editar:", usuario);
  }

  function handleExcluir(usuario) {
    setUsuarioParaExcluir(usuario);
  }

  function confirmarExclusao() {
    setUsuarios((prev) => prev.filter((u) => u.id !== usuarioParaExcluir.id));
    setUsuarioParaExcluir(null);
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700 flex-1">Nome</span>
            <span className="text-sm font-semibold text-gray-700 flex-1">Animais</span>
            <span className="text-sm font-semibold text-gray-700 flex-1">Tipo de acesso</span>
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
                className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50 ${
                  i < usuariosFiltrados.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onVerPerfil?.(u.id)}
                  className="text-sm text-gray-800 font-medium flex-1 text-left"
                >
                  {u.nome}
                </button>
                <div className="flex-1">
                  {u.animais.length > 0 ? (
                    <button
                      onClick={() => onVerAnimais?.(u.animais, u)}
                      className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors text-left"
                    >
                      {u.animais.join(", ")}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>

                <div className="flex-1">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor(u.tipoAcesso)}`}>
                    {u.tipoAcesso}
                  </span>
                </div>

                <AcoesDropdown
                  usuario={u}
                  isAdmin={isAdmin}
                  onEditar={handleEditar}
                  onExcluir={handleExcluir}
                />
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
    </div>
  );
}