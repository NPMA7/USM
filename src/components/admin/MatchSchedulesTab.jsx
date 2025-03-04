import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import InfoPopup from '@/components/InfoPopup';
import AdminConfirmationModal from '@/components/admin/AdminConfirmationModal';

const roundNames = [
  'Grup Stage',
  'Quarter Finals',
  'Semi Finals',
  'Finals',
  'Playoffs'
];

export default function MatchSchedulesTab({ tournamentName }) {
  const [tournaments, setTournaments] = useState([]);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [tournamentId, setTournamentId] = useState('');
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [matchLink, setMatchLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [showEditScoreModal, setShowEditScoreModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editScore1, setEditScore1] = useState('');
  const [editScore2, setEditScore2] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLink, setEditLink] = useState('');
  const [roundName, setRoundName] = useState(roundNames[0]);
  const [editRoundName, setEditRoundName] = useState(roundNames[0]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editResult, setEditResult] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [teams, setTeams] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');

  useEffect(() => {
    fetchTournaments();
    fetchMatches();
    checkScheduleCount();
    const intervalId = setInterval(() => {
      checkScheduleCount();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (tournamentId) {
      fetchRegisteredTeams(tournamentId);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTeams(tournamentName);
  }, [tournamentName]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*');
      if (error) throw error;
      
      setTournaments(data);
      
      if (data.length > 0) {
        setTournamentId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error.message);
    }
  };

  const fetchRegisteredTeams = async (tournamentId) => {
    try {
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (tournamentError) throw tournamentError;

      const { data, error } = await supabase
        .from('team_details')
        .select(`
          id,
          team_name,
          tournament_name
        `)
        .eq('tournament_name', tournamentData.name);

      if (error) throw error;

      setRegisteredTeams(data || []);
    } catch (error) {
      console.error('Error mengambil data tim:', error.message);
      setInfoMessage('Gagal mengambil data tim: ' + error.message);
      setShowInfoPopup(true);
    }
  };

  const fetchTeams = async (tournamentName) => {
    try {
      const { data, error } = await supabase
        .from('team_details')
        .select('*')
        .eq('tournament_name', tournamentName);
      if (error) throw error;
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error.message);
    }
  };

  const fetchMatches = async () => {
    try {
        const { data, error } = await supabase
            .from('match_schedules')
            .select(`
                *,
                tournaments (name, game), 
                team1:team1_id (team_name),
                team2:team2_id (team_name) 
            `)
            .order('match_date', { ascending: true });

        if (error) throw error;

        // Mengupdate matches dengan nama turnamen, jenis game, dan nama tim
        const updatedMatches = data.map(match => ({
            ...match,
            tournament_name: match.tournaments?.name || 'Turnamen tidak tersedia',
            game_type: match.tournaments?.game || 'Jenis game tidak tersedia',
            team1_name: match.team1?.team_name || 'Tim 1 tidak tersedia', // Mengambil nama tim 1
            team2_name: match.team2?.team_name || 'Tim 2 tidak tersedia'  // Mengambil nama tim 2
        }));

        setMatches(updatedMatches);
    } catch (error) {
        console.error('Error fetching matches:', error.message);
    }
  };

  const checkScheduleCount = async () => {
    try {
      const { count, error } = await supabase
        .from('match_schedules')
        .select('*', { count: 'exact' });

      if (error) throw error;

      setScheduleCount(prevCount => {
        if (count !== prevCount) {
          fetchMatches();
          return count;
        }
        return prevCount;
      });
    } catch (error) {
      console.error('Error checking schedule count:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const combinedDateTime = `${matchDate}T${matchTime}:00`;
  
        
        const { data, error } = await supabase
            .from('match_schedules')
            .insert([
                {
                    tournament_id: tournamentId,
                    team1_id: team1Id,
                    team2_id: team2Id,
                    match_date: combinedDateTime,
                    match_link: matchLink || "-",
                    status: 'upcoming',
                    round: roundName,
                    team1_score: null,
                    team2_score: null
                }
            ]);

        if (error) throw error;

        setInfoMessage('Jadwal pertandingan berhasil ditambahkan!');
        setShowInfoPopup(true);
        fetchMatches();
        
        // Reset form fields
        setTeam1Id('');
        setTeam2Id('');
        setMatchDate('');
        setMatchTime('');
        setMatchLink('');
        setRoundName(roundNames[0]);
        setShowAddModal(false);
        
    } catch (error) {
        console.error('Error menambahkan jadwal:', error.message);
        setInfoMessage('Gagal menambahkan jadwal pertandingan: ' + error.message);
        setShowInfoPopup(true);
    }
  };

  const deleteMatch = (matchId) => {
    setMatchToDelete(matchId);
    setShowConfirmationModal(true);
  };

  const confirmDeleteMatch = async () => {
    try {
      const { error } = await supabase
        .from('match_schedules')
        .delete()
        .eq('id', matchToDelete);

      if (error) throw error;

      setInfoMessage('Jadwal berhasil dihapus!');
      setShowInfoPopup(true);
      fetchMatches();
    } catch (error) {
      console.error('Error menghapus jadwal:', error);
      setInfoMessage('Gagal menghapus jadwal');
      setShowInfoPopup(true);
    } finally {
      setShowConfirmationModal(false);
      setMatchToDelete(null);
    }
  };

  const updateMatchStatus = async (matchId) => {
    try {
      const { data: currentMatch, error: fetchError } = await supabase
        .from('match_schedules')
        .select('status, team1_score, team2_score')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      let nextStatus;
      let updateData = {};
      
      switch (currentMatch.status) {
        case 'upcoming':
          nextStatus = 'ongoing';
          updateData = {
            status: nextStatus,
            match_date: new Date().toISOString()
          };
          break;
        case 'ongoing':
          nextStatus = 'completed';
          updateData = { status: nextStatus };
          break;
        case 'completed':
          nextStatus = 'upcoming';
          updateData = {
            status: nextStatus,
            team1_score: null,
            team2_score: null,
            winning_team_name: null,
            losing_team_name: null
          };
          break;
        default:
          nextStatus = 'upcoming';
          updateData = { status: nextStatus };
      }

      const { error: updateError } = await supabase
        .from('match_schedules')
        .update(updateData)
        .eq('id', matchId);

      if (updateError) throw updateError;

      fetchMatches();
      setInfoMessage(`Status pertandingan berhasil diubah menjadi ${getStatusLabel(nextStatus)}`);
      setShowInfoPopup(true);

    } catch (error) {
      console.error('Error mengupdate status pertandingan:', error.message);
      setInfoMessage('Gagal mengupdate status pertandingan: ' + error.message);
      setShowInfoPopup(true);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Akan Datang';
      case 'ongoing':
        return 'Berlangsung';
      case 'completed':
        return 'Selesai';
      default:
        return status;
    }
  };

  const openEditScheduleModal = (match) => {
    setEditingMatch(match);
    const matchDate = new Date(match.match_date);
    setEditDate(matchDate.toISOString().split('T')[0]);
    setEditTime(matchDate.toTimeString().slice(0, 5));
    setEditLink(match.match_link || '');
    setShowEditScheduleModal(true);
    setEditRoundName(match.round || roundNames[0]);
  };

  const openEditScoreModal = (match) => {
    setEditingMatch(match);
    setEditScore1(match.team1_score || '');
    setEditScore2(match.team2_score || '');
    setEditResult(match.result || '');
    setShowEditScoreModal(true);
  };

  const handleEditScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const combinedDateTime = `${editDate}T${editTime}:00`;
      
      const { error } = await supabase
        .from('match_schedules')
        .update({
          match_date: combinedDateTime,
          match_link: editLink || "-",
          round: editRoundName
        })
        .eq('id', editingMatch.id);

      if (error) throw error;

      setInfoMessage('Jadwal pertandingan berhasil diperbarui!');
      setShowInfoPopup(true);
      fetchMatches();
      setShowEditScheduleModal(false);
      
    } catch (error) {
      console.error('Error mengupdate jadwal:', error.message);
      setInfoMessage('Gagal mengupdate jadwal pertandingan: ' + error.message);
      setShowInfoPopup(true);
    }
  };

  const handleEditScore = async (e, matchId) => {
    e.preventDefault();

    const team1Score = parseInt(editScore1);
    const team2Score = parseInt(editScore2);
    const winningTeamName = team1Score > team2Score ? editingMatch.team1_name : editingMatch.team2_name;
    const losingTeamName = team1Score < team2Score ? editingMatch.team1_name : editingMatch.team2_name;

    try {
        const { error } = await supabase
            .from('match_schedules')
            .update({
                team1_score: team1Score,
                team2_score: team2Score,
                winning_team_name: winningTeamName,
                losing_team_name: losingTeamName
            })
            .eq('id', matchId);

        if (error) throw error;

        setInfoMessage('Skor dan hasil berhasil diperbarui!');
        setShowInfoPopup(true);
        fetchMatches();
        setShowEditScoreModal(false);
    } catch (error) {
        console.error('Error updating score and result:', error);
        setInfoMessage('Gagal memperbarui skor dan hasil: ' + (error.message || 'Terjadi kesalahan jaringan. Silakan coba lagi.'));
        setShowInfoPopup(true);
    }
  };

  const openEditModal = (match) => {
    setSelectedMatch(match);
    setEditRoundName(match.round || roundNames[0]);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('match_schedules')
        .update({
          round: editRoundName
        })
        .eq('id', selectedMatch.id);

      if (error) throw error;

      setInfoMessage('Jadwal pertandingan berhasil diperbarui!');
      setShowInfoPopup(true);
      fetchMatches();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error mengedit jadwal:', error.message);
      setInfoMessage('Gagal mengedit jadwal pertandingan: ' + error.message);
      setShowInfoPopup(true);
    }
  };

  const handleTournamentChange = (e) => {
    const tournamentName = e.target.value;
    setSelectedTournament(tournamentName);
    fetchTeams(tournamentName);
  };

  // Filter tim untuk tim 2
  const availableTeamsForTeam2 = teams.filter(team => team.id !== team1Id);

  return (
    <div>
      {showInfoPopup && (
        <InfoPopup 
          message={infoMessage} 
          onClose={() => setShowInfoPopup(false)} 
          isSuccess={infoMessage.includes('berhasil')} 
        />
      )}

      {showConfirmationModal && (
        <AdminConfirmationModal 
          message="Apakah Anda yakin ingin menghapus jadwal ini?"
          onConfirm={async () => {
            setLoading(true);
            await confirmDeleteMatch();
            setLoading(false);
          }}
          onCancel={() => setShowConfirmationModal(false)}
          isLoading={loading}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manajemen Jadwal Pertandingan</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tambah Jadwal
        </button>
      </div>

      {/* Modal Tambah Jadwal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tambah Jadwal Baru</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turnamen
                    </label>
                    <select
                      value={selectedTournament}
                      onChange={handleTournamentChange}
                      required
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Pilih Turnamen</option>
                      {tournaments.map((tournament) => (
                        <option key={tournament.id} value={tournament.name}>
                          {tournament.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tim 1
                    </label>
                    <select
                      value={team1Id}
                      onChange={(e) => setTeam1Id(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Pilih Tim 1</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.team_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tim 2
                    </label>
                    <select
                      value={team2Id}
                      onChange={(e) => setTeam2Id(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Pilih Tim 2</option>
                      {availableTeamsForTeam2.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.team_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Pertandingan
                    </label>
                    <input
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Pertandingan
                    </label>
                    <input
                      type="time"
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Ronde
                    </label>
                    <select
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {roundNames.map((round, index) => (
                        <option key={index} value={round}>
                          {round}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link Room/Streaming (Opsional)
                    </label>
                    <input
                      type="text"
                      value={matchLink}
                      onChange={(e) => setMatchLink(e.target.value)}
                      placeholder="Link room game atau streaming..."
                      className="w-full p-2 border rounded"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Masukkan link room game untuk pemain atau link streaming untuk penonton (bisa diisi nanti)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Jadwal */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Jadwal Pertandingan</h3>
                <button onClick={() => setShowEditScheduleModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditScheduleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Pertandingan
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Pertandingan
                    </label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link Room/Streaming (Opsional)
                    </label>
                    <input
                      type="text"
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      placeholder="Link room game atau streaming..."
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Ronde
                    </label>
                    <select
                      value={editRoundName}
                      onChange={(e) => setEditRoundName(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {roundNames.map((round, index) => (
                        <option key={index} value={round}>
                          {round}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditScheduleModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Skor */}
      {showEditScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Update Skor Pertandingan</h3>
                <button onClick={() => setShowEditScoreModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => handleEditScore(e, editingMatch.id)}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingMatch?.team1_name}
                    </label>
                    <input
                      type="number"
                      value={editScore1}
                      onChange={(e) => setEditScore1(e.target.value)}
                      placeholder="Skor Tim 1"
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingMatch?.team2_name}
                    </label>
                    <input
                      type="number"
                      value={editScore2}
                      onChange={(e) => setEditScore2(e.target.value)}
                      placeholder="Skor Tim 2"
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hasil (Pilih Tim yang Menang):
                  </label>
                  <select
                    value={editResult}
                    onChange={(e) => setEditResult(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="" disabled>Pilih tim yang menang</option>
                    <option value={editingMatch?.team1_name}>{editingMatch?.team1_name}</option>
                    <option value={editingMatch?.team2_name}>{editingMatch?.team2_name}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditScoreModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Update Skor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Jadwal */}
      <div className="bg-white  rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-medium p-6 bg-gray-50 border-b">
          Daftar Jadwal Pertandingan
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnamen
                </th>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ronde
                </th>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tim
                </th>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skor
                </th>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tim Pemenang
                </th>
                <th className="px-6 py-3 text-center border border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {matches.map((match) => (
                <tr key={match.id}>
                  <td className="px-6 py-4 whitespace-nowrap border border-gray-200 text-center">
                    <div className="text-sm font-medium text-gray-900">{match.tournament_name ? match.tournament_name : 'Turnamen tidak tersedia'}</div>
                    <div className="text-sm text-gray-500">{match.game_type ? match.game_type : 'Jenis game tidak tersedia'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border border-gray-200 text-center">
                    {match.round || 'Grup Stage'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-gray-900">
                      {match.team1_name} <span className="font-bold text-red-500 text-lg mx-4">VS</span> {match.team2_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border border-gray-200 text-center">
                    {new Date(match.match_date).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border border-gray-200 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                      match.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {getStatusLabel(match.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border border-gray-200 text-center">
                    {match.status === 'completed' ? 
                      `${match.team1_score || 0} - ${match.team2_score || 0}` : 
                      '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border border-gray-200 text-center">
                    {match.winning_team_name ? 
                        `${match.winning_team_name}` : 
                        'Belum ada hasil'}
                  </td>
                    <td className="px-6 py-8 whitespace-nowrap border border-gray-200 flex justify-center items-center gap-x-4">
                    {match.status === 'upcoming' && (
                      <button
                        onClick={() => openEditScheduleModal(match)}
                        className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
                      >
                        Edit Details
                      </button>
                    )}
                    
                    {match.status === 'completed' && (
                      <button
                        onClick={(e) => openEditScoreModal(match)}
                        className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
                      >
                        Edit Skor
                      </button>
                    )}
                    
                    <button
                      onClick={() => updateMatchStatus(match.id)}
                      className={`border px-3 py-1 rounded ${
                        match.status === 'upcoming' ? 'border-green-600 text-green-600 hover:bg-green-50' :
                        match.status === 'ongoing' ? 'border-green-600 text-green-600 hover:bg-green-50' :
                        'border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {match.status === 'upcoming' ? 'Mulai' :
                       match.status === 'ongoing' ? 'Selesai' :
                       'Reset Status'}
                    </button>
                    
                    <button
                      onClick={() => deleteMatch(match.id)}
                      className="border border-red-600 text-red-600 hover:bg-red-50 px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Jadwal Pertandingan</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Ronde
                    </label>
                    <select
                      value={editRoundName}
                      onChange={(e) => setEditRoundName(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {roundNames.map((round, index) => (
                        <option key={index} value={round}>
                          {round}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 