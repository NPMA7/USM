export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg border border-gray-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Memuat data transaksi...</p>
          <p className="mt-2 text-red-500 font-large">
            PERHATIAN
          </p>
          <p className="mt-2 text-red-500 font-medium">
            Invoice ini hanya dapat dilihat selama 10 menit setelah dibuat. Harap segera download invoice ini.
          </p>
        </div>
      </div>
    </div>
  );
} 