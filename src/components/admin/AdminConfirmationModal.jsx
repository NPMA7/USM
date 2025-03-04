import React from 'react';

const AdminConfirmationModal = ({ message, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h3 className="text-lg font-semibold">Konfirmasi Penghapusan</h3>
        <p className="mt-2">{message}</p>
        <div className="flex justify-between mt-8">
          <button
            onClick={onCancel}
            disabled={isLoading || isLoading} // Menonaktifkan tombol Batal saat tombol Hapus ditekan
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${isLoading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 text-white rounded hover:bg-red-700'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Memproses...
              </div>
            ) : (
              "Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmationModal;