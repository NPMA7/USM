import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import InfoPopup from '@/components/InfoPopup';
import AdminConfirmationModal from '@/components/admin/AdminConfirmationModal';

export default function TournamentsTab() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxTeams, setMaxTeams] = useState('');
  const [status, setStatus] = useState('open');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [compressing, setCompressing] = useState(false);

  // State untuk InfoPopup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // State untuk konfirmasi penghapusan
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);
  const [tournamentToDeleteImage, setTournamentToDeleteImage] = useState(null);

  const [tournamentCount, setTournamentCount] = useState(0); // State untuk menyimpan jumlah turnamen

  // Tambahkan state untuk menyimpan error nama turnamen
  const [tournamentNameError, setTournamentNameError] = useState("");

  useEffect(() => {
    fetchTournaments();
    checkTournamentCount(); // Panggil sekali saat komponen dimuat
    const intervalId = setInterval(() => {
      checkTournamentCount(); // Memanggil fungsi untuk memeriksa jumlah turnamen setiap 5 detik
    }, 5000);

    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error mengambil data turnamen:', error);
      setPopupMessage('Gagal mengambil data turnamen: ' + error.message);
      setIsSuccess(false);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const checkTournamentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact' });

      if (error) throw error;

      // Jika jumlah turnamen berubah, ambil data turnamen lagi
      setTournamentCount(prevCount => {
        if (count !== prevCount) {
          fetchTournaments(); // Refresh data jika ada perubahan
          return count; // Kembalikan nilai baru
        }
        return prevCount; // Kembalikan nilai lama jika tidak ada perubahan
      });
    } catch (error) {
      console.error('Error checking tournament count:', error);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (tournament) => {
    setEditMode(true);
    setCurrentTournament(tournament);
    setName(tournament.name || '');
    setGame(tournament.game || '');
    setDescription(tournament.description || '');
    setPrice(tournament.price?.toString() || '');
    setStartDate(tournament.start_date || '');
    setEndDate(tournament.end_date || '');
    setMaxTeams(tournament.max_teams?.toString() || '');
    setStatus(tournament.status || 'open');
    setImageUrl(tournament.image_url || '');
    setImagePreview(tournament.image_url || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setGame('');
    setDescription('');
    setPrice('');
    setStartDate('');
    setEndDate('');
    setMaxTeams('');
    setStatus('open');
    setImage(null);
    setImageUrl('');
    setImagePreview('');
  };

  // Fungsi untuk mengompres gambar
  const compressImage = async (file) => {
    setCompressing(true);
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Buat canvas untuk kompresi
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Jika gambar terlalu besar, resize dengan mempertahankan rasio aspek
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          
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
          
          // Kompresi dengan kualitas yang disesuaikan
          // Mulai dengan kualitas tinggi dan turunkan jika masih terlalu besar
          let quality = 0.9;
          let compressedFile;
          
          const tryCompress = (currentQuality) => {
            // Convert canvas ke blob
            canvas.toBlob((blob) => {
              // Jika ukuran masih > 500KB dan kualitas > 0.1, coba kompresi lagi
              if (blob.size > 500 * 1024 && currentQuality > 0.1) {
                tryCompress(currentQuality - 0.1);
              } else {
                // Buat file dari blob
                compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                
                setCompressing(false);
                resolve(compressedFile);
              }
            }, 'image/jpeg', currentQuality);
          };
          
          tryCompress(quality);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Buat URL preview untuk gambar yang dipilih
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
        
        // Kompresi gambar jika ukurannya > 500KB
        if (file.size > 500 * 1024) {
          const compressedImage = await compressImage(file);
          setImage(compressedImage);
        } else {
          setImage(file);
        }
      } catch (error) {
        console.error('Error saat memproses gambar:', error);
        setPopupMessage('Gagal memproses gambar. Silakan coba lagi.');
        setIsSuccess(false);
        setShowPopup(true);
      }
    }
  };

  const uploadImage = async () => {
    if (!image) return imageUrl;
    
    try {
      setUploadingImage(true);
      
      // Buat nama file berdasarkan nama turnamen, game, dan tanggal upload
      const fileExt = image.type.split('/')[1] || 'jpg';
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const sanitizedGame = game.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const fileName = `${sanitizedName}_${sanitizedGame}_${currentDate}.${fileExt}`;
      
      // Cek apakah user data tersedia di localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Data pengguna tidak ditemukan. Silakan login ulang.');
      }
      
      // Upload gambar ke bucket "turnamen"
      const { error: uploadError } = await supabase.storage
        .from('turnamen')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: true // Overwrite jika file dengan nama yang sama sudah ada
        });
      
      if (uploadError) {
        console.error('Upload error details:', uploadError); // Debugging: Detail error upload
        throw new Error(`Error upload: ${uploadError.message || JSON.stringify(uploadError)}`);
      }
      
      // Dapatkan URL publik dari gambar yang diupload
      const { data } = supabase.storage
        .from('turnamen')
        .getPublicUrl(fileName);
      
      console.log('Uploaded image public URL:', data.publicUrl); // Debugging: URL gambar yang diupload
      return data.publicUrl;
    } catch (error) {
      console.error('Error mengupload gambar:', error); // Debugging: Error saat upload
      setPopupMessage('Gagal mengupload gambar: ' + (error.message || JSON.stringify(error)));
      setIsSuccess(false);
      setShowPopup(true);
      return imageUrl; // Kembalikan URL gambar lama jika gagal
    } finally {
      setUploadingImage(false);
    }
  };

  const checkTournamentNameAvailability = async (tournamentName) => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('name', tournamentName);

      if (error) {
        console.error('Error checking tournament name availability:', error);
        return false;
      }

      return data.length === 0; // Jika tidak ada data, nama tersedia
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi nama turnamen
    const isNameAvailable = await checkTournamentNameAvailability(name);
    if (!isNameAvailable) {
      setTournamentNameError("Nama turnamen sudah terdaftar. Silakan pilih nama lain.");
      return;
    } else {
      setTournamentNameError(""); // Reset error jika nama tersedia
    }

    try {
      setLoading(true);
      let finalImageUrl = imageUrl;
      
      // Upload gambar jika ada gambar baru yang dipilih
      if (image) {
        finalImageUrl = await uploadImage();
        if (!finalImageUrl) {
          setPopupMessage('Gagal mengupload gambar turnamen');
          setIsSuccess(false);
          setShowPopup(true);
          setLoading(false);
          return;
        }
      }
      
      const tournamentData = {
        name,
        game,
        description,
        price: parseFloat(price),
        start_date: startDate,
        end_date: endDate,
        max_teams: parseInt(maxTeams),
        status,
        image_url: finalImageUrl,
      };
      
      if (editMode) {
        // Jika mengedit dan gambar diganti, hapus gambar lama
        if (image && currentTournament.image_url && currentTournament.image_url !== finalImageUrl) {
          await deleteImageFromBucket(currentTournament.image_url);
        }
        
        // Update turnamen yang sudah ada
        const { error } = await supabase
          .from('tournaments')
          .update(tournamentData)
          .eq('id', currentTournament.id);
          
        if (error) throw error;
        
        setPopupMessage('Turnamen berhasil diperbarui');
        setIsSuccess(true);
        setShowPopup(true);
      } else {
        // Tambah turnamen baru
        const { error } = await supabase
          .from('tournaments')
          .insert([tournamentData]);
          
        if (error) throw error;
        
        setPopupMessage('Turnamen berhasil ditambahkan');
        setIsSuccess(true);
        setShowPopup(true);
      }
      
      // Refresh daftar turnamen
      fetchTournaments();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error menyimpan turnamen:', error);
      setPopupMessage('Gagal menyimpan turnamen: ' + error.message);
      setIsSuccess(false);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengekstrak nama file dari URL
  const extractFileNameFromUrl = (url) => {
    if (!url) return null;
    
    try {
      // Dapatkan path dari URL
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      
      // Nama file biasanya ada di segmen terakhir path
      return pathSegments[pathSegments.length - 1];
    } catch (error) {
      console.error('Error mengekstrak nama file:', error);
      return null;
    }
  };

  // Fungsi untuk menghapus gambar dari bucket menggunakan API
  const deleteImageFromBucket = async (imageUrl) => {
    try {
      // Ekstrak nama file dari URL
      const fileName = extractFileNameFromUrl(imageUrl);
      if (!fileName) {
        throw new Error('Nama file tidak valid');
      }

      // Panggil API untuk menghapus file
      const response = await fetch('/api/delete-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucket: 'turnamen',
          fileName: fileName
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal menghapus gambar');
      }

      return result;
    } catch (error) {
      console.error('Error menghapus gambar:', error);
      throw error;
    }
  };

  const handleDeleteTournament = async (id) => {
    setTournamentToDelete(id); // Set turnamen yang akan dihapus
    setShowConfirmationModal(true); // Tampilkan modal konfirmasi
  };

  const confirmDeleteTournament = async () => {
    if (!tournamentToDelete) return;

    try {
      setLoading(true);
      
      // Cari turnamen yang akan dihapus untuk mendapatkan URL gambar
      const tournamentToDeleteData = tournaments.find(t => t.id === tournamentToDelete);
      
      if (tournamentToDeleteData && tournamentToDeleteData.image_url) {
        // Hapus gambar dari bucket storage
        await deleteImageFromBucket(tournamentToDeleteData.image_url);
      }
      
      // Hapus data turnamen dari database
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentToDelete);
        
      if (error) throw error;
      
      setPopupMessage('Turnamen berhasil dihapus');
      setIsSuccess(true);
      setShowPopup(true); // Tampilkan InfoPopup
      fetchTournaments();
    } catch (error) {
      console.error('Error menghapus turnamen:', error);
      setPopupMessage('Gagal menghapus turnamen: ' + error.message);
      setIsSuccess(false);
      setShowPopup(true); // Tampilkan InfoPopup
    } finally {
      setLoading(false);
      setShowConfirmationModal(false); // Sembunyikan modal konfirmasi
      setTournamentToDelete(null); // Reset turnamen yang akan dihapus
    }
  };

  const handleDeleteImage = async (tournament) => {
    setTournamentToDeleteImage(tournament); // Set turnamen yang gambarnya akan dihapus
    setShowConfirmationModal(true); // Tampilkan modal konfirmasi
  };

  const confirmDeleteImage = async () => {
    if (!tournamentToDeleteImage) return;

    try {
      setLoading(true);
      
      // Hapus gambar dari bucket
      await deleteImageFromBucket(tournamentToDeleteImage.image_url);
      
      // Update data turnamen tanpa gambar
      const { error } = await supabase
        .from('tournaments')
        .update({ image_url: null })
        .eq('id', tournamentToDeleteImage.id);
        
      if (error) throw error;
      
      setPopupMessage('Gambar turnamen berhasil dihapus');
      setIsSuccess(true);
      setShowPopup(true); // Tampilkan InfoPopup
      fetchTournaments();
    } catch (error) {
      console.error('Error menghapus gambar turnamen:', error);
      setPopupMessage('Gagal menghapus gambar turnamen: ' + error.message);
      setIsSuccess(false);
      setShowPopup(true); // Tampilkan InfoPopup
    } finally {
      setLoading(false);
      setShowConfirmationModal(false); // Sembunyikan modal konfirmasi
      setTournamentToDeleteImage(null); // Reset turnamen yang gambarnya akan dihapus
    }
  };

  return (
    <div>
      {/* InfoPopup */}
      {showPopup && (
        <InfoPopup 
          message={popupMessage} 
          isSuccess={isSuccess} 
          onClose={() => setShowPopup(false)} 
        />
      )}

      {/* AdminConfirmationModal untuk menghapus turnamen */}
      {showConfirmationModal && !tournamentToDeleteImage && (
        <AdminConfirmationModal 
          message="Apakah Anda yakin ingin menghapu ini?"
          onConfirm={confirmDeleteTournament}
          onCancel={() => setShowConfirmationModal(false)}
          isLoading={loading}
        />
      )}

      {/* AdminConfirmationModal untuk menghapus gambar */}
      {showConfirmationModal && tournamentToDeleteImage && (
        <AdminConfirmationModal 
          message="Apakah Anda yakin ingin menghapus ini?"
          onConfirm={confirmDeleteImage}
          onCancel={() => setShowConfirmationModal(false)}
          isLoading={loading}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manajemen Turnamen</h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tambah Turnamen
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {tournament.image_url ? (
                  <img
                    src={tournament.image_url}
                    alt={tournament.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/tournament-placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">Tidak ada gambar</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-2">
                  <span className={`px-6 py-3 text-md font-semibold text-white rounded ${
                    tournament.status === 'open' ? 'bg-green-500' : 
                    tournament.status === 'closed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {tournament.status === 'open' ? 'Dibuka' : 
                     tournament.status === 'closed' ? 'Ditutup' : 'Berlangsung'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{tournament.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tournament.game}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>Rp {tournament.price?.toLocaleString('id-ID')}</span>
                  <span>Max {tournament.max_teams} tim</span>
                </div>
                
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{tournament.description}</p>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => openEditModal(tournament)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteImage(tournament)}
                    className="px-3 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    disabled={!tournament.image_url}
                  >
                    Hapus Gambar
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(tournament.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Hapus
                  </button>
                 
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Turnamen */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {editMode ? 'Edit Turnamen' : 'Tambah Turnamen Baru'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Turnamen - Jenis Turnamen
                    </label>
                    <p className="text-xs text-gray-500 mb-1"> Contoh: RAMADHAN ESPORTS - CS ELITE </p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setTournamentNameError(""); // Reset error saat pengguna mengetik
                      }}
                      required
                      placeholder='RAMADHAN ESPORTS - CS ELITE'
                      className="w-full p-2 border rounded"
                    />
                    {tournamentNameError && (
                      <p className="text-red-500 text-xs">{tournamentNameError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game
                    </label>
                    <p className="text-xs text-gray-500 mb-1"> Contoh: Mobile Legends </p>
                   
                    <select
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Pilih Game</option>
                      <option value="Mobile Legend">Mobile Legends</option>
                      <option value="MCGG (MagicChess)">MCGG (MagicChess)</option>
                      <option value="FreeFire Bermuda">FreeFire Bermuda</option>
                      <option value="FreeFire CS ELITE">FreeFire CS ELITE</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Pendaftaran (Rp)
                    </label>
                    <p className="text-xs text-gray-500 mb-1"> *10rb = 10000 </p>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder='100000'
                      min="0"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maksimal Tim
                    </label>
                    <p className="text-xs text-gray-500 mb-1"> *minimal 1 </p>
                    <input
                      type="number"
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(e.target.value)}
                      required
                      min="1"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                      className="w-full p-2 border rounded"
                    >
                      <option value="open">Dibuka</option>
                      <option value="ongoing">Berlangsung</option>
                      <option value="closed">Ditutup</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gambar Turnamen
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border rounded"
                      disabled={compressing}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: JPG, PNG, WebP. Ukuran maks: 500KB (gambar akan dikompresi otomatis)
                    </p>
                    {compressing && (
                      <p className="text-xs text-blue-500 mt-1 flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengompresi gambar...
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Preview gambar */}
                {imagePreview && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preview Gambar
                    </label>
                    <div className="h-48 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows="4"
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 mr-2"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingImage || compressing}
                    className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                      (loading || uploadingImage || compressing) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading || uploadingImage || compressing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </span>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 