import { useState } from "react";

export default function NovoRegistro({ onClose, onSave }) {
  const abas = ["Consultas", "Vacinas", "Cirurgias", "Exames"];
  const [abaAtiva, setAbaAtiva] = useState("Consultas");

  // Campos compartilhados
  const [dataHora, setDataHora] = useState("");
  const [veterinario, setVeterinario] = useState("");

  // Consulta
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [peso, setPeso] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [freqCardiaca, setFreqCardiaca] = useState("");
  const [diagnostico, setDiagnostico] = useState("");

  // Vacina
  const [nomeVacina, setNomeVacina] = useState("");
  const [lote, setLote] = useState("");
  const [proximoReforcao, setProximoReforcao] = useState("");
  const [obsVacina, setObsVacina] = useState("");

  // Cirurgia
  const [tipoCirurgia, setTipoCirurgia] = useState("");
  const [obsCirurgia, setObsCirurgia] = useState("");

  // Exame
  const [tipoExame, setTipoExame] = useState("");
  const [laudo, setLaudo] = useState("");

  const [error, setError] = useState("");

  const labelSalvar = {
    Consultas: "Salvar Consulta",
    Vacinas: "Salvar Vacina",
    Cirurgias: "Salvar Cirurgia",
    Exames: "Salvar Laudo",
  }[abaAtiva];

  function handleSalvar() {
    if (!dataHora || !veterinario) {
      setError("Data e veterinário são obrigatórios.");
      return;
    }
    if (abaAtiva === "Consultas" && !motivoConsulta) {
      setError("Informe o motivo da consulta.");
      return;
    }
    if (abaAtiva === "Vacinas" && !nomeVacina) {
      setError("Informe o nome da vacina.");
      return;
    }
    if (abaAtiva === "Cirurgias" && !tipoCirurgia) {
      setError("Informe o tipo de cirurgia.");
      return;
    }
    if (abaAtiva === "Exames" && !tipoExame) {
      setError("Informe o tipo de exame.");
      return;
    }
    setError("");
    const base = { dataHora, veterinario };
    let novoRegistro = {};
    if (abaAtiva === "Consultas") {
      novoRegistro = { ...base, tipo: "Consulta", descricao: motivoConsulta, peso, temperatura, freqCardiaca, observacoes: diagnostico };
    } else if (abaAtiva === "Vacinas") {
      novoRegistro = { ...base, tipo: "Vacinação", descricao: nomeVacina, lote, proximoReforcao, observacoes: obsVacina };
    } else if (abaAtiva === "Cirurgias") {
      novoRegistro = { ...base, tipo: "Cirurgia", descricao: tipoCirurgia, observacoes: obsCirurgia };
    } else {
      novoRegistro = { ...base, tipo: "Exame", descricao: tipoExame, observacoes: laudo };
    }
    onSave(novoRegistro);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Novo Registro no Histórico</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-200 mb-5">
          {abas.map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                abaAtiva === aba
                  ? "text-pink-500 border-b-2 border-pink-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {aba}
            </button>
          ))}
        </div>

        {/* Campos comuns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Data e hora:</label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Veterinário responsável:</label>
            <input
              type="text"
              value={veterinario}
              onChange={(e) => setVeterinario(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* Campos específicos por aba */}
        {abaAtiva === "Consultas" && (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Motivo da consulta:</label>
              <input type="text" value={motivoConsulta} onChange={(e) => setMotivoConsulta(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Peso:</label>
                <input type="text" value={peso} onChange={(e) => setPeso(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Temperatura:</label>
                <input type="text" value={temperatura} onChange={(e) => setTemperatura(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Frequência cardíaca:</label>
                <input type="text" value={freqCardiaca} onChange={(e) => setFreqCardiaca(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Diagnóstico / Prescrição:</label>
              <textarea rows={4} value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
            </div>
          </>
        )}

        {abaAtiva === "Vacinas" && (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Nome da vacina:</label>
              <input type="text" value={nomeVacina} onChange={(e) => setNomeVacina(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Lote / fabricante:</label>
                <input type="text" value={lote} onChange={(e) => setLote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Próximo reforço:</label>
                <input type="date" value={proximoReforcao} onChange={(e) => setProximoReforcao(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Observações:</label>
              <textarea rows={4} value={obsVacina} onChange={(e) => setObsVacina(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
            </div>
          </>
        )}

        {abaAtiva === "Cirurgias" && (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Tipo de cirurgia:</label>
              <input type="text" value={tipoCirurgia} onChange={(e) => setTipoCirurgia(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Observações:</label>
              <textarea rows={5} value={obsCirurgia} onChange={(e) => setObsCirurgia(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
            </div>
          </>
        )}

        {abaAtiva === "Exames" && (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Tipo de exame:</label>
              <input type="text" value={tipoExame} onChange={(e) => setTipoExame(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-1 block">Laudo digital:</label>
              <textarea rows={6} value={laudo} onChange={(e) => setLaudo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Rodapé */}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSalvar}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 transition-colors">
            {labelSalvar}
          </button>
        </div>
      </div>
    </div>
  );
}
