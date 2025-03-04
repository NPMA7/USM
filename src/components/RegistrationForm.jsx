import React, { useEffect, useState } from 'react';

export default function RegistrationForm({ 
  tournament, 
  tournamentName,
  amount, 
  name, 
  setName, 
  email, 
  setEmail, 
  whatsapp, 
  setWhatsapp, 
  teamName, 
  setTeamName, 
  captainNickname,
  setCaptainNickname,
  captainGameId,
  setCaptainGameId,
  handlePayment, 
  isFormValid, 
  isLoading, 
  processingPayment, 
  preparingInvoice, 
  onClose,
  whatsappError,
  setWhatsappError,
  checkWhatsappAvailability,
  emailError,
  setEmailError,
  checkEmailAvailability,
  isLoggedIn,
  userData,
  error,
  checkTeamNameAvailability,
  checkUserRegistration
}) {
  // State untuk form kedua (detail tim)
  const [currentStep, setCurrentStep] = useState(1); // 1: Form transaksi, 2: Form detail tim
  const [teamDetailsValid, setTeamDetailsValid] = useState(false);
  const [teamNameError, setTeamNameError] = useState("");

  // Gunakan useEffect untuk mengisi form dengan data pengguna dari database
  // ketika komponen dimuat
  useEffect(() => {
    if (isLoggedIn && userData) {
      // Isi form dengan data pengguna yang sudah login
      setName(userData.name || "");
      setEmail(userData.email || "");
      setWhatsapp(userData.whatsapp || "");
    }
  }, [isLoggedIn, userData, setName, setEmail, setWhatsapp]);

const handleChatCS = () => {
    const csNumber = process.env.NEXT_PUBLIC_CS_NUMBER;
    window.open(`https://wa.me/${csNumber}`, '_blank');
  };

  const handleWhatsappChange = (e) => {
    const value = e.target.value;
    // Hanya izinkan angka
    if (/^\d*$/.test(value)) {
      setWhatsapp(value);
      if (value.length >= 10) {
        checkWhatsappAvailability(value);
      } else {
        setWhatsappError("");
      }
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      checkEmailAvailability(value);
    } else {
      setEmailError("");
    }
  };

  const handleTeamNameChange = async (e) => {
    const value = e.target.value;
    setTeamName(value);

    if (value.trim() !== "") {
      const isAvailable = await checkTeamNameAvailability(value);
      if (!isAvailable) {
        setTeamNameError("Nama tim sudah terdaftar. Silakan pilih nama lain.");
      } else {
        setTeamNameError("");
      }
    } else {
      setTeamNameError("");
    }
  };

  // Fungsi untuk memeriksa apakah form valid
  const isFormReadyForSubmit = () => {
    return isFormValid() && !whatsappError && !emailError && !teamNameError;
  };

  // Fungsi untuk memeriksa apakah form detail tim valid
  const validateTeamDetails = () => {
    const isValid = captainNickname.trim() !== "" && captainGameId.trim() !== "";
    setTeamDetailsValid(isValid);
    return isValid;
  };

  // Fungsi untuk menangani perubahan pada form detail tim
  useEffect(() => {
    validateTeamDetails();
  }, [captainNickname, captainGameId]);

  // Validasi ID Game hanya angka
  const handleGameIdChange = (e) => {
    const value = e.target.value;
    // Hanya izinkan angka
    if (/^\d*$/.test(value)) {
      setCaptainGameId(value);
    }
  };

  // Fungsi untuk menangani klik tombol lanjut
  const handleNextStep = async () => {
    // Validasi nama tim sebelum melanjutkan
    const isTeamNameAvailable = await checkTeamNameAvailability(teamName);
    if (!isTeamNameAvailable) {
      setTeamNameError("Nama tim sudah terdaftar. Silakan pilih nama lain.");
      return; // Jangan lanjutkan jika nama tim sudah terdaftar
    }

    if (isFormReadyForSubmit()) {
      setCurrentStep(2);
    }
  };

  // Fungsi untuk menangani klik tombol kembali
  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  // Fungsi untuk menangani submit form
  const handleSubmitForm = async () => {
    if (teamDetailsValid) {
      // Kirim data transaksi dan detail tim
      console.log("Tournament Name for Registration:", tournamentName); // Log nama turnamen yang digunakan untuk pendaftaran
      const isRegistered = await checkUserRegistration(userData, tournamentName);
      if (isRegistered) {
        alert("Anda sudah mendaftarkan tim untuk turnamen ini. Satu pengguna hanya dapat mendaftarkan satu tim per turnamen.");
        return;
      }

      handlePayment({
        captainNickname,
        captainGameId,
        tournamentName
      });
    }
  };


  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xl  flex items-center justify-center p-4 z-50">
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
          Form Pendaftaran {tournament}
        </h3>
        
        <h3 className="text-2xl font-bold text-center mb-6">
          {tournamentName}
        </h3>

        {/* Tampilkan pesan error jika ada */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Indikator langkah */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
              1
            </div>
            <div className="w-16 h-1 bg-gray-300">
              <div className={`h-full ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-300'}`} style={{ width: currentStep === 1 ? '0%' : '100%' }}></div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
              2
            </div>
          </div>
        </div>
        
        {currentStep === 1 ? (
          // Form Langkah 1: Data Transaksi
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama lengkap"
                required
                disabled={isLoggedIn || isLoading || processingPayment || preparingInvoice}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Masukkan email"
                required
                disabled={isLoggedIn || isLoading || processingPayment || preparingInvoice}
              />
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={handleWhatsappChange}
                className={`w-full px-3 py-2 border ${whatsappError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Contoh: 08123456789"
                required
                disabled={isLoggedIn || isLoading || processingPayment || preparingInvoice}
              />
              {whatsappError && <p className="text-red-500 text-xs mt-1">{whatsappError}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Tim
              </label>
              <input
                type="text"
                value={teamName}
                onChange={handleTeamNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama tim"
                required
                disabled={isLoading || processingPayment || preparingInvoice}
              />
              {teamNameError && <p className="text-red-500 text-xs mt-1">{teamNameError}</p>}
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-800 text-sm font-medium">Biaya Pendaftaran: Rp {amount.toLocaleString()}</p>
            </div>

            <button
              onClick={handleNextStep}
              disabled={!isFormReadyForSubmit() || isLoading || processingPayment || preparingInvoice}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                isFormReadyForSubmit() && !(isLoading || processingPayment || preparingInvoice)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Lanjutkan
            </button>
          </div>
        ) : (
          // Form Langkah 2: Detail Tim
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nickname In-Game Kapten
              </label>
              <input
                type="text"
                value={captainNickname}
                onChange={(e) => setCaptainNickname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nickname in-game kapten"
                required
                disabled={isLoading || processingPayment || preparingInvoice}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                ID In-Game Kapten
              </label>
              <input
                type="text"
                value={captainGameId}
                onChange={handleGameIdChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan ID in-game kapten (hanya angka)"
                required
                disabled={isLoading || processingPayment || preparingInvoice}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-800 text-sm">
                Pastikan data yang dimasukkan sudah benar. Setelah pembayaran berhasil, Anda akan dimasukkan ke grup WhatsApp turnamen.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePrevStep}
                disabled={isLoading || processingPayment || preparingInvoice}
                className={`w-1/3 py-3 px-4 rounded-md font-medium border border-gray-300 ${
                  isLoading || processingPayment || preparingInvoice
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Kembali
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={!teamDetailsValid || isLoading || processingPayment || preparingInvoice}
                className={`w-2/3 py-3 px-4 rounded-md font-medium ${
                  !teamDetailsValid || isLoading || processingPayment || preparingInvoice
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {preparingInvoice ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyiapkan Invoice...
                  </span>
                ) : processingPayment ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses Pembayaran...
                  </span>
                ) : isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat...
                  </span>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Butuh bantuan?{" "}
            <button onClick={handleChatCS} className="text-blue-600 hover:underline">
              Hubungi CS
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
