function ModalConfirmarExclusao({ usuario, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar exclusão</h3>
        <p className="text-sm text-gray-600 mb-6">
          Tem certeza que deseja excluir <span className="font-semibold text-gray-800">{usuario.nome}</span>? Essa ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancelar}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm">
            Cancelar
          </button>
          <button onClick={onConfirmar}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmarExclusao;