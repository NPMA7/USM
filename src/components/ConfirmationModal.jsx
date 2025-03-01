export default function ConfirmationModal({ onConfirm, onDismiss, isLoading = false, isLoadingDismiss = false }) {
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
            disabled={isLoading || isLoadingDismiss}
            className={`flex-1 ${(isLoading || isLoadingDismiss) ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white py-2 px-4 rounded font-semibold transition duration-300 flex items-center justify-center`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Memproses...
              </div>
            ) : (
              "Ya, Batalkan"
            )}
          </button>
          <button
            onClick={onDismiss}
            disabled={isLoading || isLoadingDismiss}
            className={`flex-1 ${(isLoading || isLoadingDismiss) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-4 rounded font-semibold transition duration-300 flex items-center justify-center`}
          >
            {isLoadingDismiss ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Memproses...
              </div>
            ) : (
              "Tidak, Lanjutkan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
