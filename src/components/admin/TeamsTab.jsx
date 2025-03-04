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
  const [teamCount, setTeamCount] = useState(0);
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchTournaments();
    checkTeamCount();
    const intervalId = setInterval(() => {
      checkTeamCount();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (tournamentFilter === 'all') {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team => {
        return team.transactions?.tournament_name === tournamentFilter;
      });
      setFilteredTeams(filtered);
    }
  }, [tournamentFilter, teams]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*');
      if (error) throw error;
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
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
            created_at,
            tournament_name
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
      console.error('Error fetching teams:', error);
      alert('Gagal mengambil data tim');
    } finally {
      setLoading(false);
    }
  };

  const checkTeamCount = async () => {
    try {
      const { count, error } = await supabase
        .from('team_details')
        .select('*', { count: 'exact' });

      if (error) throw error;

      setTeamCount(prevCount => {
        if (count !== prevCount) {
          fetchTeams();
          return count;
        }
        return prevCount;
      });
    } catch (error) {
      console.error('Error checking team count:', error);
    }
  };

  const viewTeamDetails = (team) => {
    setSelectedTeam(team);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedTeam(null);
  };

  const toggleWhatsAppGroupStatus = async (team) => {
    try {
      const newStatus = !team.is_in_whatsapp_group; // Toggle status
      const { error } = await supabase
        .from('team_details')
        .update({ is_in_whatsapp_group: newStatus })
        .eq('id', team.id); // Pastikan untuk menggunakan ID yang benar

      if (error) throw error;

      // Update local state if necessary
      setTeams(prevTeams => 
        prevTeams.map(t => t.id === team.id ? { ...t, is_in_whatsapp_group: newStatus } : t)
      );
    } catch (error) {
      console.error('Error updating WhatsApp group status:', error);
      alert('Gagal memperbarui status grup WhatsApp');
    }
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
            {[...new Set(teams.map(team => team.transactions?.tournament_name))].map((tournamentName) => (
              <option key={tournamentName} value={tournamentName}>
                {tournamentName}
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
                  Status Grup WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeams.filter(team => 
                team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((team) => (
                <tr key={team.order_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {team.team_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Nickname: {team.captain_nickname}</div>
                    <div className="text-sm text-gray-500">ID Game: {team.captain_game_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{team.transactions?.tournament}</div>
                    <div className="text-sm text-gray-500">{team.transactions?.tournament_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      team.transactions?.transaction_status === 'settlement' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {team.transactions?.transaction_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(team.created_at).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    
                    <label className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={team.is_in_whatsapp_group}
                        onChange={() => toggleWhatsAppGroupStatus(team)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                     
                    </label>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      team.is_in_whatsapp_group ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {team.is_in_whatsapp_group ? 'Sudah Bergabung' : 'Belum Bergabung'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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

      {showDetailsModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-xl flex items-center justify-center">
          <div className="bg-gray-200 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Informasi Tim</h3>
            <div className="mb-4">
              <p className="font-medium">Nama Tim: {selectedTeam?.team_name}</p>
              <p className="font-medium">Turnamen: {selectedTeam?.transactions?.tournament_name}</p>
              <p className="font-medium">Status: {selectedTeam?.transactions?.transaction_status}</p>
            </div>
            <h4 className="text-md font-semibold mb-2">Kapten Tim</h4>
            <p>Nickname: {selectedTeam?.captain_nickname}</p>
            <p>ID Game: {selectedTeam?.captain_game_id}</p>
            <button onClick={closeModal} className="mt-4 bg-blue-500 text-white rounded px-4 py-2">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}