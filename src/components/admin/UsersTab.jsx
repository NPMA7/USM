import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import InfoPopup from '@/components/InfoPopup';
import AdminConfirmationModal from '@/components/admin/AdminConfirmationModal';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [infoType, setInfoType] = useState('success');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    getCurrentUserRole();
    checkUserCount();
    // Polling setiap 5 detik untuk memeriksa jumlah pengguna
    const intervalId = setInterval(() => {
      checkUserCount();
    }, 5000);

    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []);

  const getCurrentUserRole = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserRole(user.role);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const {  data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (error) throw error;


      // Jika jumlah pengguna berubah, ambil data pengguna lagi
      setUserCount(prevCount => {
        if (count !== prevCount) {
          fetchUsers(); // Hanya panggil fetchUsers jika ada perubahan
          setInfoMessage('Jumlah pengguna telah diperbarui');
          setInfoType('success');
          return count; // Kembalikan nilai baru
        }
        return prevCount; // Kembalikan nilai lama jika tidak ada perubahan
      });
    } catch (error) {
      console.error('Error checking user count:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setInfoMessage('Role pengguna berhasil diperbarui');
      setInfoType('success');
      setShowInfoPopup(true);
    } catch (error) {
      console.error('Error updating user role:', error);
      setInfoMessage('Gagal memperbarui role pengguna');
      setInfoType('error');
      setShowInfoPopup(true);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowConfirmationModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUser.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menghapus pengguna');
      }
      setInfoMessage('Pengguna berhasil dihapus');
      setInfoType('success');
      setShowInfoPopup(true);
      setShowConfirmationModal(false); // Tutup modal konfirmasi
      fetchUsers(); // Refresh daftar pengguna
    } catch (error) {
      console.error('Error deleting user:', error);
      setInfoMessage('Gagal menghapus pengguna');
      setInfoType('error');
      setShowInfoPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Menentukan apakah pengguna saat ini dapat mengedit role pengguna tertentu
  const canEditRole = (userToEdit) => {
    if (currentUserRole === 'owner') {
      // Owner dapat mengedit semua role
      return true;
    } else if (currentUserRole === 'admin') {
      // Admin tidak dapat mengedit role
      return false;
    }
    return false;
  };
  
  // Menentukan apakah pengguna saat ini dapat menghapus pengguna tertentu
  const canDeleteUser = (userToDelete) => {
    if (currentUserRole === 'owner') {
      // Owner dapat menghapus semua pengguna
      return true;
    } else if (currentUserRole === 'admin') {
      // Admin hanya dapat menghapus user, tidak dapat menghapus admin atau owner
      return userToDelete.role === 'user';
    }
    return false;
  };

  // Opsi role yang tersedia berdasarkan role pengguna saat ini
  const getAvailableRoles = () => {
    if (currentUserRole === 'owner') {
      return ['user', 'admin', 'owner'];
    } else {
      return ['user'];
    }
  };

  return (
    <div>
      {/* Popup untuk informasi */}
      {showInfoPopup && (
        <InfoPopup 
          message={infoMessage} 
          onClose={() => setShowInfoPopup(false)} 
          isSuccess={infoType === 'success'} 
        />
      )}

      {/* Modal konfirmasi untuk penghapusan pengguna */}
      {showConfirmationModal && selectedUser && (
        <AdminConfirmationModal 
          message={`Apakah Anda yakin ingin menghapus pengguna @${selectedUser.username}?`} 
          onConfirm={confirmDeleteUser} 
          onCancel={() => setShowConfirmationModal(false)} 
          isLoading={isLoading}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manajemen Pengguna</h2>
        <div className="flex space-x-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded p-2"
          >
            <option value="all">Semua Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            {currentUserRole === 'owner' && <option value="owner">Owner</option>}
          </select>
          <input
            type="text"
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded p-2 w-64"
          />
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terdaftar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.avatar || "/images/avatar2.png"}
                          alt={user.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/avatar2.png';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.whatsapp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canEditRole(user) ? (
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border rounded p-1 text-sm"
                      >
                        {getAvailableRoles().map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role || 'user'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewUserDetails(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Detail
                    </button>
                    {canDeleteUser(user) && (
                      <>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ngguna */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detail Pengguna</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center flex flex-col justify-center items-center mb-4">
              <img
                src={selectedUser.avatar || "/images/avatar2.png"}
                alt={selectedUser.name}
                className="w-24 h-24 rounded-full object-cover mb-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/avatar2.png';
                }}
              />
              <h4 className="text-xl font-bold">{selectedUser.name}</h4>
              <p className="text-gray-600">@{selectedUser.username}</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p>{selectedUser.whatsapp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="capitalize">{selectedUser.role || 'user'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Terdaftar pada</p>
                <p>{new Date(selectedUser.created_at).toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 