export default function ConfirmationModal({ onConfirm, onDismiss }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-center mb-6">Konfirmasi Pembatalan</h3>
        <p className="text-gray-600 mb-6 text-center">
          Apakah Anda yakin ingin membatalkan pembayaran ini?
        </p>
        <div className="flex justify-between gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded font-semibold hover:bg-red-600 transition duration-300"
          >
            Ya, Batalkan
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded font-semibold hover:bg-blue-600 transition duration-300"
          >
            Tidak, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}
