import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import HistoricoCard from "../../components/prontuario/HistoricoCard";
import NovoRegistro from "../../components/prontuario/NovoRegistro";

// TESTE 
const mockProntuario = {
    pet: {
        id: "1",
        nome: "Theo",
        foto: null,
        especie: "Cachorro",
        raca: "Shih Tzu",
        sexo: "Macho",
        idade: "5 anos",
        observacoes: "Castrado",
    },
    tutor: {
        nome: "Julia Eduarda Fernandes Silva",
        genero: "Feminino",
        dataNascimento: "01/12/2006",
        cpf: "111.111.111-11",
        celular: "(34) 99999-9999",
        email: "juliaefs@unipam.edu.br",
        endereco: "Rua Major Gote, número 1. Bairro Caiçaras - Patos de Minas, Minas Gerais.",
        complemento: "Em frente ao UNIPAM",
    },
    historico: [
        {
            id: "h1",
            tipo: "Vacinação",
            data: "02/04/2026",
            hora: "10:15",
            veterinario: "Dr. Exemplo 1",
            descricao: "Vacina V10, Lote #154V10",
            proximoReforcao: "02/04/2027",
            observacoes: "",
            arquivo: null,
        },
        {
            id: "h2",
            tipo: "Cirurgia",
            data: "08/02/2026",
            hora: "14:30",
            veterinario: "Dr. Exemplo 2",
            descricao: "Castração",
            observacoes: "Procedimento ocorreu sem nenhuma complicação",
            arquivo: null,
        },
        {
            id: "h3",
            tipo: "Consulta",
            data: "06/02/2026",
            hora: "08:00",
            veterinario: "Dr. Exemplo 3",
            descricao: "Consulta de rotina",
            observacoes: "",
            arquivo: null,
        },
        {
            id: "h4",
            tipo: "Exame",
            data: "25/01/2026",
            hora: "16:45",
            veterinario: "Dr. Exemplo 3",
            descricao: "Hemograma completo",
            observacoes: "",
            arquivo: "laudo_exame.pdf",
        },
    ],
};

const TIPO_COLOR = {
    Vacinação: "text-purple-600",
    Cirurgia: "text-purple-600",
    Consulta: "text-purple-600",
    Exame: "text-purple-600",
};

const FILTROS = ["Todos", "Consultas", "Vacinas", "Cirurgias", "Exames"];

const TIPO_MAP = {
    Todos: null,
    Consultas: "Consulta",
    Vacinas: "Vacinação",
    Cirurgias: "Cirurgia",
    Exames: "Exame",
};


// principal
/*
    ProntuarioDetalhe
 
  Props:
   - prontuarioId: string  → ID do prontuário para buscar na API
   - isAdmin: boolean       → habilita o botão de edição no caso de ser adm
 
  Quando o backend estiver pronto, substituir o `mockProntuario` pela chamada fetch dentro do useEffect.
 */


// isAdm esta true para testes  
export default function ProntuarioDetalhe({ prontuarioId, isAdmin = true, onVoltar }) {
    const navigate = useNavigate();
    const [dados, setDados] = useState(mockProntuario); // -TROCAR POR FETCH
    const [loading, setLoading] = useState(false);
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");
    const [modalNovoRegistro, setModalNovoRegistro] = useState(false);

    useEffect(() => {
        if (!prontuarioId) return;
        // buscar dados reais do prontuário quando o backend estiver pronto.
    }, [prontuarioId]);

    // BACKEND PRONTO (tirar do comentario):
    /*
       useEffect(() => {
         if (!prontuarioId) return;
         setLoading(true);
         fetch(`/api/prontuarios/${prontuarioId}`)
           .then((r) => r.json())
           .then((data) => setDados(data))
           .catch((err) => console.error('Erro ao buscar prontuário:', err))
           .finally(() => setLoading(false));
       }, [prontuarioId]);
    
       dados via prontuarioId
      */

    // Filtro 
    const historicFiltrado = dados.historico.filter((item) => {
        const tipo = TIPO_MAP[filtroAtivo];
        return tipo === null || item.tipo === tipo;
    });

    function handleEditar() {
        navigate(`/dashboard/prontuarios/${prontuarioId}/editar`);
    }

    function handleNovoRegistro() {
        setModalNovoRegistro(true);
    }

    function handleSalvarRegistro(novoItem) {
        // Aqui você enviaria para a API: POST /api/prontuarios/:id/historico
        const id = `h${Date.now()}`;
        const [dataPart, horaPart] = (novoItem.dataHora || "").split("T");
        const dataFormatada = dataPart
            ? dataPart.split("-").reverse().join("/")
            : "";
        const horaFormatada = horaPart ? horaPart.slice(0, 5) : "";

        setDados((prev) => ({
            ...prev,
            historico: [
                {
                    id,
                    tipo: novoItem.tipo,
                    data: dataFormatada,
                    hora: horaFormatada,
                    veterinario: novoItem.veterinario,
                    descricao: novoItem.descricao,
                    observacoes: novoItem.observacoes || "",
                    arquivo: null,
                    ...(novoItem.proximoReforcao && { proximoReforcao: novoItem.proximoReforcao }),
                },
                ...prev.historico,
            ],
        }));
        setModalNovoRegistro(false);
    }

    function handleImprimir() {
        window.print();
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const { pet, tutor, historico } = dados;

    return (
        <div className="flex-1 min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 px-8 py-6 max-w-4xl w-full mx-auto">

                {/* voltar */}
                <button
                    onClick={() => onVoltar ? onVoltar() : navigate('/dashboard/prontuarios')}
                    className="flex items-center gap-1 text-gray-500 hover:text-purple-700 text-sm mb-5 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar
                </button>

                {/* pet */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-800 flex-shrink-0 overflow-hidden">
                            {pet.foto ? (
                                <img src={pet.foto} alt={pet.nome} className="w-full h-full object-cover" />
                            ) : null}
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 flex-1">{pet.nome}</h1>

                        <div className="flex items-center gap-2">
                            {/* botão editar — somente admins */}
                            {isAdmin && (
                                <button
                                    onClick={handleEditar}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Editar cadastro"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            )}

                            <button
                                onClick={handleNovoRegistro}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Atualizar histórico
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1 mt-4 text-sm">
                        <p><span className="font-semibold text-gray-700">Espécie:</span> <span className="text-gray-600">{pet.especie}</span></p>
                        <p><span className="font-semibold text-gray-700">Sexo:</span> <span className="text-gray-600">{pet.sexo}</span></p>
                        <p><span className="font-semibold text-gray-700">Raça:</span> <span className="text-gray-600">{pet.raca}</span></p>
                        <p><span className="font-semibold text-gray-700">Idade:</span> <span className="text-gray-600">{pet.idade}</span></p>
                        {pet.observacoes && (
                            <p className="col-span-2"><span className="font-semibold text-gray-700">Observações:</span> <span className="text-gray-600">{pet.observacoes}</span></p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-100 rounded-2xl p-5 mb-5">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Informações do Tutor</p>
                    <div className="grid grid-cols-2 gap-y-1 text-sm mb-2">
                        <p className="col-span-2 font-semibold text-gray-800">{tutor.nome}</p>
                        <p><span className="font-semibold text-gray-700">Gênero:</span> <span className="text-gray-600">{tutor.genero}</span></p>
                        <p><span className="font-semibold text-gray-700">CPF:</span> <span className="text-gray-600">{tutor.cpf}</span></p>
                        <p><span className="font-semibold text-gray-700">Data de Nascimento:</span> <span className="text-gray-600">{tutor.dataNascimento}</span></p>
                        <p><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-600">{tutor.email}</span></p>
                        <p><span className="font-semibold text-gray-700">Celular:</span> <span className="text-gray-600">{tutor.celular}</span></p>
                    </div>
                    <p className="text-sm text-gray-600">{tutor.endereco}</p>
                    {tutor.complemento && <p className="text-sm text-gray-600">{tutor.complemento}</p>}
                </div>

                <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Histórico do Animal</p>

                    {/* botões de filtro */}
                    <div className="flex gap-2 flex-wrap mb-5">
                        {FILTROS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltroAtivo(f)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filtroAtivo === f
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : "bg-white text-gray-600 border-gray-300 hover:border-purple-400 hover:text-purple-600"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div>
                        {historicFiltrado.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-10">Nenhum registro encontrado.</p>
                        ) : (
                            historicFiltrado.map((item) => (
                                <HistoricoCard key={item.id} item={item} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* imprimir - atualmente esta tirando print da tela, depois tem que mudar */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-8 py-4 flex justify-end">
                <button
                    onClick={handleImprimir}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-8 py-3 rounded-2xl transition-colors shadow-md"
                >
                    Imprimir
                </button>
            </div>

            {/* ── Modal Novo Registro ──────────────────────────────────── */}
            {modalNovoRegistro && (
                <NovoRegistro
                    onClose={() => setModalNovoRegistro(false)}
                    onSave={handleSalvarRegistro}
                />
            )}
        </div>
    );
}