import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet, useLocation, useParams } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { usuariosService } from '../services/usuariosService';
import { agendamentosService } from '../services/agendamentosService';

import Login from './Login';
import CadastroPage from './Cadastro';
import TelaPrincipal from './TelaPrincipal';
import ViewAgenda from './agenda/Agenda';
import FormNewAppointment from './agenda/FormAgenda';
import Sidebar from '../components/Menu';
import AuthExpiryHandler from '../components/AuthExpiryHandler';

const ViewVaccination  = lazy(() => import('./Vacinacao'));
const Estoque          = lazy(() => import('./Estoque'));
const Financeiro       = lazy(() => import('./Financeiro'));
const ViewProntuarios  = lazy(() => import('./prontuario/Prontuario'));
const ProntuarioDetalhe = lazy(() => import('./prontuario/ProntuarioDetalhe'));
const EditarPet        = lazy(() => import('./prontuario/EditarPet'));
const Cadastros        = lazy(() => import('./cadastros/Cadastros'));
const CadastrarCliente = lazy(() => import('./cadastros/CadastrarCliente'));
const CadastrarUsuario = lazy(() => import('./cadastros/CadastroUsuario'));
const PerfilUsuario    = lazy(() => import('./cadastros/PerfilUsuario'));


// Roles com acesso ao painel web (clientes usam o app mobile)
const STAFF_ROLES = ['admin', 'gerente', 'atendente', 'veterinario'];
// Roles com acesso a estoque e financeiro
const MANAGEMENT_ROLES = ['admin', 'gerente'];
// Roles com acesso a cadastros
const RECEPTION_ROLES = ['admin', 'gerente', 'atendente'];

function RoleGuard({ allowedRoles, children }) {
    const { user } = useAuth();
    if (!allowedRoles.includes(user?.tipo)) {
        return <Navigate replace to="/dashboard" />;
    }
    return children;
}

export default function App() {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);

    const role = user?.tipo || 'atendente';
    const isAdmin = role === 'admin';
    const canManageOperational = role === 'admin' || role === 'atendente' || role === 'gerente';

    const formatHora = (hora) => {
        if (!hora) return '';
        if (hora.length >= 5) return hora.slice(0, 5);
        return hora;
    };

    const mapAgendamento = (item) => ({
        id: item.id,
        type: item.tipo,
        time: formatHora(item.hora),
        patient: item.pet_nome || 'Pet',
        procedure: item.observacoes || item.tipo,
        doctor: item.veterinario_nome || 'Veterinario',
        date: item.data,
    });

    const carregarAgendamentos = async () => {
        try {
            setAppointmentsLoading(true);
            const res = await agendamentosService.list();
            const data = (res.data || []).map(mapAgendamento);
            setAppointments(data);
        } catch {
            setAppointments([]);
        } finally {
            setAppointmentsLoading(false);
        }
    };

    useEffect(() => {
        carregarAgendamentos();
    }, []);

    const handleAddNewAppointment = async (appointmentData) => {
        const hora = appointmentData.time
            ? (appointmentData.time.length === 5 ? `${appointmentData.time}:00` : appointmentData.time)
            : '';

        await agendamentosService.create({
            pet_id: appointmentData.petId,
            veterinario_id: appointmentData.vetId,
            data: appointmentData.date,
            hora,
            tipo: appointmentData.type,
            observacoes: appointmentData.procedure || '',
            status: 'agendado',
        });

        await carregarAgendamentos();
    };

    return (
        <BrowserRouter>
            <AuthExpiryHandler />
            <Routes>
                <Route path="/" element={<LoginWrapper />} />
                <Route path="/cadastro" element={<CadastroWrapper />} />
                <Route path="/agenda" element={<Navigate replace to="/dashboard/agenda" />} />
                <Route path="/vacinacao" element={<Navigate replace to="/dashboard/vacinacao" />} />
                <Route path="/dashboard" element={<DashboardLayout onLogout={logout} />}>
                    <Route index element={<TelaPrincipalWrapper appointments={appointments} />} />
                    <Route path="agenda" element={<AgendaWrapper appointments={appointments} loading={appointmentsLoading} />} />
                    <Route
                        path="form-agenda"
                        element={
                            <FormAgendaWrapper
                                onSubmit={handleAddNewAppointment}
                            />
                        }
                    />
                    <Route path="vacinacao" element={<VacinacaoWrapper canManage={canManageOperational} />} />
                    <Route path="prontuarios" element={<ProntuariosWrapper />} />
                    <Route path="prontuarios/:id" element={<ProntuarioDetalheWrapper isAdmin={isAdmin} />} />
                    <Route path="prontuarios/:id/editar" element={<EditarPetWrapper />} />
                    <Route path="cadastros" element={
                        <RoleGuard allowedRoles={RECEPTION_ROLES}>
                            <CadastrosWrapper isAdmin={isAdmin} />
                        </RoleGuard>
                    } />
                    <Route path="cadastros/novo" element={
                        <RoleGuard allowedRoles={RECEPTION_ROLES}>
                            <CadastrarClienteWrapper />
                        </RoleGuard>
                    } />
                    <Route path="cadastros/novo-usuario" element={<CadastrarUsuarioWrapper isAdmin={isAdmin} />} />
                    <Route path="cadastros/:id" element={
                        <RoleGuard allowedRoles={RECEPTION_ROLES}>
                            <PerfilUsuarioWrapper isAdmin={isAdmin} />
                        </RoleGuard>
                    } />
                    <Route path="estoque" element={
                        <RoleGuard allowedRoles={MANAGEMENT_ROLES}>
                            <EstoqueWrapper canManage={canManageOperational} />
                        </RoleGuard>
                    } />
                    <Route path="financeiro" element={
                        <RoleGuard allowedRoles={MANAGEMENT_ROLES}>
                            <FinanceiroWrapper appointments={appointments} canManage={canManageOperational} />
                        </RoleGuard>
                    } />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

function DashboardLayout({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A2BE2]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (user?.tipo === 'cliente') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm">
                    <p className="text-2xl font-bold text-[#8A2BE2] mb-2">Acesso restrito</p>
                    <p className="text-gray-500 mb-6">O painel web é exclusivo para funcionários da clínica. Use o aplicativo mobile para acessar suas informações.</p>
                    <button
                        onClick={async () => { await onLogout?.(); navigate('/'); }}
                        className="bg-[#8A2BE2] text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition-colors"
                    >
                        Voltar ao login
                    </button>
                </div>
            </div>
        );
    }

    const activePage = getActivePageFromPath(location.pathname);

    const handleMenuNavigate = (label) => {
        const routeMap = {
            'Página Inicial': '/dashboard',
            'Agenda': '/dashboard/agenda',
            'Vacinação': '/dashboard/vacinacao',
            'Prontuários': '/dashboard/prontuarios',
            'Cadastros': '/dashboard/cadastros',
            'Estoque': '/dashboard/estoque',
            'Financeiro': '/dashboard/financeiro',
        };

        const nextPath = routeMap[label] || '/dashboard';
        navigate(nextPath);
    };

    return (
        <div className="flex min-h-screen bg-[#F0F2F5]">
            <Sidebar
                activePage={activePage}
                userRole={user?.tipo}
                onNavigate={handleMenuNavigate}
                onLogout={async () => {
                    await onLogout?.();
                    navigate('/');
                }}
            />
            <main className="flex-1 overflow-hidden">
                <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center h-full">
                        <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
}

function getActivePageFromPath(pathname) {
    if (pathname.startsWith('/dashboard/vacinacao')) return 'Vacinação';
    if (pathname.startsWith('/dashboard/agenda')) return 'Agenda';
    if (pathname.startsWith('/dashboard/prontuarios')) return 'Prontuários';
    if (pathname.startsWith('/dashboard/cadastros')) return 'Cadastros';
    if (pathname.startsWith('/dashboard/estoque')) return 'Estoque';
    if (pathname.startsWith('/dashboard/financeiro')) return 'Financeiro';
    if (pathname.startsWith('/dashboard')) return 'Página Inicial';
    return 'Página Inicial';
}

/* ---------------- WRAPPERS ---------------- */

function LoginWrapper() {
    const navigate = useNavigate();
    const { login } = useAuth();

    return (
        <Login
            onGoToCadastroPage={() => navigate('/cadastro')}
            onGoToTelaPrincipal={() => navigate('/dashboard')}
            onLogin={login}
        />
    );
}

function CadastroWrapper() {
    const navigate = useNavigate();
    const { register } = useAuth();

    return (
        <CadastroPage
            onGoToLogin={() => navigate('/')}
            onGoToTelaPrincipal={() => navigate('/dashboard')}
            onRegister={register}
        />
    );
}

function TelaPrincipalWrapper({ appointments }) {
    const navigate = useNavigate();

    return (
        <TelaPrincipal
            appointments={appointments}
            onGoToFormAgenda={() => navigate('/dashboard/form-agenda')}
        />
    );
}

function CadastrosWrapper({ isAdmin }) {
    const navigate = useNavigate();

    return (
        <Cadastros
            isAdmin={isAdmin}
            onCadastrarCliente={() => navigate('/dashboard/cadastros/novo')}
            onCadastrarUsuario={() => navigate('/dashboard/cadastros/novo-usuario')}
            onVerPerfil={(id) => navigate(`/dashboard/cadastros/${id}`)}
            onVerAnimais={(animais, usuario) => {
                if (animais && animais.length > 0) {
                    navigate('/dashboard/prontuarios');
                }
            }}
        />
    );
}

function CadastrarClienteWrapper() {
    const navigate = useNavigate();

    return (
        <CadastrarCliente
            onVoltar={() => navigate('/dashboard/cadastros')}
            onSalvar={() => navigate('/dashboard/cadastros')}
            onVerProntuario={() => navigate('/dashboard/prontuarios')}
        />
    );
}

function CadastrarUsuarioWrapper({ isAdmin }) {
    const navigate = useNavigate();

    if (!isAdmin) {
        return <Navigate replace to="/dashboard/cadastros" />;
    }

    const mapTipoUsuario = (tipoAcesso) => {
        if (tipoAcesso === 'administrador') return 'admin';
        return 'atendente';
    };

    const salvarUsuario = async (dados) => {
        return usuariosService.create({
            nome: dados.nome,
            login: dados.email,
            password: dados.senha,
            tipo: mapTipoUsuario(dados.tipoAcesso),
        });
    };

    return (
        <CadastrarUsuario
            onVoltar={() => navigate('/dashboard/cadastros')}
            onSalvar={async (dados) => {
                await salvarUsuario(dados);
                navigate('/dashboard/cadastros');
            }}
        />
    );
}

function PerfilUsuarioWrapper({ isAdmin }) {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <PerfilUsuario
            usuarioId={id}
            isAdmin={isAdmin}
            onVoltar={() => navigate('/dashboard/cadastros')}
            onEditar={() => navigate('/dashboard/cadastros')}
            onVerProntuario={() => navigate('/dashboard/prontuarios')}
        />
    );
}

function AgendaWrapper({ appointments, loading }) {
    const navigate = useNavigate();

    return (
        <ViewAgenda
            appointments={appointments}
            loading={loading}
            onNewAppointment={() => navigate('/dashboard/form-agenda')}
        />
    );
}

function FormAgendaWrapper({ onSubmit }) {
    const navigate = useNavigate();

    const handleSubmit = async (data) => {
        await onSubmit(data);
        navigate('/dashboard/agenda'); // volta pra agenda depois de salvar
    };

    return (
        <FormNewAppointment
            onSubmit={handleSubmit}
            onGoToAgenda={() => navigate('/dashboard/agenda')}
        />
    );
}

function VacinacaoWrapper({ canManage }) {
    return <ViewVaccination canManage={canManage} />;
}

function ProntuariosWrapper() {
    return <ViewProntuarios />;
}

function ProntuarioDetalheWrapper({ isAdmin }) {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <ProntuarioDetalhe
            prontuarioId={id}
            isAdmin={isAdmin}
            onVoltar={() => navigate('/dashboard/prontuarios')}
        />
    );
}

function EditarPetWrapper() {
    return <EditarPet />;
}

function EstoqueWrapper({ canManage }) {
    return <Estoque canManage={canManage} />;
}

function FinanceiroWrapper({ appointments = [], canManage }) {
    return (
        <Financeiro
            agendamentos={appointments}
            prontuarios={[]}
            vendas={[]}
            canManage={canManage}
        />
    );
}
