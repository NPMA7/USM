'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import bcrypt from 'bcryptjs';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Cek apakah identifier adalah email atau username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      
      let userData, userError;

      if (isEmail) {
        const response = await supabase
          .from('users')
          .select('*')
          .eq('email', identifier);
        userData = response.data;
        userError = response.error;
      } else {
        const response = await supabase
          .from('users')
          .select('*')
          .eq('username', identifier);
        userData = response.data;
        userError = response.error;
      }

      if (userError) {
        throw new Error(userError.message);
      }

      if (!userData || userData.length === 0) {
        throw new Error('Email/username atau password salah');
      }

      const user = userData[0];
      
      // Verifikasi password menggunakan bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Email/username atau password salah');
      }

      // Login berhasil, simpan data pengguna ke localStorage atau state global
      const loginTime = new Date().getTime();
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginTime', loginTime);
      
      const selectedTournament = localStorage.getItem('selectedTournament');
      if (selectedTournament) {
        // Jika ada turnamen yang dipilih sebelumnya, arahkan ke halaman utama
        router.push('/');
      } else {
        // Jika tidak ada, arahkan ke halaman profil
        router.push('/profile');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
    
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Masuk ke Akun Anda</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="identifier" className="block text-gray-700 text-sm font-bold mb-2">
            Email atau Username
          </label>
          <input
            type="text"
            id="identifier"
            placeholder="Masukkan email atau username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded font-bold ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Daftar di sini
          </Link>
        </p>
        <p className="text-gray-600 mt-2">
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Lupa password?
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

export default LoginPage; 