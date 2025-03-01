export default function RegistrationForm({ 
  tournament, 
  amount, 
  name, 
  setName, 
  email, 
  setEmail, 
  whatsapp, 
  setWhatsapp, 
  teamName, 
  setTeamName, 
  handlePayment, 
  isFormValid, 
  isLoading, 
  processingPayment, 
  preparingInvoice, 
  onClose 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-center mb-6">
          Form Pendaftaran {tournament === "MobileLegend" ? "Mobile Legends" : "Free Fire"}
        </h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            placeholder="Nama Tim"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            placeholder="Nomor WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold">Detail Turnamen:</p>
            <p className="text-gray-600">Game: {tournament === "MobileLegend" ? "Mobile Legends" : "Free Fire"}</p>
            <p className="text-gray-600">Biaya: Rp {amount.toLocaleString()}</p>
          </div>

          <button
            onClick={handlePayment}
            disabled={!isFormValid() || isLoading || processingPayment || preparingInvoice}
            className={`w-full p-4 rounded-lg font-bold transition duration-300 mt-6 ${
              isFormValid() && !isLoading && !processingPayment && !preparingInvoice
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Memproses...
              </div>
            ) : processingPayment ? (
              <div className="flex items-center justify-center">
                <div className="animate-pulse rounded-full h-6 w-6 bg-blue-400 mr-2"></div>
                Menunggu Pembayaran...
              </div>
            ) : preparingInvoice ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-2"></div>
                Sedang Menyiapkan Invoice...
              </div>
            ) : (
              "Lanjutkan ke Pembayaran"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
