'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoadingState from '@/components/payment/LoadingState'; // Import komponen LoadingState

// Inisialisasi Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SchedulesTab = ({ transactions  }) => {
  const [teamDetails, setTeamDetails] = useState([]);
  const [matchSchedulesData, setMatchSchedulesData] = useState([]);
  const [loading, setLoading] = useState(true); // State untuk loading
  const tournaments = [...new Set(transactions.map(t => t.tournament))];

  const getTeamName = (latestTransaction) => {
    const teamDetail = teamDetails.find(team => team.order_id === latestTransaction.order_id);
    return teamDetail?.team_name || 'Tidak tersedia';
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

  const fetchMatchSchedules = async () => {
    const { data, error } = await supabase
      .from('match_schedules')
      .select(`
        *,
        tournaments (name, game),
        team1:team1_id (team_name),
        team2:team2_id (team_name)
      `);

    if (error) {
      console.error('Error fetching match schedules:', error);
    } else {
      setMatchSchedulesData(data);
    }
  };

  useEffect(() => {
    // Ambil data awal
    const fetchData = async () => {
      setLoading(true); // Set loading menjadi true saat memulai fetch
      await fetchTeamDetails();
      await fetchMatchSchedules();
      setLoading(false); // Set loading menjadi false setelah fetch selesai
    };

    fetchData();

    // Set interval untuk memeriksa status setiap 5 detik
    const intervalId = setInterval(() => {
      fetchMatchSchedules(); // Hanya memanggil fetchMatchSchedules untuk memperbarui data
    }, 5000); // 5000 ms = 5 detik

    // Bersihkan interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Akan Datang';
      case 'ongoing':
        return 'Sedang Berlangsung';
      case 'completed':
        return 'Selesai';
      default:
        return 'Unknown';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-300 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-500 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Jadwal Pertandingan</h2>
      {loading ? ( // Tampilkan loading state
        <LoadingState />
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((tournament) => {
            const latestTransaction = transactions
              .filter(t => t.tournament === tournament)
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            const teamName = getTeamName(latestTransaction);

            const getMatchClass = (match) => {
              return match.winning_team_name === teamName ? 'bg-green-100 text-green-800' : (match.winning_team_name ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800');
            };
            return matchSchedulesData
              .filter(match => match.team1?.team_name === teamName || match.team2?.team_name === teamName)
              .map((match) => (
                <div key={match.id}>
                <div className={`bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${getMatchClass(match)}`}>
                 <div className="relative">
                  {match.winning_team_name === teamName ? (
                    <div className="absolute top-10 -left-14 w-full text-center transform translate-x-1/2 rotate-45 bg-green-500 text-white px-2 py-1 text-4xl font-bold">
                      Menang
                    </div>
                  ) : match.losing_team_name === teamName ? (
                    <div className="absolute top-10 -left-14 w-full text-center transform translate-x-1/2 rotate-45 bg-red-500 text-white px-2 py-1 text-4xl font-bold">
                      Kalah
                    </div>
                  ) : null}
                </div>
                <div className={`p-4 ${getMatchClass(match)}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-3 md:mb-0">
                      <span className={`px-4 py-2 text-xs font-semibold rounded-full ${getStatusClass(match.status)}`}>
                        {getStatusLabel(match.status)}
                      </span>
                      <h3 className="text-lg font-bold mt-2">Turnamen: {match.tournaments?.name}</h3>
                      <p className="text-gray-600">Game: {match.tournaments?.game}</p>
                      <p className="text-gray-600">{match.round || 'Round Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(match.match_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(match.match_date).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} WIB
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                    {match.team1?.team_name  === teamName ? (
                      <>
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team1?.team_name || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Tim Anda</p>
                          {match.status === 'completed' ? (
                            <p className="text-2xl font-bold mt-2">{match.team1_score || '0'} </p>
                          ) : (
                            <p className="text-2xl mt-2 text-gray-500">0</p>
                          )}
                        </div>
                        
                        <div className="mx-4">
                          <span className="text-xl font-bold text-gray-400">VS</span>
                        </div>
                        
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team2?.team_name || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Lawan</p>
                          {match.status === 'completed' ? (
                            <p className="text-2xl font-bold mt-2">{match.team2_score || '0'}</p>
                          ) : (
                            <p className="text-2xl mt-2 text-gray-500">0</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team2?.team_name  || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Tim Anda</p>
                          {match.status === 'completed' ? (
                            <p className="text-2xl font-bold mt-2">{match.team2_score || '0'} </p>
                          ) : (
                            <p className="text-2xl mt-2 text-gray-500">0</p>
                          )}
                        </div>
                        
                        <div className="mx-4">
                          <span className="text-xl font-bold text-gray-400">VS</span>
                        </div>
                        
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team1?.team_name  || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Lawan</p>
                          {match.status === 'completed' ? (
                            <p className="text-2xl font-bold mt-2">{match.team1_score || '0'}</p>
                          ) : (
                            <p className="text-2xl mt-2 text-gray-500">0</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Hasil: {match.winning_team_name ? (match.winning_team_name === teamName ? `Tim Anda menang` : `Tim Anda kalah`) : 'Belum ada hasil'}
                  </p>

                </div>
                </div>
                </div>
              ));
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Tidak ada jadwal pertandingan yang tersedia.</p>
        </div>
      )}

    </div>
  );
};

export default SchedulesTab; 