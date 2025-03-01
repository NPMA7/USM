export default function InvoiceHeader({ tournament }) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-800">Invoice {tournament}</h1>
      <p className="text-gray-500">Terima kasih telah melakukan pembayaran</p>
      
      <div className="mt-4 text-gray-600 text-sm text-center">
        <p className="mt-2 text-red-500 font-medium">
          Harap kirimkan bukti pembayaran ini kepada CS/Admin jika dalam 24 jam belum dimasukkan ke dalam grup WhatsApp.
        </p>
      </div>
      
      <div className="flex justify-center my-4">
        <div className="bg-green-500 p-4 rounded-full">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
} 