import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';

import Login from './Login';
import CadastroPage from './Cadastro';
import TelaPrincipal from './TelaPrincipal';
import ViewAgenda from './agenda/Agenda';
import FormNewAppointment from './agenda/FormAgenda';
import ViewVaccination from './Vacinacao';
import PlaceholderPage from '../components/PlaceholderPage';
import Sidebar from '../components/Menu';

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
                    <Route path="prontuarios" element={<PlaceholderPage title="Prontuários" />} />
                    <Route path="cadastros" element={<PlaceholderPage title="Cadastros" />} />
                    <Route path="estoque" element={<PlaceholderPage title="Estoque" />} />
                    <Route path="financeiro" element={<PlaceholderPage title="Financeiro" />} />
                </Route>
            </Routes>
        </BrowserRouter>
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

    return (
        <Login
            onGoToCadastroPage={() => navigate('/cadastro')}
            onGoToTelaPrincipal={() => navigate('/dashboard')}
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