import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// ... existing code ...
const ProfileTab = ({ user, refreshUserData }) => {
  const [isEditing, setIsEditing] = useState({ name: false, username: false, whatsapp: false, birthdate: false, address: false, avatar: false });
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    whatsapp: user.whatsapp || '',
    birthdate: user.birthdate || '',
    address: user.address || '',
    avatar: user.avatar || '/images/avatar2.png' // Default avatar
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [whatsappError, setWhatsappError] = useState('');

useEffect(() => {
  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('name, username, whatsapp, birthdate, address, avatar')
      .eq('email', user.email)
      .single();

    if (error) {
      // console.error('Error fetching user data:', error);
    } else {
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        username: data.username || '',
        whatsapp: data.whatsapp || '',
        birthdate: data.birthdate || '',
        address: data.address || '',
        avatar: data.avatar || '/images/avatar2.png' // Gunakan URL dari database atau default
      }));
    }
  };

  fetchUserData();
}, [user.email]);

useEffect(() => {
  setFormData({
    name: user.name || '',
    username: user.username || '',
    whatsapp: user.whatsapp || '',
    birthdate: user.birthdate || '',
    address: user.address || '',
  });
}, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsappChange = (e) => {
    const value = e.target.value;
    // Hanya menerima input angka dan harus diawali dengan 62
    if (value === '' || /^[0-9]+$/.test(value)) {
      let formattedValue = value;

      if (value.length === 1 && value !== '6') {
        formattedValue = '62' + value; // Menambahkan 62 jika hanya 1 digit
      } else if (value.length > 0 && !value.startsWith('62')) {
        formattedValue = '62' + value; // Menambahkan 62 jika tidak diawali dengan 62
      }

      // Menghilangkan angka 0 dan 6 setelah 62
      if (formattedValue.startsWith('620')) {
        formattedValue = formattedValue.replace('620', '62'); // Menghapus 0 setelah 62
      } else if (formattedValue.startsWith('626')) {
        formattedValue = formattedValue.replace('626', '62'); // Menghapus 6 setelah 62
      }

      setFormData(prev => ({ ...prev, whatsapp: formattedValue }));
      
     
    }
  };

  const checkIfExists = async (field, value) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq(field, value)
      .single();

    return data ? true : false;
  };

  const validateForm = () => {
    if (formData.name.trim() === '') {
      setMessage({ text: 'Nama lengkap tidak boleh kosong.', type: 'error' });
      return false;
    }
    if (formData.username.trim() === '') {
      setMessage({ text: 'Username tidak boleh kosong.', type: 'error' });
      return false;
    }
    if (formData.username.length < 3) {
      setMessage({ text: 'Username harus terdiri dari minimal 3 karakter.', type: 'error' });
      return false;
    }
    if (!/^[\w-]+$/.test(formData.username)) {
      setMessage({ text: 'Username hanya boleh menggunakan karakter alfanumerik dan dash.', type: 'error' });
      return false;
    }
    if (/[A-Z]/.test(formData.username)) {
      setMessage({ text: 'Username tidak boleh menggunakan huruf besar.', type: 'error' });
      return false;
    }
    
    if (formData.whatsapp.trim() === '') {
      setMessage({ text: 'Nomor WhatsApp tidak boleh kosong.', type: 'error' });
      return false;
    }
    if (!/^\d+$/.test(formData.whatsapp)) {
      setMessage({ text: 'Nomor WhatsApp harus berupa angka.', type: 'error' });
      return false;
    }
    if (formData.whatsapp.length < 10) {
      setMessage({ text: 'Nomor WhatsApp harus terdiri dari minimal 10 digit.', type: 'error' });
      return false;
    }
    if (!formData.whatsapp.startsWith('62')) {
      setMessage({ text: 'Nomor WhatsApp harus diawali dengan 62.', type: 'error' });
      return false;
    }
    if (formData.birthdate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthdate)) {
      setMessage({ text: 'Format tanggal lahir tidak valid.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, field) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Jika field adalah username, periksa apakah username sudah digunakan
      if (field === 'username' && formData.username !== user.username) {
        const { data } = await supabase
          .from('users')
          .select('username')
          .eq('username', formData.username)
          .neq('email', user.email)
          .single();
        
        if (data) {
          setMessage({ text: 'Username sudah digunakan. Silakan pilih username lain.', type: 'error' });
          setLoading(false);
          return;
        }
      }
      
      // Jika field adalah whatsapp, periksa apakah nomor WhatsApp sudah digunakan
      if (field === 'whatsapp' && formData.whatsapp !== user.whatsapp) {
        const { data } = await supabase
          .from('users')
          .select('whatsapp')
          .eq('whatsapp', formData.whatsapp)
          .neq('email', user.email)
          .single();
        
        if (data) {
          setMessage({ text: 'Nomor WhatsApp sudah digunakan. Silakan gunakan nomor lain.', type: 'error' });
          setLoading(false);
          return;
        }
      }

      const updatedData = {
        [field]: formData[field]
      };

      // Jika tanggal lahir kosong, jangan kirimkan ke database
      if (field === 'birthdate' && formData.birthdate === '') {
        delete updatedData.birthdate; // Hapus tanggal lahir dari data yang akan diperbarui
      }

      // Jika alamat kosong, jangan kirimkan ke database
      if (field === 'address' && formData.address === '') {
        delete updatedData.address; // Hapus alamat dari data yang akan diperbarui
      }

      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('email', user.email);

      if (error) throw error;

      // Perbarui data user di localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        userData[field] = formData[field];
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Perbarui tampilan lokal dengan nilai yang baru disimpan
      user[field] = formData[field];

      // Panggil refreshUserData untuk memperbarui data user di komponen induk
      if (refreshUserData) {
        refreshUserData();
      }

      setMessage({ text: 'Profil berhasil diperbarui', type: 'success' });
      setIsEditing(prev => ({ ...prev, [field]: false }));

      // Set timeout untuk menghapus pesan setelah 5 detik
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    } catch (error) {
      // console.error('Error updating profile:', error);
      let errorMessage = error.message;
      
      // Periksa apakah error adalah duplicate key untuk username atau whatsapp
      if (error.message.includes('users_username_key')) {
        errorMessage = 'Username sudah digunakan. Silakan pilih username lain.';
      } else if (error.message.includes('users_whatsapp_key')) {
        errorMessage = 'Nomor WhatsApp sudah digunakan. Silakan gunakan nomor lain.';
      }
      
      setMessage({ text: 'Gagal memperbarui profil: ' + errorMessage, type: 'error' });

      // Set timeout untuk menghapus pesan setelah 5 detik
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Tambahkan logika untuk membatalkan pengeditan
  const handleCancel = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: false }));
    setFormData({
      name: user.name || '',
      username: user.username || '',
      whatsapp: user.whatsapp || '',
      birthdate: user.birthdate || '',
      address: user.address || '', // Reset alamat
      avatar: user.avatar || '/images/avatar2.png' // Reset avatar
    }); // Mengatur kembali formData ke nilai awal
  };

  return (
    <div className="space-y-6 pb-14">
      <div>
        <h2 className="text-lg mb-6 font-semibold md:text-2xl">Informasi Pribadi</h2>

        {message.text && (
          <div className={`text-lg p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Lengkap */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xl max-md:text-lg">Nama Lengkap</p>
              {isEditing.name ? (
                <form onSubmit={(e) => handleSubmit(e, 'name')} className="flex items-center">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg text-lg max-md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button type="submit" className="ml-2 px-2 py-1 bg-green-600 text-white rounded">Simpan</button>
                  <button type="button" onClick={() => handleCancel('name')} className="ml-2 px-2 py-1 bg-gray-500 text-white rounded">Batal</button>
                </form>
              ) : (
                <div className="flex items-center">
                  <p className="font-medium">{formData.name}</p>
                  <button onClick={() => setIsEditing(prev => ({ ...prev, name: true }))} className="ml-2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.707 2.293a1 1 0 00-1.414 0L14 4.586 15.414 6 17 4.414a1 1 0 000-1.414zM12.414 7l-1.414-1.414-8 8A1 1 0 002 16v2h2a1 1 0 00.707-.293l8-8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xl max-md:text-lg">Username</p>
              {isEditing.username ? (
                <form onSubmit={(e) => handleSubmit(e, 'username')} className="flex items-center">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg text-lg max-md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button type="submit" className="ml-2 px-2 py-1 bg-green-600 text-white rounded">Simpan</button>
                  <button type="button" onClick={() => handleCancel('username')} className="ml-2 px-2 py-1 bg-gray-500 text-white rounded">Batal</button>
                </form>
              ) : (
                <div className="flex items-center">
                  <p className="font-medium">{user.username}</p>
                  <button onClick={() => setIsEditing(prev => ({ ...prev, username: true }))} className="ml-2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.707 2.293a1 1 0 00-1.414 0L14 4.586 15.414 6 17 4.414a1 1 0 000-1.414zM12.414 7l-1.414-1.414-8 8A1 1 0 002 16v2h2a1 1 0 00.707-.293l8-8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xl max-md:text-lg">WhatsApp</p>
              {isEditing.whatsapp ? (
                <form onSubmit={(e) => handleSubmit(e, 'whatsapp')} className="flex items-center">
                  <input
                    type="number"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleWhatsappChange}
                    className="w-full p-2 border rounded-lg text-lg max-md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    required
                  />
                  {whatsappError && (
                    <p className="text-red-500 text-xs italic">{whatsappError}</p>
                  )}
                  <button type="submit" className="ml-2 px-2 py-1 bg-green-600 text-white rounded">Simpan</button>
                  <button type="button" onClick={() => handleCancel('whatsapp')} className="ml-2 px-2 py-1 bg-gray-500 text-white rounded">Batal</button>
                </form>
              ) : (
                <div className="flex items-center">
                  <p className="font-medium">{user.whatsapp}</p>
                  <button onClick={() => setIsEditing(prev => ({ ...prev, whatsapp: true }))} className="ml-2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.707 2.293a1 1 0 00-1.414 0L14 4.586 15.414 6 17 4.414a1 1 0 000-1.414zM12.414 7l-1.414-1.414-8 8A1 1 0 002 16v2h2a1 1 0 00.707-.293l8-8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tanggal Lahir */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xl max-md:text-lg">Tanggal Lahir</p>
              {isEditing.birthdate ? (
                <form onSubmit={(e) => handleSubmit(e, 'birthdate')} className="flex items-center">
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg text-lg max-md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button type="submit" className="ml-2 px-2 py-1 bg-green-600 text-white rounded">Simpan</button>
                  <button type="button" onClick={() => handleCancel('birthdate')} className="ml-2 px-2 py-1 bg-gray-500 text-white rounded">Batal</button>
                </form>
              ) : (
                <div className="flex items-center">
                  <p className="font-medium">{formData.birthdate ? formData.birthdate : 'Belum diatur, silahkan ubah'}</p>
                  <button onClick={() => setIsEditing(prev => ({ ...prev, birthdate: true }))} className="ml-2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.707 2.293a1 1 0 00-1.414 0L14 4.586 15.414 6 17 4.414a1 1 0 000-1.414zM12.414 7l-1.414-1.414-8 8A1 1 0 002 16v2h2a1 1 0 00.707-.293l8-8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Alamat */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xl max-md:text-lg">Alamat</p>
              {isEditing.address ? (
                <form onSubmit={(e) => handleSubmit(e, 'address')} className="flex items-center">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg text-lg max-md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button type="submit" className="ml-2 px-2 py-1 bg-green-600 text-white rounded">Simpan</button>
                  <button type="button" onClick={() => handleCancel('address')} className="ml-2 px-2 py-1 bg-gray-500 text-white rounded">Batal</button>
                </form>
              ) : (
                <div className="flex items-center">
                  <p className="font-medium">{formData.address ? formData.address : 'Belum diatur, silahkan ubah'}</p>
                  <button onClick={() => setIsEditing(prev => ({ ...prev, address: true }))} className="ml-2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.707 2.293a1 1 0 00-1.414 0L14 4.586 15.414 6 17 4.414a1 1 0 000-1.414zM12.414 7l-1.414-1.414-8 8A1 1 0 002 16v2h2a1 1 0 00.707-.293l8-8z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xl max-md:text-lg">Email</p>
              <div className="flex items-center">
                <p className="font-medium">{user.email}</p>
                {user.email_verified ? (
                  <span className="ml-2 text-green-500" title="Email terverifikasi">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="ml-2 text-yellow-500 text-xs italic">belum terverifikasi</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;