'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [whatsappError, setWhatsappError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const router = useRouter();

  // Fungsi untuk memeriksa apakah tombol daftar harus dinonaktifkan
  const isDisableButton = () => {
    // Cek apakah semua field sudah diisi
    const isFieldsFilled = 
      name.trim() !== '' && 
      username.trim() !== '' && 
      email.trim() !== '' && 
      whatsapp.trim() !== '' && 
      password.trim() !== '' && 
      confirmPassword.trim() !== '';
    
    // Cek apakah ada error validasi
    const hasErrors = 
      usernameError || 
      emailError || 
      whatsappError || 
      passwordError || 
      password !== confirmPassword;
    
    // Tombol dinonaktifkan jika ada field yang kosong atau ada error
    return !isFieldsFilled || hasErrors || loading;
  };

  // Cek apakah pengguna sudah login saat komponen dimuat
  useEffect(() => {
    const checkLoggedIn = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        // Jika sudah login, arahkan ke halaman profil
        router.push('/profile');
      } else {
        setInitialLoading(false);
      }
    };

    checkLoggedIn();
  }, [router]);

  // Fungsi untuk memeriksa ketersediaan username
  const checkUsernameAvailability = async (value) => {
    if (value.length < 3) {
      setUsernameError('Username harus terdiri dari minimal 3 karakter.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', value);

      if (error) throw error;

      if (data && data.length > 0) {
        setUsernameError('Username sudah digunakan.');
      } else {
        setUsernameError(null);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  };

  // Fungsi untuk memeriksa ketersediaan email
  const checkEmailAvailability = async (value) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Format email tidak valid.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', value);

      if (error) throw error;

      if (data && data.length > 0) {
        setEmailError('Email sudah digunakan.');
      } else {
        setEmailError(null);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };

  // Fungsi untuk memeriksa ketersediaan WhatsApp
  const checkWhatsappAvailability = async (number) => {
    try {
      // Validasi panjang nomor terlebih dahulu
      if (number.length < 10) {
        setWhatsappError("Nomor WhatsApp harus terdiri dari minimal 10 digit");
        return; // Hentikan eksekusi jika panjang tidak valid
      }
      
      if (number.length > 14) {
        setWhatsappError("Nomor WhatsApp tidak boleh lebih dari 14 digit");
        return; // Hentikan eksekusi jika panjang tidak valid
      }
      
      // Jika panjang valid, lakukan pengecekan ketersediaan
      const { data, error } = await supabase
        .from('users')
        .select('whatsapp')
        .eq('whatsapp', number)
      
      if (error) {
        console.error('Error checking WhatsApp availability:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setWhatsappError("Nomor WhatsApp ini sudah terdaftar");
      } else {
        setWhatsappError(""); // Hanya set kosong jika benar-benar tersedia
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handler untuk perubahan username
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    if (value.length > 0) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  // Handler untuk perubahan email
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.length > 0) {
      const timeoutId = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  // Handler untuk perubahan WhatsApp
  const handleWhatsappChange = (e) => {
    const value = e.target.value;
    // Hanya menerima input angka dan harus diawali dengan 0
    if (value === '' || /^[0-9]+$/.test(value)) {
      let formattedValue = value;
      
      if (value.length === 1 && value !== '0') {
        formattedValue = '0' + value; // Menambahkan 0 jika hanya 1 digit
      } else if (value.length > 0 && value[0] !== '0') {
        formattedValue = '0' + value; // Menambahkan 0 jika tidak diawali dengan 0
      }
      
      setWhatsapp(formattedValue);
      
      // Validasi dasar panjang nomor WhatsApp
      if (formattedValue === '') {
        setWhatsappError(null); // Reset error jika kosong
      } else if (formattedValue.length < 10) {
        setWhatsappError("Nomor WhatsApp harus terdiri dari minimal 10 digit");
      } else if (formattedValue.length > 14) {
        setWhatsappError("Nomor WhatsApp tidak boleh lebih dari 14 digit");
      } else {
        // Hanya lakukan pengecekan ketersediaan jika panjang valid
        // Gunakan setTimeout untuk menunda pengecekan hingga pengguna selesai mengetik
        const timeoutId = setTimeout(() => {
          checkWhatsappAvailability(formattedValue);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  };

  // Handler untuk perubahan password
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Validasi panjang password
    if (value.length < 6) {
      setPasswordError('Password harus terdiri dari minimal 6 karakter.');
    } else {
      setPasswordError(null);
    }
  };

  // Handler untuk pendaftaran
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validasi password
    if (password.length < 6) {
      setLoading(false);
      setPasswordError('Password harus terdiri dari minimal 6 karakter.');
      return;
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      setLoading(false);
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    // Cek ketersediaan username, email, dan WhatsApp sebelum mendaftar
    if (usernameError || emailError || whatsappError) {
      setLoading(false);
      return;
    }

    // Format nomor WhatsApp
    let formattedWhatsapp = whatsapp;
    if (whatsapp.startsWith('0')) {
      formattedWhatsapp = '62' + whatsapp.substring(1);
    } else if (!whatsapp.startsWith('62')) {
      formattedWhatsapp = '62' + whatsapp;
    }

    // Buat objek user
    const newUser = {
      name,
      username,
      email,
      whatsapp: formattedWhatsapp,
      password, // Dalam implementasi nyata, gunakan hash password
    };

    // Simpan data pengguna ke tabel 'users'
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([newUser])
      .select();

    if (insertError) {
      setLoading(false);
      setError(insertError.message);
    } else {
      // Simpan data pengguna ke localStorage
      localStorage.setItem('user', JSON.stringify(data[0]));
      
      // Redirect langsung ke halaman profil
      router.push('/profile');
    }
  };

  // Tampilkan loading spinner saat pengecekan awal
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Daftar Akun Baru</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="name"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Masukkan username"
            value={username}
            onChange={handleUsernameChange}
            required
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              usernameError ? 'border-red-500' : ''
            }`}
          />
          {usernameError && (
            <p className="text-xs text-red-500 mt-1">{usernameError}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Masukkan email"
            value={email}
            onChange={handleEmailChange}
            required
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              emailError ? 'border-red-500' : ''
            }`}
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="whatsapp" className="block text-gray-700 text-sm font-bold mb-2">
            Nomor WhatsApp
          </label>
          <input
            type="text"
            id="whatsapp"
            placeholder="Masukkan nomor WhatsApp"
            value={whatsapp}
            onChange={handleWhatsappChange}
            required
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              whatsappError ? 'border-red-500' : ''
            }`}
          />
          {whatsappError && (
            <p className="text-xs text-red-500 mt-1">{whatsappError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Format: 08xxxxxxxxxx
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Masukkan password"
            value={password}
            onChange={handlePasswordChange}
            required
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              passwordError ? 'border-red-500' : ''
            }`}
          />
          {passwordError && (
            <p className="text-xs text-red-500 mt-1">{passwordError}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
            Konfirmasi Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Konfirmasi password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              password !== confirmPassword && confirmPassword ? 'border-red-500' : ''
            }`}
          />
          {password !== confirmPassword && confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isDisableButton()}
          className={`w-full p-3 rounded font-bold ${
            isDisableButton() 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
      
      <div className="mt-6 border-t pt-4">
        <button 
          onClick={() => router.push('/')}
          className="w-full p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-300"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
