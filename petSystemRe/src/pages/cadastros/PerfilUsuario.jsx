import { useState, useEffect } from "react";

// ─── Perfis de usuário de exemplo ──────────────────────────────────────────────
// Substitua pela chamada real à API quando o backend estiver pronto.
const mockPerfis = [
  {
    id: "1",
    nome: "Julia Eduarda Fernandes Silva",
    cpf: "111.111.111-11",
    dataNascimento: "01/12/2006",
    celular: "(34) 99999-9999",
    genero: "Feminino",
    email: "juliaefs@unipam.edu.br",
    tipoAcesso: "Cliente",
    endereco: {
      cep: "38700-000",
      estado: "MG",
      cidade: "Patos de Minas",
      logradouro: "Rua Major Gote",
      numero: "1",
      bairro: "Caiçaras",
      complemento: "",
      pontoReferencia: "Em frente ao UNIPAM",
    },
    animais: [
      {
        id: "a1",
        nome: "Theo",
        especie: "Cachorro",
        raca: "Shih Tzu",
        sexo: "Macho",
        idade: "5 anos",
        observacoes: "Castrado",
        foto: null,
      },
      {
        id: "a2",
        nome: "Mel",
        especie: "Gato",
        raca: "SRD",
        sexo: "Fêmea",
        idade: "3 anos",
        observacoes: "",
        foto: null,
      },
      {
        id: "a3",
        nome: "Pitoco",
        especie: "Cachorro",
        raca: "Poodle",
        sexo: "Macho",
        idade: "2 anos",
        observacoes: "",
        foto: null,
      },
    ],
  },
  {
    id: "2",
    nome: "Sara Ferreira Rodrigues",
    cpf: "222.222.222-22",
    dataNascimento: "15/09/1995",
    celular: "(34) 98888-8888",
    genero: "Feminino",
    email: "sara@email.com",
    tipoAcesso: "Cliente",
    endereco: {
      cep: "38700-100",
      estado: "MG",
      cidade: "Patos de Minas",
      logradouro: "Rua das Flores",
      numero: "123",
      bairro: "Centro",
      complemento: "Apto 45",
      pontoReferencia: "Próximo ao supermercado",
    },
    animais: [
      {
        id: "a4",
        nome: "Nego Ney",
        especie: "Cachorro",
        raca: "SRD",
        sexo: "Macho",
        idade: "4 anos",
        observacoes: "Vacinado",
        foto: null,
      },
      {
        id: "a5",
        nome: "Neve",
        especie: "Gato",
        raca: "Persa",
        sexo: "Fêmea",
        idade: "2 anos",
        observacoes: "Sensível a alimento",
        foto: null,
      },
    ],
  },
  {
    id: "3",
    nome: "Julia Eduarda",
    cpf: "333.333.333-33",
    dataNascimento: "03/05/1992",
    celular: "(34) 97777-7777",
    genero: "Feminino",
    email: "julia.admin@petsystem.com",
    tipoAcesso: "Administrador",
    endereco: {
      cep: "38700-200",
      estado: "MG",
      cidade: "Patos de Minas",
      logradouro: "Avenida Principal",
      numero: "500",
      bairro: "Bela Vista",
      complemento: "",
      pontoReferencia: "Em frente à clínica",
    },
    animais: [],
  },
];

// ─── Badge de tipo de acesso ──────────────────────────────────────────────────
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

// ─── Card de animal ───────────────────────────────────────────────────────────
function AnimalCard({ animal, onVerProntuario }) {
  return (
    <div
      onClick={() => onVerProntuario?.(animal)}
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-purple-200 cursor-pointer transition-all group"
    >
      {/* Avatar */}
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
  );
}

// ─── Linha de info ────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
/**
 * PerfilUsuario
 *
 * Props:
 *  - usuarioId: string              → ID do usuário para buscar na API
 *  - isAdmin: boolean               → exibe opções de edição/exclusão
 *  - onVoltar: () => void           → botão voltar
 *  - onEditar: (dados) => void      → abre edição do cadastro
 *  - onVerProntuario: (animal) => void → navega para o prontuário do animal
 *
 * Quando o backend estiver pronto, descomente o useEffect abaixo
 * e substitua mockPerfil pela resposta da API.
 */
export default function PerfilUsuario({
  usuarioId,
  isAdmin = false,
  onVoltar,
  onEditar,
  onVerProntuario,
}) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Substitua pelo fetch real quando o backend estiver pronto:
    // fetch(`/api/usuarios/${usuarioId}`)
    //   .then((r) => r.json())
    //   .then(setPerfil)
    //   .finally(() => setLoading(false));

    setTimeout(() => {
      const perfilAtual = mockPerfis.find((perfil) => perfil.id === usuarioId) || null;
      setPerfil(perfilAtual);
      setLoading(false);
    }, 400);
  }, [usuarioId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-400 text-sm">Usuário não encontrado.</p>
      </div>
    );
  }

  const temEndereco = perfil.endereco?.logradouro || perfil.endereco?.cidade;

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="max-w-4xl w-full mx-auto px-8 py-8">

        {/* ── Botão voltar ──────────────────────────────────────────────── */}
        <button
          onClick={onVoltar}
          className="flex items-center gap-1 text-gray-400 hover:text-purple-700 text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        {/* ── Cabeçalho do perfil ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
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

            {/* Botão editar — somente admin */}
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

        {/* ── Dados pessoais ────────────────────────────────────────────── */}
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

        {/* ── Endereço ─────────────────────────────────────────────────── */}
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

        {/* ── Animais vinculados (só para clientes) ─────────────────── */}
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
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}