'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TabNavigation from '@/components/profile/TabNavigation';
import ProfileTab from '@/components/profile/ProfileTab';
import TournamentsTab from '@/components/profile/TournamentsTab';
import SchedulesTab from '@/components/profile/SchedulesTab';
import TransactionsTab from '@/components/profile/TransactionsTab';
import TeamDetailsModal from '@/components/profile/TeamDetailsModal';
import SessionExpiredModal from '@/components/SessionExpiredModal';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [teamDetails, setTeamDetails] = useState(null);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [matchSchedules, setMatchSchedules] = useState([]);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const router = useRouter();
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Cek apakah pengguna sudah login
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');
      
      if (!userData) {
        router.push('/auth/login');
        return;
      }
      
      // Cek waktu login
      if (loginTime) {
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000; // 1 jam dalam milidetik
        
        if (currentTime - parseInt(loginTime) > oneHour) {
          // Logout otomatis jika sudah lebih dari 1 jam
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
          setShowSessionExpiredModal(true);
          return;
        }
      }
      
      setUser(JSON.parse(userData));
      setLoading(false);
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    // Ambil data transaksi pengguna jika user sudah terload
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [user]);

  useEffect(() => {
    // Ambil data jadwal pertandingan jika user sudah terload
    const fetchMatchSchedules = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('match_schedules')
          .select('*')
          .eq('email', user.email)
          .order('match_date', { ascending: true });

        if (error) throw error;
        setMatchSchedules(data || []);
      } catch (error) {
        console.error('Error fetching match schedules:', error);
      }
    };

    fetchMatchSchedules();
  }, [user]);

  const fetchTeamDetails = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('team_details')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTeamDetails(data);
        setShowTeamDetailsModal(true);
      } else {
        alert('Detail tim tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      alert('Gagal mengambil detail tim');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    router.push('/');
  };

  const refreshUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  // Tambahkan handler untuk menutup modal
  const handleCloseSessionModal = () => {
    setShowSessionExpiredModal(false);
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mendapatkan turnamen yang diikuti (unik)
  const tournaments = [...new Set(transactions.map(t => t.tournament))];

  const tabHeightClass = activeTab === 'profile' ? 'h-full' : 'h-screen'; // Menentukan kelas tinggi berdasarkan tab aktif

  return (
    <div id="profile-container" className="max-w-4xl h-full mx-auto p-4 mt-16 flex flex-col" ref={invoiceRef} style={{ width: '100%', overflow: 'visible' }}>
      <div className="bg-white flex-1 rounded-xl shadow-lg overflow-visible" style={{ width: '100%' }}>
        {/* Header Profil */}
        <ProfileHeader user={user} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div id="profile-tab" className={`p-6 flex-1 ${tabHeightClass}`} style={{ width: '100%' }}>
          {activeTab === 'profile' ? (
            <ProfileTab user={user} refreshUserData={refreshUserData} />
          ) : activeTab === 'tournaments' ? (
            <TournamentsTab 
              tournaments={tournaments} 
              transactions={transactions} 
              fetchTeamDetails={fetchTeamDetails} 
            />
          ) : activeTab === 'schedules' ? (
            <SchedulesTab matchSchedules={matchSchedules} />
          ) : (
            <TransactionsTab transactions={transactions} />
          )}
        </div>
      </div>

      {/* Aksi */}
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between flex-wrap gap-4">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition duration-300"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Modal untuk Detail Tim */}
      {showTeamDetailsModal && teamDetails && (
        <TeamDetailsModal 
          teamDetails={teamDetails} 
          setShowTeamDetailsModal={setShowTeamDetailsModal} 
        />
      )}

      {/* Tambahkan modal di akhir komponen */}
      {showSessionExpiredModal && (
        <SessionExpiredModal onClose={handleCloseSessionModal} />
      )}
    </div>
  );
};

export default ProfilePage; 