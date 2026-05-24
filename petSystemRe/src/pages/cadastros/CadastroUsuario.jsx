import { useState } from "react";
import Campo from "../../components/cadastros/CampoForm";

//Tipos de acesso disponíveis DEIXAR SO UM
const TIPOS_ACESSO = [
  {
    value: "usuario",
    label: "Usuário",
    descricao: "Acesso a prontuários, cadastro de clientes e agendamentos.",
  },
  {
    value: "administrador",
    label: "Administrador",
    descricao: "Acesso completo ao sistema, incluindo cadastro de usuários e relatórios financeiros.",
  },
];


// Componente principal
/**
 * CadastrarUsuario
 *
 * Props:
 *  - onVoltar: () => void        → botão cancelar / voltar
 *  - onSalvar: (dados) => void   → submete o formulário
 *
 * chamar onSalvar(dados) 
 */
export default function CadastrarUsuario({ onVoltar, onSalvar }) {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    celular: "",
    genero: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipoAcesso: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSalvar() {
    if (!form.nome || !form.cpf || !form.celular || !form.email || !form.tipoAcesso) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!form.senha || !form.confirmarSenha) {
      setError("Senha e confirmação são obrigatórias.");
      return;
    }

    if (form.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    const { confirmarSenha, ...dados } = form;

    try {
      setLoading(true);
      setError("");
      await onSalvar?.(dados);
    } catch (err) {
      setError(err?.message || "Erro ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="max-w-4xl w-full mx-auto px-8 py-8 pb-28">

        <button
          onClick={onVoltar}
          className="flex items-center gap-1 text-gray-500 hover:text-purple-700 text-sm mb-6 transition-colors"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
        
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Cadastrar Usuário</h1>
          <p className="text-sm text-gray-400 mt-1">Preencha as informações do colaborador</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          
          <Campo
            label="Nome completo (obrigatório):"
            value={form.nome}
            onChange={(v) => set("nome", v)}
          />

          <div className="grid grid-cols-2 gap-5">
            <Campo
              label="CPF (obrigatório):"
              value={form.cpf}
              onChange={(v) => set("cpf", v)}
              placeholder="000.000.000-00"
              mask="cpf"
            />
            <Campo
              label="Data de Nascimento (opcional):"
              value={form.dataNascimento}
              onChange={(v) => set("dataNascimento", v)}
              type="date"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Campo
              label="Celular (obrigatório):"
              value={form.celular}
              onChange={(v) => set("celular", v)}
              placeholder="(00) 00000-0000"
              mask="phone"
            />
            <div>
              <label className="text-sm text-gray-700 mb-1.5 block">Gênero (opcional):</label>
              <select
                value={form.genero}
                onChange={(e) => set("genero", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Campo
              label="Email (obrigatório):"
              value={form.email}
              onChange={(v) => set("email", v)}
              type="email"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Campo
              label="Senha (obrigatório):"
              value={form.senha}
              onChange={(v) => set("senha", v)}
              type="password"
              placeholder="Mínimo 8 caracteres"
            />
            <Campo
              label="Confirmar senha (obrigatório):"
              value={form.confirmarSenha}
              onChange={(v) => set("confirmarSenha", v)}
              type="password"
              placeholder="Repita a senha"
            />
          </div>

          <div className="pt-2">
            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
              Tipo de Acesso (obrigatório):
            </p>

            <div className="space-y-3">
              {TIPOS_ACESSO.map((tipo) => {
                const selecionado = form.tipoAcesso === tipo.value;
                return (
                  <button
                    key={tipo.value}
                    onClick={() => set("tipoAcesso", tipo.value)}
                    className={`w-full text-left border-2 rounded-2xl px-5 py-4 transition-all min-h-[88px] ${
                      selecionado
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-100 bg-gray-50 hover:border-purple-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selecionado ? "border-purple-600" : "border-gray-300"
                      }`}>
                        {selecionado && (
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-sm font-semibold ${selecionado ? "text-purple-700" : "text-gray-700"}`}>
                          {tipo.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{tipo.descricao}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5">
          <div className="bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-100 flex justify-between items-center py-5 px-8">
            <button
              onClick={onVoltar}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-24 py-4 rounded-2xl transition-colors shadow-md cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-24 py-4 rounded-2xl transition-colors shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}