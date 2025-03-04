'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TournamentsTab = ({ tournaments, transactions }) => {
  const [teamDetails, setTeamDetails] = useState([]);
  const [selectedTeamDetails, setSelectedTeamDetails] = useState(null);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);

  const handleViewTeamDetails = (teamDetail) => {
    setSelectedTeamDetails(teamDetail);
    setShowTeamDetailsModal(true);
  };

  const fetchTeamDetails = async () => {
    const { data, error } = await supabase
      .from('team_details')
      .select('*'); // Ambil semua kolom dari tabel team_details

    if (error) {
      console.error('Error fetching team details:', error);
    } else {
      setTeamDetails(data);
    }
  };

  useEffect(() => {
    // Ambil data awal
    fetchTeamDetails();

    // Set interval untuk memeriksa status setiap 5 detik
    const intervalId = setInterval(() => {
      fetchTeamDetails();
    }, 5000); // 5000 ms = 5 detik

    // Bersihkan interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className=''>
      <h2 className="text-xl font-semibold mb-4">Turnamen yang Diikuti</h2>
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((tournament, index) => {
            const latestTransaction = transactions
              .filter(t => t.tournament === tournament)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            const teamDetail = teamDetails.find(team => team.order_id === latestTransaction.order_id);
            
            return (
              <div key={index} className="bg-white border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-24 bg-blue-600 relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-white">
                      {tournament}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm">Nama Tim</p>
                    <p className="font-medium text-lg">{teamDetail?.team_name || 'Tidak tersedia'}</p>
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
                  <div className="mb-3">
                    <p className="text-gray-500 text-sm">Status Grup WhatsApp</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      teamDetail?.is_in_whatsapp_group ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {teamDetail?.is_in_whatsapp_group ? 'Sudah Bergabung' : 'Belum Bergabung'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewTeamDetails(teamDetail)}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Lihat Detail Tim
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Anda belum mengikuti turnamen apapun</p>
          <Link
            href="/#tournaments"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Lihat Turnamen
          </Link>
        </div>
      )}
      
      {showTeamDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold">Detail Tim</h3>
            <p><strong>Nama Tim:</strong> {selectedTeamDetails?.team_name}</p>
            <p><strong>Nickname Kapten:</strong> {selectedTeamDetails?.captain_nickname || 'Tidak tersedia'}</p>
            <p><strong>ID Game Kapten:</strong> {selectedTeamDetails?.captain_game_id || 'Tidak tersedia'}</p>
            <p><strong>Status Grup WhatsApp:</strong> {selectedTeamDetails?.is_in_whatsapp_group ? 'Sudah Bergabung' : 'Belum Bergabung'}</p>
            <button
              onClick={() => setShowTeamDetailsModal(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsTab; 