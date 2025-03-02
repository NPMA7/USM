'use client';
import { useState, useEffect } from 'react';
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

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [teamDetails, setTeamDetails] = useState(null);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [matchSchedules, setMatchSchedules] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Cek apakah pengguna sudah login
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/auth/login');
        return;
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
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mendapatkan turnamen yang diikuti (unik)
  const tournaments = [...new Set(transactions.map(t => t.tournament))];

  return (
    <div className="max-w-4xl mx-auto p-4 mt-16 flex flex-col h-screen">
      <div className="bg-white flex-1 rounded-xl shadow-lg overflow-auto">
        {/* Header Profil */}
        <ProfileHeader user={user} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="p-6 flex-1">
          {activeTab === 'profile' ? (
            <ProfileTab user={user} />
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
    </div>
  );
};

export default ProfilePage; 