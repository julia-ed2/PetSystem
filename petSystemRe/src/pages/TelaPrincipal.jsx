import React from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, QuickAction } from '../components/Button';
import AppointmentCard from '../components/AppointmentCard';
import { Syringe, UserPlus, ArrowUpRight, Plus, Calendar as CalendarIcon } from 'lucide-react';


export default function TelaPrincipal({ onGoToLogin, onGoToFormAgenda, appointments }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPostit, setEditingPostit] = useState(null);

    
    const [postits, setPostits] = useState([
    //VAZIO POR ENQUANTO    
    ]);

    const demoDateStr = '2026-04-03';
    const todayAppointments = useMemo(() =>
        appointments.filter(app => app.date === demoDateStr).sort((a, b) => a.time.localeCompare(b.time))
        , [appointments]);

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

    // att
    const handleSavePostit = (text) => {
        if (!text.trim()) return;

        if (editingPostit) {
            setPostits(postits.map(p => p.id === editingPostit.id ? { ...p, text } : p));
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
            setPostits([...postits, newPostit]);
        }
        setIsModalOpen(false);
    };

    // função de excluir 
    const handleDeletePostit = (id) => {
        setPostits(postits.filter(p => p.id !== id));
        setIsModalOpen(false);
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex flex-1">
                        <div className="flex-1 p-8 overflow-y-auto">
                            <section className="bg-white rounded-3xl p-8 shadow-sm mb-8">
                                <h3 className="text-black font-bold text-xl mb-6">Atalhos</h3>
                                <div className="flex flex-wrap gap-4">
                                    <QuickAction label="Registrar vacina" color="bg-[#D84382]" icon={Syringe} onClick={() => navigate('/dashboard/vacinacao')} />
                                    <QuickAction label="Cadastrar cliente" color="bg-[#D84382]" icon={UserPlus} onClick={() => navigate('/dashboard/cadastros')} />
                                    <QuickAction label="Registrar saída" color="bg-[#D84382]" icon={ArrowUpRight} />
                                    <QuickAction label="Lançar serviço" color="bg-[#D84382]" icon={Plus} />
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

                        <aside className="w-80 bg-white p-6 shadow-sm border-l border-gray-100 overflow-y-auto">
                            <h3 className="text-[#8A2BE2] font-bold text-lg mb-6 text-center">Hoje - 03 de Abril</h3>
                            {todayAppointments.map(app => <AppointmentCard key={app.id} {...app} />)}
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
        </div>
    );
}