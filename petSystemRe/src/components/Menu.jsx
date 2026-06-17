import { LayoutGrid, Calendar, Syringe, ClipboardList, Users, Box, Wallet } from 'lucide-react';
import logoPet from '../assets/logoVet.png';

const MENU_ITEMS = [
    { label: 'Página Inicial', icon: LayoutGrid, roles: ['admin', 'gerente', 'atendente', 'veterinario'] },
    { label: 'Agenda',         icon: Calendar,     roles: ['admin', 'gerente', 'atendente', 'veterinario'] },
    { label: 'Vacinação',      icon: Syringe,      roles: ['admin', 'gerente', 'atendente', 'veterinario'] },
    { label: 'Prontuários',    icon: ClipboardList, roles: ['admin', 'gerente', 'atendente', 'veterinario'] },
    { label: 'Cadastros',      icon: Users,        roles: ['admin', 'gerente', 'atendente'] },
    { label: 'Estoque',        icon: Box,          roles: ['admin', 'gerente'] },
    { label: 'Financeiro',     icon: Wallet,       roles: ['admin', 'gerente'] },
];

const MenuItem = ({ label, active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-6 py-3 text-lg font-medium transition-colors ${active
            ? 'bg-[#8A2BE2] text-white'
            : 'text-[#8A2BE2] hover:bg-purple-50'
            }`}
    >
        <div className="w-6 h-6 flex items-center justify-center">
            {Icon ? <Icon size={20} /> : <div className="w-5 h-5 border border-current rounded-sm opacity-50" />}
        </div>
        {label}
    </button>
);

const Sidebar = ({ activePage, onNavigate, onLogout, userRole }) => {
    const visibleItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

    return (
        <aside className="w-64 bg-white flex flex-col shadow-xl h-screen sticky top-0 z-10">
            <div className="p-6 mb-4 flex items-center gap-2 text-[#8A2BE2]">
                <div className="w-10 h-10 flex items-center justify-center">
                    <img src={logoPet} alt="" />
                </div>
                <h1 className="text-2xl font-bold italic">PetSystem</h1>
            </div>

            <nav className="flex-1">
                {visibleItems.map((item) => (
                    <MenuItem
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        active={activePage === item.label}
                        onClick={() => onNavigate(item.label)}
                    />
                ))}
            </nav>

            <div className="p-6">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-[#8A2BE2] text-[#8A2BE2] rounded-full font-bold hover:bg-purple-50 transition-colors"
                >
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
