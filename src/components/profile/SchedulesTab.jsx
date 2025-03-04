const SchedulesTab = ({ matchSchedules, userTeamId, userTeamName, refreshSchedules }) => {
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
        return 'bg-blue-200 text-blue-900 font-bold';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-500 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchClass = (match) => {
    if (match.team1_score == null || match.team2_score == null) {
      return 'bg-blue-100 text-blue-800';
    } else if (match.winning_team_name === userTeamName) {
      return 'bg-green-100 text-green-800';
    } else if (match.winning_team_name !== null) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Jadwal Pertandingan</h2>
      <button 
        onClick={refreshSchedules} 
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
      >
        <svg className="h-5 w-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
          <path className="opacity-75" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v8l4 4M4 12a8 8 0 018-8m0 16a8 8 0 01-8-8" />
        </svg>
        Refresh Jadwal
      </button>
      {matchSchedules.length > 0 ? (
        <div className="space-y-4">
          {matchSchedules.map((match, index) => {
            const isUserTeam1 = match.team1_id === userTeamId;
            return (
              
              <div key={index} className={`bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${getMatchClass(match)}`}>
                 <div className="relative">
                  {match.winning_team_name === userTeamName && (
                    <div className="absolute top-10 -left-14 w-full text-center transform translate-x-1/2 rotate-45 bg-green-500 text-white px-2 py-1 text-4xl font-bold">
                      Menang
                    </div>
                    
                  )}
                  {match.winning_team_name !== userTeamName && (
                    <div className="absolute top-10 -left-14 w-full text-center transform translate-x-1/2 rotate-45 bg-red-500 text-white px-2 py-1 text-4xl font-bold">
                      Kalah
                    </div>
                  )}
                </div>
                <div className={`p-4 ${getMatchClass(match)}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-3 md:mb-0">
                      <span className={`px-4 py-2 text-xs font-semibold rounded-full ${getStatusClass(match.status)}`}>
                        {getStatusLabel(match.status)}
                      </span>
                      <h3 className="text-lg font-bold mt-2">{match.tournament_name}</h3>
                      <p className="text-gray-600">Game: {match.game_type}</p>
                      <p className="text-gray-600">{match.round_name || 'Round Unknown'}</p>
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
                    {isUserTeam1 ? (
                      <>
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team1_name || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Tim Anda</p>
                          {match.status === 'completed' && (
                            <p className="text-2xl font-bold mt-2">{match.team1_score || '0'}</p>
                          )}
                        </div>
                        
                        <div className="mx-4">
                          <span className="text-xl font-bold text-gray-400">VS</span>
                        </div>
                        
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team2_name || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Lawan</p>
                          {match.status === 'completed' && (
                            <p className="text-2xl font-bold mt-2">{match.team2_score || '0'}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team2_name || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Tim Anda</p>
                          {match.status === 'completed' && (
                            <p className="text-2xl font-bold mt-2">{match.team2_score || '0'}</p>
                          )}
                        </div>
                        
                        <div className="mx-4">
                          <span className="text-xl font-bold text-gray-400">VS</span>
                        </div>
                        
                        <div className="text-center flex-1">
                          <p className="font-bold text-lg">{match.team1_name || 'TBD'}</p>
                          <p className="text-sm text-gray-500">Lawan</p>
                          {match.status === 'completed' && (
                            <p className="text-2xl font-bold mt-2">{match.team1_score || '0'}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${getMatchClass(match)}`}>
                    {match.team1_score == null || match.team2_score == null ? (
                      'Hasil: Sedang dihitung'
                    ) : (
                      `Hasil: ${match.winning_team_name === userTeamName ? `Tim Anda menang` : `Tim Anda kalah`}`
                    )}
                  </p>

                </div>
               
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Belum ada jadwal pertandingan</p>
          <p className="text-sm text-gray-400 mt-2">
            Jadwal akan muncul setelah tim Anda terdaftar dan bracket turnamen dibuat
          </p>
        </div>
      )}
    </div>
  );
};

export default SchedulesTab; 