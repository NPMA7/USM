import Link from 'next/link';

const TournamentsTab = ({ tournaments, transactions, fetchTeamDetails }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Turnamen yang Diikuti</h2>
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((tournament, index) => {
            // Ambil transaksi terbaru untuk turnamen ini
            const latestTransaction = transactions
              .filter(t => t.tournament === tournament)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            
            return (
              <div key={index} className="bg-white border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-24 ${tournament === 'MobileLegend' ? 'bg-blue-600' : 'bg-red-600'} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-white">
                      {tournament === 'MobileLegend' ? 'Mobile Legends' : 'Free Fire'}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm">Nama Tim</p>
                    <p className="font-medium text-lg">{latestTransaction.team_name}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm">Status Pendaftaran</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        latestTransaction.transaction_status === 'settlement'
                          ? 'bg-green-100 text-green-800'
                          : latestTransaction.transaction_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {latestTransaction.transaction_status === 'settlement' ? 'Terdaftar' : 
                       latestTransaction.transaction_status === 'pending' ? 'Menunggu Pembayaran' : 'Gagal'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm">Tanggal Pendaftaran</p>
                    <p className="text-gray-700">
                      {new Date(latestTransaction.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => fetchTeamDetails(latestTransaction.order_id)}
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Lihat Detail Tim
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8  rounded-lg">
          <p className="text-gray-500">Anda belum mengikuti turnamen apapun</p>
          <Link
            href="/#tournaments"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Lihat Turnamen
          </Link>
        </div>
      )}
    </div>
  );
};

export default TournamentsTab; 