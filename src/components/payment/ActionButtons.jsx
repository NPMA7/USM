import { useRouter } from "next/navigation";

export default function ActionButtons({ downloadInvoice }) {
  const router = useRouter();
  
  return (
    <>
      <button
        onClick={downloadInvoice}
        className="w-full bg-blue-600 text-white font-semibold py-2 mt-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
      >
        Download Invoice
      </button>

      <button
        onClick={() => router.push('/')}
        className="w-full bg-gray-600 text-white font-semibold py-2 mt-3 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
      >
        Kembali ke Halaman Utama
      </button>
    </>
  );
} 