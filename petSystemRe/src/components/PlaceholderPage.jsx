const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F2F5] p-8">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-sm text-center">
        <h1 className="text-4xl font-bold text-[#8A2BE2] mb-4">{title}</h1>
        <p className="text-gray-600 text-lg">
          Esta página ainda não foi implementada, mas a rota já está preparada.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
