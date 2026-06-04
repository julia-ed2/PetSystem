import { LayoutGrid, Calendar, Syringe, ClipboardList, Users, Box, Wallet } from 'lucide-react';
import logoPet from '../assets/logoVet.png';

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

// MENU LATERAL COMPLETO
const Sidebar = ({ activePage, onNavigate, onLogout }) => {
    const menuItems = [
        { label: 'Página Inicial', icon: LayoutGrid },
        { label: 'Agenda', icon: Calendar },
        { label: 'Vacinação', icon: Syringe },
        { label: 'Prontuários', icon: ClipboardList },
        { label: 'Cadastros', icon: Users },
        { label: 'Estoque', icon: Box },
        { label: 'Financeiro', icon: Wallet }
    ];

    return (
        <aside className="w-64 bg-white flex flex-col shadow-xl h-screen sticky top-0 z-10">
            <div className="p-6 mb-4 flex items-center gap-2 text-[#8A2BE2]">
                <div className="w-10 h-10 flex items-center justify-center">
                    <img src={logoPet} alt="" />
                </div>
                <h1 className="text-2xl font-bold italic">PetSystem</h1>
            </div>

            <nav className="flex-1">
                {menuItems.map((item) => (
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