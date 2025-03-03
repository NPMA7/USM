const LoadingModal = () => {
  return (
    <div className="fixed inset-0 h-screen w-screen flex items-center justify-center z-50 bg-transparent backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-semibold text-center">Memproses...</h3>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal; 