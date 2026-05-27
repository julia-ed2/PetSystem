import { useState } from 'react';
import Button from '../components/Button';
import InputForm from '../components/Input';
import logoVet from "../assets/logoVet.png";

const CadastroPage = ({ onGoToLogin, onGoToTelaPrincipal, onRegister }) => {
    const [formData, setFormData] = useState({
        nome: '',
        login: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.login || !formData.password) {
            setError("Preencha todos os campos obrigatórios");
            return;
        }

        if (formData.password.length < 6) {
            setError("Senha deve ter no mínimo 6 caracteres");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não conferem");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await onRegister(
                formData.nome,
                formData.login,
                formData.password,
                'admin'
            );

            if (!result.success) {
                setError(result.error || "Erro ao registrar");
                return;
            }

            if (onGoToTelaPrincipal) {
                onGoToTelaPrincipal();
                return;
            }
            onGoToLogin();
        } catch (err) {
            setError("Erro de conexão com o servidor");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA]">
            <div className="hidden md:flex flex-1 items-center justify-center bg-white border-r border-gray-100">

                <div className="flex flex-col items-center justify-center gap-6">

                    <img src={logoVet} alt="Logo" className="w-[200px]" />

                    <h1 className="text-[#8A2BE2] text-5xl font-extrabold tracking-tight">
                        PetSystem
                    </h1>

                </div>

            </div>
            <div className="flex-1 flex items-center justify-center p-6 md:p-16 lg:p-24 bg-[#F5F7FA]">
                <div className="w-full max-w-xl">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h2>
                        <p className="text-gray-500 text-sm">Registre-se para acessar o PetSystem</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        <InputForm
                            id="nome"
                            label="Seu nome"
                            type="text"
                            placeholder="João Silva"
                            value={formData.nome}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <InputForm
                            id="login"
                            label="Login"
                            type="text"
                            placeholder="seu_usuario"
                            value={formData.login}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <InputForm
                            id="password"
                            label="Senha"
                            type="password"
                            placeholder="Mín. 6 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <InputForm
                            id="confirmPassword"
                            label="Confirmar senha"
                            type="password"
                            placeholder="Repita sua senha"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Registrando..." : "Cadastrar"}
                        </Button>
                        <div className="text-center mt-4">
                            <p className="text-gray-600 text-sm">
                                Já utiliza o PetSystem?{' '}
                                <button onClick={onGoToLogin} type="button" className="text-[#8A2BE2] font-bold hover:underline disabled:opacity-50" disabled={loading}>Entre</button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CadastroPage;