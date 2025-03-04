export default function InfoSection() {
  return (
    <div id="info" className="py-16 bg-white">
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Informasi Turnamen</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">Jadwal</h3>
          <p className="text-gray-600 text-center">
            Turnamen akan dilaksanakan pada bulan ini. Pendaftaran akan ditutup 3 hari sebelum hari pelaksanaan turnamen.
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">Hadiah</h3>
          <p className="text-gray-600 text-center">
            Total hadiah mencapai ratusan ribu rupiah dengan sertifikat untuk para pemenang di setiap kategori.
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">Peserta</h3>
          <p className="text-gray-600 text-center">
            Terbuka untuk semua penggemar game dengan maksimal 128 tim untuk setiap kategori turnamen.
          </p>
        </div>
      </div>
    </div>
  </div>
  );
} 