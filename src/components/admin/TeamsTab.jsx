import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TeamsTab() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentFilter, setTournamentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*');
      if (error) throw error;
      setTournaments(data);
    } catch (error) {
      console.error('Error mengambil data turnamen:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_details')
        .select(`
          *,
          transactions (
            tournament,
            team_name,
            transaction_status,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Kelompokkan tim berdasarkan order_id
      const groupedTeams = data.reduce((acc, curr) => {
        if (!acc[curr.order_id]) {
          acc[curr.order_id] = {
            ...curr,
            members: []
          };
        }
        acc[curr.order_id].members.push(curr);
        return acc;
      }, {});

      setTeams(Object.values(groupedTeams));
    } catch (error) {
      console.error('Error mengambil data tim:', error);
      alert('Gagal mengambil data tim');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesTournament = tournamentFilter === 'all' || 
      team.transactions?.tournament === tournamentFilter;
    
    const matchesSearch = searchTerm === '' || 
      team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captain_nickname?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTournament && matchesSearch;
  });

  const viewTeamDetails = (team) => {
    setSelectedTeam(team);
    setShowDetailsModal(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Manajemen Tim</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Semua Turnamen</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.game}>
                {tournament.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari tim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-8 border rounded w-full md:w-64"
            />
            <svg
              className="w-4 h-4 absolute left-2 top-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Tim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapten
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnamen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeams.map((team) => (
                <tr key={team.order_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {team.team_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{team.captain_nickname}</div>
                    <div className="text-sm text-gray-500">{team.captain_game_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {team.transactions?.tournament}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      team.transactions?.transaction_status === 'settlement' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {team.transactions?.transaction_status === 'settlement' ? 'Terdaftar' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(team.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewTeamDetails(team)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Tim */}
      {showDetailsModal && selectedTeam && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detail Tim</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Informasi Tim</h4>
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                    <p><span className="font-medium">Nama Tim:</span> {selectedTeam.team_name}</p>
                    <p><span className="font-medium">Turnamen:</span> {selectedTeam.transactions?.tournament}</p>
                    <p><span className="font-medium">Status:</span> {selectedTeam.transactions?.transaction_status}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Kapten Tim</h4>
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                    <p><span className="font-medium">Nickname:</span> {selectedTeam.captain_nickname}</p>
                    <p><span className="font-medium">ID Game:</span> {selectedTeam.captain_game_id}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Anggota Tim</h4>
                  <div className="mt-2 space-y-2">
                    {selectedTeam.members.map((member, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p><span className="font-medium">Nama:</span> {member.player_name}</p>
                        <p><span className="font-medium">ID Game:</span> {member.player_id}</p>
                        <p><span className="font-medium">Role:</span> {member.player_role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 