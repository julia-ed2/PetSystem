import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthExpiryHandler() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  const handleLogin = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setOpen(false);
    navigate('/');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-96 p-6">
        <h3 className="text-lg font-bold mb-2">Sessão expirada</h3>
        <p className="text-sm text-gray-600 mb-4">Sua sessão expirou. Por favor, faça login novamente.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-md border">Fechar</button>
          <button onClick={handleLogin} className="px-4 py-2 rounded-md bg-[#8A2BE2] text-white">Entrar</button>
        </div>
      </div>
    </div>
  );
}
