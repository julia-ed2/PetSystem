import "../style.css";
import { useState } from "react";
import { Button } from "./../components/Button";
import InputForm from "../components/Input";
import logoVet from "../assets/logoVet.png";

const Login = ({ onGoToCadastroPage, onGoToTelaPrincipal, onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!login || !password) {
            setError("Preencha login e senha");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await onLogin(login, password);

            if (!result.success) {
                setError(result.error || "Erro ao fazer login");
                return;
            }

            onGoToTelaPrincipal();
        } catch (err) {
            setError("Erro de conexão com o servidor");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

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
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Painel de Acesso</h2>
                        <p className="text-gray-500 text-sm">Insira suas credenciais de acesso</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <InputForm
                            id="login"
                            label="Login"
                            type="text"
                            placeholder="Seu login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            disabled={loading}
                        />

                        <div className="relative">
                            <InputForm
                                id="password"
                                label="Senha"
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <div className="flex justify-end mt-[-8px]">
                                <button
                                    type="button"
                                    className="text-[#8A2BE2] text-sm font-bold hover:underline disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-gray-600 text-sm">
                                Sua clínica ainda não usa o PetSystem?{' '}
                                <button onClick={onGoToCadastroPage} type="button" className="text-[#8A2BE2] font-bold hover:underline disabled:opacity-50" disabled={loading}>Cadastre-se.</button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;