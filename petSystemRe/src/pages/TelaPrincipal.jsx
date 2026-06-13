import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, QuickAction } from '../components/Button';
import AppointmentCard from '../components/AppointmentCard';
import ModalRegistrarSaida from '../components/estoque/ModalRegistrarSaida';
import ModalInserirGasto from '../components/financeiro/ModalInserirGasto';
import { listarProdutos, registrarSaida } from '../services/estoqueService';
import { tutoresService } from '../services/tutoresService';
import { adicionarLancamento, listarLancamentos } from '../services/financeiroService';
import { Syringe, UserPlus, ArrowUpRight, Plus, Calendar as CalendarIcon } from 'lucide-react';

function fmtBrl(v) {
    return Number(Math.abs(v)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


export default function TelaPrincipal({ onGoToLogin, onGoToFormAgenda, appointments }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPostit, setEditingPostit] = useState(null);
    const [modalSaida, setModalSaida] = useState(false);
    const [modalGasto, setModalGasto] = useState(false);
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loadingSaida, setLoadingSaida] = useState(true);
    const [kpi, setKpi] = useState({ receita: 0, gastos: 0, caixa: 0 });
    const [alertasEstoque, setAlertasEstoque] = useState([]);

    useEffect(() => {
        const carregarDados = async () => {
            setLoadingSaida(true);
            const mesAtual = new Date().getMonth() + 1;
            const [prods, cls, lancamentos] = await Promise.all([
                listarProdutos(),
                tutoresService.list(),
                listarLancamentos(),
            ]);
            const prodsList = prods || [];
            setProdutos(prodsList);
            setClientes((cls.data || []).map((tutor) => ({
                id: tutor.id,
                nome: tutor.nome,
                cpf: tutor.cpf,
            })));

            const parseDataMes = (str) => {
                if (!str) return 0;
                const parts = String(str).split('/');
                return parts.length === 3 ? Number(parts[1]) : 0;
            };
            const doMes = (lancamentos || []).filter(l => parseDataMes(l.data) === mesAtual);
            const receita = doMes.filter(l => l.tipo === 'receita').reduce((a, l) => a + l.valor, 0);
            const gastos  = doMes.filter(l => l.tipo === 'gasto').reduce((a, l) => a + l.valor, 0);
            const caixa   = (lancamentos || []).reduce((a, l) => {
                const m = parseDataMes(l.data);
                if (m > mesAtual) return a;
                return l.tipo === 'receita' ? a + l.valor : a - l.valor;
            }, 0);
            setKpi({ receita, gastos, caixa });
            setAlertasEstoque(prodsList.filter(p => p.quantidade <= p.estoque_minimo));
            setLoadingSaida(false);
        };

        carregarDados();
    }, []);

    const handleSaidaRegistrada = async (itens, cliente) => {
        await registrarSaida(itens, cliente || null);
        setProdutos(await listarProdutos());
        setModalSaida(false);
    };

    const [postits, setPostits] = useState(() => {
        try { return JSON.parse(localStorage.getItem('petsystem_postits') || '[]'); }
        catch { return []; }
    });

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const todayAppointments = useMemo(() =>
        appointments.filter(app => app.date === todayStr).sort((a, b) => a.time.localeCompare(b.time))
        , [appointments, todayStr]);

    // modal novo aviso
    const handleAddPostit = () => {
        setEditingPostit(null);
        setIsModalOpen(true);
    };

    // modal para editar existente
    const handleEditPostit = (postit) => {
        setEditingPostit(postit);
        setIsModalOpen(true);
    };

    const persistPostits = (list) => {
        setPostits(list);
        try { localStorage.setItem('petsystem_postits', JSON.stringify(list)); } catch {}
    };

    const handleSavePostit = (text) => {
        if (!text.trim()) return;

        if (editingPostit) {
            persistPostits(postits.map(p => p.id === editingPostit.id ? { ...p, text } : p));
        } else {
            const colors = ['bg-[#FFE87F]', 'bg-[#FF9B9B]', 'bg-[#33E300]', 'bg-[#BAE1FF]'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // posição aleatória
            const randomTop = Math.floor(Math.random() * 70);
            const randomLeft = Math.floor(Math.random() * 70);
            const randomRotate = Math.floor(Math.random() * 10) - 5;

            const newPostit = {
                id: Date.now(),
                text,
                color: randomColor,
                style: {
                    top: `${randomTop}%`,
                    left: `${randomLeft}%`,
                    transform: `rotate(${randomRotate}deg)`
                }
            };
            persistPostits([...postits, newPostit]);
        }
        setIsModalOpen(false);
    };

    const handleDeletePostit = (id) => {
        persistPostits(postits.filter(p => p.id !== id));
        setIsModalOpen(false);
    };

    const handleInserirGasto = async (novoGasto) => {
        await adicionarLancamento(novoGasto);
        setModalGasto(false);
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex flex-1">
                        <div className="flex-1 p-8 overflow-y-auto">
                            {/* KPIs financeiros do mês  }
                            <section className="mb-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                                        <p className="text-sm font-semibold text-purple-600 mb-1">Receita do mês</p>
                                        <p className="text-[28px] font-bold text-gray-900 leading-none">
                                            {loadingSaida ? <span className="text-gray-300">—</span> : `R$ ${fmtBrl(kpi.receita)}`}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                                        <p className="text-sm font-semibold text-purple-600 mb-1">Gastos do mês</p>
                                        <p className="text-[28px] font-bold text-gray-900 leading-none">
                                            {loadingSaida ? <span className="text-gray-300">—</span> : `R$ ${fmtBrl(kpi.gastos)}`}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                                        <p className="text-sm font-semibold text-purple-600 mb-1">Caixa</p>
                                        <p className={`text-[28px] font-bold leading-none ${kpi.caixa < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                            {loadingSaida ? <span className="text-gray-300">—</span> : `R$ ${fmtBrl(kpi.caixa)}`}
                                        </p>
                                    </div>
                                </div>
                            </section>*/}

                            {/* Alertas de estoque mínimo */}
                            {alertasEstoque.length > 0 && (
                                <section className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-4">
                                    <p className="text-sm font-bold text-yellow-700 mb-2">
                                        Estoque abaixo do mínimo ({alertasEstoque.length} produto{alertasEstoque.length > 1 ? 's' : ''})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {alertasEstoque.map(p => (
                                            <span key={p.id} className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-3 py-1 rounded-full border border-yellow-300">
                                                {p.nome} — {p.quantidade} un
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="bg-white rounded-3xl p-8 shadow-sm mb-8">
                                <h3 className="text-black font-bold text-xl mb-6">Atalhos</h3>
                                <div className="flex flex-wrap gap-4">
                                    <QuickAction label="Registrar vacina" color="bg-[#D84382]" icon={Syringe} onClick={() => navigate('/dashboard/vacinacao')} />
                                    <QuickAction label="Cadastrar cliente" color="bg-[#D84382]" icon={UserPlus} onClick={() => navigate('/dashboard/cadastros/novo')} />
                                    <QuickAction label="Registrar saída" color="bg-[#D84382]" icon={ArrowUpRight} onClick={() => setModalSaida(true)} />
                                    <QuickAction label="Lançamento" color="bg-[#D84382]" icon={Plus} onClick={() => setModalGasto(true)} />
                                </div>
                            </section>

                            <section className="bg-white rounded-3xl p-8 shadow-sm min-h-[600px] relative">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-black font-bold text-xl">Avisos</h3>
                                    <button
                                        onClick={handleAddPostit}
                                        className="bg-[#8A2BE2] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-purple-700 transition-colors"
                                    >
                                        + Novo Aviso
                                    </button>
                                </div>

                                <div className="relative w-full h-[500px] bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 p-4 overflow-hidden">
                                    {postits.length === 0 && (
                                        <div className="flex items-center justify-center h-full text-gray-400 italic">
                                            Nenhum aviso no momento. Clique em "+ Novo Aviso".
                                        </div>
                                    )}
                                    {postits.map((postit) => (
                                        <div
                                            key={postit.id}
                                            onClick={() => handleEditPostit(postit)}
                                            style={postit.style}
                                            className={`absolute w-44 h-44 ${postit.color} shadow-md p-4 cursor-pointer hover:scale-110 hover:z-20 transition-all overflow-hidden flex items-center justify-center text-center font-medium text-gray-800 rounded-sm`}
                                        >
                                            <span className="break-words">{postit.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="w-80 bg-white p-6 shadow-sm border-l border-gray-100 flex flex-col h-screen">
                            <div className="mb-6">
                                <h3 className="text-[#8A2BE2] font-bold text-lg mb-6 text-center">Hoje</h3>
                                <p className="text-center text-gray-400 text-xs font-bold mt-1">
                                    {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1">
                                {todayAppointments.map(app => <AppointmentCard key={app.id} {...app} />)}
                            </div>
                            <button onClick={() => navigate('/dashboard/agenda')} className="mt-6 w-full bg-[#D81B60] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-100 hover:bg-[#b0164e] transition-all cursor-pointer">
                                <CalendarIcon size={20} /> Agenda completa
                            </button>
                        </aside>
                    </div>


            {/* MODAL DE EDIÇÃO / CRIAÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-bold text-gray-900">
                                {editingPostit ? 'Editar Aviso' : 'Novo Aviso'}
                            </h4>
                            {editingPostit && (
                                <button
                                    onClick={() => handleDeletePostit(editingPostit.id)}
                                    className="text-red-500 text-sm font-bold hover:underline"
                                >
                                    Excluir
                                </button>
                            )}
                        </div>

                        <textarea
                            autoFocus
                            className="w-full h-40 border-2 border-gray-100 bg-gray-50 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none resize-none mb-6 text-gray-700"
                            placeholder="Digite seu aviso aqui..."
                            defaultValue={editingPostit?.text || ''}
                            id="postit-text-input"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSavePostit(document.getElementById('postit-text-input').value)}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#8A2BE2] hover:bg-purple-700 shadow-lg shadow-purple-100 transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalSaida && (
                <ModalRegistrarSaida
                    produtos={produtos}
                    clientes={clientes}
                    onClose={() => setModalSaida(false)}
                    onSaida={handleSaidaRegistrada}
                />
            )}

            {modalGasto && (
                <ModalInserirGasto
                    onClose={() => setModalGasto(false)}
                    onInserir={handleInserirGasto}
                />
            )}
        </div>
    );
}