import { useRouter } from "next/navigation";

export default function ErrorDisplay({ error }) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg border border-gray-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="mt-2 text-red-500 font-medium">
            Invoice untuk order ini telah menghilang.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white font-semibold py-2 mt-3 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    </div>
  );
} 