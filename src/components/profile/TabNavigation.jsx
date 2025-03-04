const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b overflow-x-auto">
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer ${
          activeTab === 'profile'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Profil Saya
      </button>
      <button
        onClick={() => setActiveTab('tournaments')}
        className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer ${
          activeTab === 'tournaments'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Turnamen Saya
      </button>
      <button
        onClick={() => setActiveTab('schedules')}
        className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer ${
          activeTab === 'schedules'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Jadwal Tanding
      </button>
      <button
        onClick={() => setActiveTab('transactions')}
        className={`flex-1 py-4 px-6 text-center font-medium cursor-pointer ${
          activeTab === 'transactions'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Riwayat Transaksi
      </button>
    </div>
  );
};

export default TabNavigation; 