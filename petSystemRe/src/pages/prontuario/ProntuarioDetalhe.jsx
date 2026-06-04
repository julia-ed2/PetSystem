import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import HistoricoCard from "../../components/prontuario/HistoricoCard";
import NovoRegistro from "../../components/prontuario/NovoRegistro";
import ProntuarioPrint from "../../components/prontuario/ProntuarioPrint";
import { petsService } from "../../services/petsService";
import { tutoresService } from "../../services/tutoresService";
import { useAuth } from "../../hooks/useAuth";


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
 
  substituir o `mockProntuario` pela chamada fetch dentro do useEffect.
 */


export default function ProntuarioDetalhe({ prontuarioId, onVoltar }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.nivel_acesso === 'admin' || user?.nivel_acesso === 'gerente';
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState("Todos");
    const [modalNovoRegistro, setModalNovoRegistro] = useState(false);

    const mapHistorico = (records) => {
        return records.map((record) => {
            const data = record.data ? new Date(record.data) : (record.date ? new Date(record.date) : null);
            return {
                id: `h-${record.id}`,
                tipo: record.tipo || "Consulta",
                data: data ? data.toLocaleDateString('pt-BR') : "",
                hora: data ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : (record.hora || ""),
                veterinario: record.veterinario || record.veterinarian || "Veterinário",
                descricao: record.descricao || record.treatment || record.diagnosis || "",
                observacoes: record.observacoes || record.notes || "",
                proximoReforcao: record.proximoReforco || record.next_dose_date || null,
                arquivo: null,
            };
        });
    };

    const carregarDados = async () => {
        if (!prontuarioId) return;
        try {
            setLoading(true);
            setError('');

            const resPet = await petsService.getById(parseInt(prontuarioId));
            const pet = resPet.data;

            const resTutor = pet.tutor_id
                ? await tutoresService.getById(pet.tutor_id)
                : { data: null };

            const resRecords = await petsService.getRecords(parseInt(prontuarioId));
            const historico = mapHistorico(resRecords.data || []);

            const perfil = {
                pet: {
                    id: pet.id,
                    nome: pet.nome,
                    foto: null,
                    especie: pet.especie,
                    raca: pet.raca || "",
                    sexo: pet.sexo || "",
                    idade: pet.idade ? `${pet.idade} anos` : "",
                    observacoes: pet.observacoes || "",
                },
                tutor: resTutor.data
                    ? {
                        nome: resTutor.data.nome,
                        genero: "",
                        dataNascimento: "",
                        cpf: resTutor.data.cpf,
                        celular: resTutor.data.telefone,
                        email: resTutor.data.login,
                        endereco: resTutor.data.endereco,
                        complemento: "",
                    }
                    : {
                        nome: "Tutor",
                        genero: "",
                        dataNascimento: "",
                        cpf: "",
                        celular: "",
                        email: "",
                        endereco: "",
                        complemento: "",
                    },
                historico,
            };

            setDados(perfil);
        } catch (err) {
            setError(err.message || 'Erro ao carregar prontuario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [prontuarioId]);

    // Filtro
    const historicFiltrado = (dados?.historico || []).filter((item) => {
        const tipo = TIPO_MAP[filtroAtivo];
        return tipo === null || item.tipo === tipo;
    });

    function handleEditar() {
        navigate(`/dashboard/prontuarios/${prontuarioId}/editar`);
    }

    function handleNovoRegistro() {
        setModalNovoRegistro(true);
    }

    async function handleSalvarRegistro(novoItem) {
        try {
            setLoading(true);
            await petsService.createRecord(parseInt(prontuarioId), {
                diagnosis: novoItem.tipo,
                treatment: novoItem.descricao,
                notes: novoItem.observacoes || "",
            });
            setModalNovoRegistro(false);
            await carregarDados();
        } catch (err) {
            setError(err.message || 'Erro ao salvar registro');
        } finally {
            setLoading(false);
        }
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

    if (error || !dados) {
        return (
            <div className="flex-1 flex items-center justify-center h-screen">
                <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error || 'Erro ao carregar prontuario'}
                </div>
            </div>
        );
    }

    const { pet, tutor } = dados;

    return (
        <div className="flex-1 min-h-screen bg-gray-50 flex flex-col">
            <div className="screen-only flex-1 px-8 py-6 max-w-4xl w-full mx-auto">

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

            <ProntuarioPrint dados={dados} />

            {/* imprimir */}
            <div className="no-print sticky bottom-0 bg-gray-50 border-t border-gray-100 px-8 py-4 flex justify-end">
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