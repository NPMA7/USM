export default function AdminNavigation({ activeTab, setActiveTab, user }) {
  // Tab yang tersedia untuk semua admin dan owner
  const commonTabs = [
    { id: 'tournaments', label: 'Turnamen' },
    { id: 'transactions', label: 'Transaksi' },
    { id: 'teams', label: 'Tim' },
    { id: 'schedules', label: 'Jadwal Pertandingan' },
  ];
  
  // Tab khusus untuk owner dan admin
  const adminOwnerTabs = [
    { id: 'users', label: 'Pengguna' },
    ...commonTabs
  ];
  
  // Pilih tab yang sesuai berdasarkan role
  const tabs = user?.role === 'owner' || user?.role === 'admin' ? adminOwnerTabs : commonTabs;

  return (
    <div className="bg-gray-100 border-b">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm focus:outline-none whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 