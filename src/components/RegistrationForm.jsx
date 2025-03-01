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
  // Handler untuk memastikan hanya angka yang dimasukkan
  const handleWhatsappChange = (e) => {
    const value = e.target.value;
    // Hanya izinkan angka
    if (/^\d*$/.test(value)) {
      setWhatsapp(value);
    }
  };

  const handleChatCS = () => {
    window.open(`https://wa.me/6288222810681`, '_blank');
  };

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
          <div>
            <input
              type="text"
              placeholder="Nomor WhatsApp (hanya angka)"
              value={whatsapp}
              onChange={handleWhatsappChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <p className="text-xs text-gray-500 mt-1">*Satu nomor WhatsApp untuk satu tim</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-semibold">Detail Turnamen:</p>
            <p className="text-gray-600">Game: {tournament === "MobileLegend" ? "Mobile Legends" : "Free Fire"}</p>
            <p className="text-gray-600">Biaya: Rp {amount.toLocaleString()}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-semibold">Butuh bantuan?</p>
            <p className="text-gray-600 mb-2">Hubungi Customer Service kami:</p>
            <button 
              onClick={handleChatCS}
              className="flex items-center text-green-600 hover:text-green-800"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5 mr-2"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              Chat via WhatsApp
            </button>
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
