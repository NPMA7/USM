const TeamDetailsModal = ({ teamDetails, setShowTeamDetailsModal }) => {
  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detail Tim</h2>
            <button 
              onClick={() => setShowTeamDetailsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Informasi Tim</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nama Tim</p>
                    <p className="font-medium">{teamDetails[0]?.team_name || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nickname Kapten</p>
                    <p className="font-medium">{teamDetails[0]?.captain_nickname || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Game Kapten</p>
                    <p className="font-medium">{teamDetails[0]?.captain_game_id || 'Tidak tersedia'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Anggota Tim</h3>
              <div className="space-y-4">
                {teamDetails.map((member, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nama Pemain</p>
                        <p className="font-medium">{member.player_name || 'Tidak tersedia'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ID Game</p>
                        <p className="font-medium">{member.player_id || 'Tidak tersedia'}</p>
                      </div>
                      {member.player_role && (
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="font-medium">{member.player_role}</p>
                        </div>
                      )}
                      {member.player_phone && (
                        <div>
                          <p className="text-sm text-gray-500">Nomor HP</p>
                          <p className="font-medium">{member.player_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTeamDetailsModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsModal; 