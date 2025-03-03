'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavigation from '@/components/admin/AdminNavigation';
import UsersTab from '@/components/admin/UsersTab';
import TournamentsTab from '@/components/admin/TournamentsTab';
import TransactionsTab from '@/components/admin/TransactionsTab';
import MatchSchedulesTab from '@/components/admin/MatchSchedulesTab';
import SessionExpiredModal from '@/components/SessionExpiredModal';
import TeamsTab from '@/components/admin/TeamsTab';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Cek apakah pengguna sudah login dan memiliki role admin atau owner
    const checkAdmin = () => {
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
      
      const parsedUser = JSON.parse(userData);
      
// Cek apakah pengguna memiliki role admin atau owner
if (parsedUser.role !== 'admin' && parsedUser.role !== 'owner') {
    router.push('/profile');
    return;
  }
      
      setUser(parsedUser);
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    // Trigger event storage
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  const handleCloseSessionModal = () => {
    setShowSessionExpiredModal(false);
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <AdminHeader user={user} handleLogout={handleLogout} />
      
      <div className="container mx-auto  px-4 py-8">
        <div className="bg-white h-screen rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'tournaments' && <TournamentsTab />}
            {activeTab === 'transactions' && <TransactionsTab />}
            {activeTab === 'schedules' && <MatchSchedulesTab />}
            {activeTab === 'teams' && <TeamsTab />}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-300 mx-2"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 mx-2"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Modal untuk sesi yang telah berakhir */}
      {showSessionExpiredModal && (
        <SessionExpiredModal onClose={handleCloseSessionModal} />
      )}
    </div>
  );
};

export default AdminPage; 