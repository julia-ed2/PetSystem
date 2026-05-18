import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet, useLocation, useParams } from 'react-router-dom';

import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { usuariosService } from '../services/usuariosService';

import Login from './Login';
import CadastroPage from './Cadastro';
import TelaPrincipal from './TelaPrincipal';
import ViewAgenda from './agenda/Agenda';
import FormNewAppointment from './agenda/FormAgenda';
import ViewVaccination from './Vacinacao';
import PlaceholderPage from '../components/PlaceholderPage';
import Sidebar from '../components/Menu';
import ViewProntuarios from './prontuario/Prontuario';
import ProntuarioDetalhe from './prontuario/ProntuarioDetalhe';
import EditarPet from './prontuario/EditarPet';
import Cadastros from './cadastros/Cadastros';
import CadastrarCliente from './cadastros/CadastrarCliente';
import CadastrarUsuario from './cadastros/CadastroUsuario';
import PerfilUsuario from './cadastros/PerfilUsuario';


export default function App() {
    const [appointments, setAppointments] = useState([
        { id: 1, type: 'EXAME', time: '09:00', patient: 'Mel', procedure: 'Hemograma completo', doctor: 'Dr. exemplo 1', date: '2026-04-03' },
        { id: 2, type: 'EXAME', time: '10:30', patient: 'Theo', procedure: 'Ultrassom', doctor: 'Dr. exemplo 2', date: '2026-04-03' },
        { id: 3, type: 'CIRURGIA', time: '13:00', patient: 'Pitoco', procedure: 'Castração', doctor: 'Dr. exemplo 3', date: '2026-04-03' },
    ]);

    const handleAddNewAppointment = (appointmentData) => {
        const newAppointment = {
            id: Date.now(),
            ...appointmentData,
            colorClass:
                appointmentData.type === 'CIRURGIA'
                    ? 'border-red-500'
                    : 'border-blue-500',
        };

        setAppointments((prev) => [...prev, newAppointment]);
    };

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginWrapper />} />
                    <Route path="/cadastro" element={<CadastroWrapper />} />
                    <Route path="/agenda" element={<Navigate replace to="/dashboard/agenda" />} />
                    <Route path="/vacinacao" element={<Navigate replace to="/dashboard/vacinacao" />} />
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<TelaPrincipalWrapper appointments={appointments} />} />
                        <Route path="agenda" element={<AgendaWrapper appointments={appointments} />} />
                        <Route
                            path="form-agenda"
                            element={
                                <FormAgendaWrapper
                                    onSubmit={handleAddNewAppointment}
                                />
                            }
                        />
                        <Route path="vacinacao" element={<VacinacaoWrapper />} />
                        <Route path="prontuarios" element={<ProntuariosWrapper />} />
                        <Route path="prontuarios/:id" element={<ProntuarioDetalheWrapper />} />
                        <Route path="prontuarios/:id/editar" element={<EditarPetWrapper />} />
                        <Route path="cadastros" element={<CadastrosWrapper />} />
                        <Route path="cadastros/novo" element={<CadastrarClienteWrapper />} />
                        <Route path="cadastros/novo-usuario" element={<CadastrarUsuarioWrapper />} />
                        <Route path="cadastros/:id" element={<PerfilUsuarioWrapper />} />
                        <Route path="estoque" element={<PlaceholderPage title="Estoque" />} />
                        <Route path="financeiro" element={<PlaceholderPage title="Financeiro" />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();

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
                onNavigate={handleMenuNavigate}
                onLogout={() => navigate('/')}
            />
            <main className="flex-1 overflow-hidden">
                <Outlet />
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

    return <CadastroPage onGoToLogin={() => navigate('/')} />;
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

function CadastrosWrapper() {
    const navigate = useNavigate();

    return (
        <Cadastros
            isAdmin={true}
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

function CadastrarUsuarioWrapper() {
    const navigate = useNavigate();

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

function PerfilUsuarioWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <PerfilUsuario
            usuarioId={id}
            isAdmin={true}
            onVoltar={() => navigate('/dashboard/cadastros')}
            onEditar={() => navigate('/dashboard/cadastros')}
            onVerProntuario={() => navigate('/dashboard/prontuarios')}
        />
    );
}

function AgendaWrapper({ appointments }) {
    const navigate = useNavigate();

    return (
        <ViewAgenda
            appointments={appointments}
            onNewAppointment={() => navigate('/dashboard/form-agenda')}
        />
    );
}

function FormAgendaWrapper({ onSubmit }) {
    const navigate = useNavigate();

    const handleSubmit = (data) => {
        onSubmit(data);
        navigate('/dashboard/agenda'); // volta pra agenda depois de salvar
    };

    return (
        <FormNewAppointment
            onSubmit={handleSubmit}
            onGoToAgenda={() => navigate('/dashboard/agenda')}
        />
    );
}

function VacinacaoWrapper() {
    return <ViewVaccination />;
}

function ProntuariosWrapper() {
    return <ViewProntuarios />;
}

function ProntuarioDetalheWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <ProntuarioDetalhe
            prontuarioId={id}
            isAdmin={true}
            onVoltar={() => navigate('/dashboard/prontuarios')}
        />
    );
}

function EditarPetWrapper() {
    return <EditarPet />;
}