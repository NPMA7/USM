const SchedulesTab = ({ matchSchedules }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Jadwal Pertandingan</h2>
      {matchSchedules.length > 0 ? (
        <div className="space-y-4">
          {matchSchedules.map((match, index) => (
            <div key={index} className="bg-white border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`p-4 ${new Date(match.match_date) < new Date() ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      new Date(match.match_date) < new Date() ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {new Date(match.match_date) < new Date() ? 'Selesai' : 'Akan Datang'}
                    </span>
                    <h3 className="text-lg font-bold mt-2">{match.tournament_name}</h3>
                    <p className="text-gray-600">{match.round_name}</p>
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
                
                <div className="mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="text-center flex-1">
                    <p className="font-bold text-lg">{match.team_name}</p>
                    <p className="text-sm text-gray-500">Tim Anda</p>
                  </div>
                  
                  <div className="mx-4">
                    <span className="text-xl font-bold text-gray-400">VS</span>
                  </div>
                  
                  <div className="text-center flex-1">
                    <p className="font-bold text-lg">{match.opponent_team}</p>
                    <p className="text-sm text-gray-500">Lawan</p>
                  </div>
                </div>
                
                {match.match_result && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                    <p className="font-medium text-center">Hasil: {match.match_result}</p>
                  </div>
                )}
                
                {match.match_link && (
                  <div className="mt-3">
                    <a 
                      href={match.match_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      {new Date(match.match_date) < new Date() ? 'Lihat Rekaman' : 'Masuk ke Room'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 ">
          <p className="text-gray-500">Belum ada jadwal pertandingan</p>
          <p className="text-sm text-gray-400 mt-2">Jadwal akan muncul setelah tim Anda terdaftar dan bracket turnamen dibuat</p>
        </div>
      )}
    </div>
  );
};

export default SchedulesTab; 