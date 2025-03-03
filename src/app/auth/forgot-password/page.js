'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  // State dasar
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // State untuk OTP
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // State untuk langkah-langkah form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
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

  // Countdown untuk tombol kirim ulang
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Fungsi untuk mengirim OTP
  const sendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Format email tidak valid.');
      return;
    }

    setSendingOtp(true);
    setOtpError(null);
    setError(null);

    try {
      // Periksa apakah email terdaftar
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('Email tidak terdaftar dalam sistem.');
      }

      // Kirim OTP ke email
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          purpose: 'reset_password' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim kode OTP');
      }

      setOtpSent(true);
      setShowOtpForm(true);
      setSuccess(`Kode OTP telah dikirim ke email Anda`);
      
      // Atur countdown untuk tombol kirim ulang
      setResendDisabled(true);
      setCountdown(60);
    } catch (error) {
      setError(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Fungsi untuk verifikasi OTP
  const verifyOtp = async () => {
    if (!otp) {
      setOtpError('Masukkan kode OTP');
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp,
          purpose: 'reset_password'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kode OTP tidak valid');
      }

      setOtpVerified(true);
      setShowOtpForm(false);
      setSuccess('Kode OTP berhasil diverifikasi. Silakan atur password baru Anda.');
      
      // Lanjut ke langkah berikutnya setelah verifikasi OTP
      setCurrentStep(2);
    } catch (error) {
      setOtpError(error.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Fungsi untuk reset password
  const resetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validasi password
    if (password.length < 6) {
      setLoading(false);
      setError('Password harus terdiri dari minimal 6 karakter.');
      return;
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      setLoading(false);
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      // Update password di database
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ password: password }) // Dalam implementasi nyata, gunakan hash password
        .eq('email', email);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess('Password berhasil diubah. Silakan login dengan password baru Anda.');
      
      // Redirect ke halaman login setelah beberapa detik
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
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

  // Render indikator langkah
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : currentStep > step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 2 && (
              <div className={`w-12 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto my-10 mt-24 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Lupa Password</h2>
      
      {renderStepIndicator()}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Langkah 1: Verifikasi Email */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  id="email"
                  placeholder="Masukkan email terdaftar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error && error.includes('email') ? 'border-red-500' : ''
                  } ${otpVerified ? 'bg-green-50 border-green-500' : ''}`}
                />
                
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={!email || sendingOtp || resendDisabled}
                    className={`whitespace-nowrap px-3 py-2 rounded font-bold ${
                      !email || sendingOtp || resendDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {sendingOtp 
                      ? 'Mengirim...' 
                      : resendDisabled 
                        ? `${countdown}s` 
                        : otpSent 
                          ? 'Kirim Ulang' 
                          : 'Kirim OTP'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Form OTP yang muncul setelah tombol kirim OTP ditekan */}
            {showOtpForm && !otpVerified && (
              <div className="flex space-x-2 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="text"
                  id="otp"
                  placeholder="Masukkan kode OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={verifyingOtp}
                  className={`w-full px-3 py-2 rounded font-bold ${
                    verifyingOtp ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {verifyingOtp ? 'Memverifikasi...' : 'Verifikasi OTP'}
                </button>
              </div>
            )}
            
            {otpError && (
              <p className="text-xs text-red-500 mt-1">{otpError}</p>
            )}
          </div>
        )}
        
        {/* Langkah 2: Reset Password */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password Baru
              </label>
              <input
                type="password"
                id="password"
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {password && password.length < 6 && (
                <p className="text-xs text-red-500 mt-1">Password harus terdiri dari minimal 6 karakter.</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Konfirmasi password baru"
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
              type="button"
              onClick={resetPassword}
              disabled={
                password.length < 6 || 
                password !== confirmPassword || 
                loading
              }
              className={`w-full p-3 rounded font-bold ${
                password.length >= 6 && 
                password === confirmPassword && 
                !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
          </div>
        )}
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Ingat password Anda?{' '}
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

export default ForgotPasswordPage; 