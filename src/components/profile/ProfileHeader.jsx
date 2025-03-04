import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const ProfileHeader = ({ user, refreshUserData }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Tambahkan fungsi untuk menghapus file menggunakan API endpoint khusus
  const deleteOldAvatar = async (fileName) => {
    try {
      const response = await fetch('/api/delete-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete old avatar');
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (maksimal 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ text: 'Ukuran file terlalu besar. Maksimal 10MB.', type: 'error' });
        return;
      }
      
      setLoading(true);
      
      try {
        // Dapatkan data user saat ini untuk mendapatkan avatar yang ada
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('avatar')
          .eq('email', user.email)
          .single();
        
        if (userError) {
          // console.error('Error fetching current user data:', userError);
        } 
        
        // Variabel untuk menyimpan nama file lama untuk dihapus nanti
        let oldFileName = null;
        
        // Ekstrak nama file dari URL avatar lama jika ada
        if (userData?.avatar) {
          try {
            const oldAvatarUrl = userData.avatar;
            const urlParts = oldAvatarUrl.split('/');
            oldFileName = urlParts[urlParts.length - 1];
          } catch (err) {
            // console.error('Error extracting old file name:', err);
          }
        } 
        
        // Kompres gambar sebelum upload - ubah dari 300KB menjadi 150KB
        const compressedFile = await compressImage(file, 150); // Kompres menjadi sekitar 150KB
        
        // Gunakan nama file yang lebih sederhana dengan email pengguna untuk konsistensi
        const fileExt = file.name.split('.').pop();
        const sanitizedEmail = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `avatar_${sanitizedEmail}_${Date.now()}.${fileExt}`;
        
        // Upload file ke bucket 'avatars'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
          });
        
        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }
        
        // Dapatkan URL publik dari file yang diunggah
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        if (!urlData || !urlData.publicUrl) {
          throw new Error('Failed to get public URL');
        }
        
        const avatarUrl = urlData.publicUrl;
        
        // Simpan URL avatar ke database
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ avatar: avatarUrl })
          .eq('email', user.email);
        
        if (updateError) {
          throw new Error(`Database update error: ${updateError.message}`);
        }
        
        // Setelah berhasil mengupload avatar baru dan memperbarui database,
        // hapus avatar lama menggunakan API endpoint
        if (oldFileName && oldFileName.includes('avatar_')) {
          const deleteResult = await deleteOldAvatar(oldFileName);
        }
        
        // Perbarui data user di localStorage dengan avatar baru
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          currentUser.avatar = avatarUrl;
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          // Perbarui state user lokal untuk memperbarui tampilan
          user.avatar = avatarUrl;
          
          // Trigger event storage untuk memberitahu komponen lain
          window.dispatchEvent(new Event('storage'));
        }
        
        setMessage({ text: 'Avatar berhasil diperbarui', type: 'success' });
        
        if (refreshUserData) {
          refreshUserData();
        }

        // Set timeout untuk menghapus pesan setelah 5 detik
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 5000);
      } catch (error) {
        setMessage({ text: 'Gagal memperbarui avatar: ' + (error.message || 'Terjadi kesalahan'), type: 'error' });
        
        // Set timeout untuk menghapus pesan setelah 5 detik
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 5000);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fungsi untuk mengompres gambar
  const compressImage = (file, targetSizeKB) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Jika gambar terlalu besar, kurangi ukurannya
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Mulai dengan kualitas lebih rendah untuk mencapai ukuran 150KB
          let quality = 0.8;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Kompres secara bertahap sampai mencapai ukuran target
          const iterations = 10;
          let currentIteration = 0;
          
          const reduceSize = () => {
            // Konversi base64 ke perkiraan ukuran dalam KB
            const sizeInKB = Math.round((dataUrl.length * 0.75) / 1024);
            
            if (sizeInKB <= targetSizeKB || currentIteration >= iterations) {
              // Konversi data URL menjadi Blob
              const byteString = atob(dataUrl.split(',')[1]);
              const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              
              const blob = new Blob([ab], { type: mimeType });
              resolve(blob);
            } else {
              // Kurangi kualitas dan coba lagi
              quality -= 0.1;
              if (quality < 0.1) quality = 0.1;
              
              dataUrl = canvas.toDataURL('image/jpeg', quality);
              currentIteration++;
              reduceSize();
            }
          };
          
          reduceSize();
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white rounded-t-xl">
      {message.text && (
        <div className={`text-lg p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="flex justify-between overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.avatar || "/images/avatar2.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-white object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/avatar2.png';
              }}
            />
            <label 
              htmlFor="avatar-upload" 
              className={`absolute bottom-0 right-0 rounded-full p-1 cursor-pointer transition ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              id="avatar-upload"
              className="hidden"
              disabled={loading}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div className='flex flex-col flex-wrap w-1/2 overflow-hidden'>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-blue-100">@{user.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 max-md:absolute max-md:right-2 max-md:rotate-90">
          <h1 className="text-2xl font-extrabold">USM</h1>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 