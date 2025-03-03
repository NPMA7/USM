'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RegisterPage = () => {
  // State dasar
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
  
  // State validasi
  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [whatsappError, setWhatsappError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const router = useRouter();
  
  // State untuk OTP
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // State untuk langkah-langkah form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
    
    // Tombol dinonaktifkan jika ada field yang kosong, ada error, atau email belum diverifikasi
    return !isFieldsFilled || hasErrors || loading || !emailVerified;
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

  // Fungsi untuk mengirim OTP
  const sendOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Format email tidak valid.');
      return;
    }

    setSendingOtp(true);
    setOtpError(null);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          purpose: 'verification' 
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
      setOtpError(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Countdown untuk tombol kirim ulang
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

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
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kode OTP tidak valid');
      }

      setEmailVerified(true);
      setShowOtpForm(false);
      setSuccess('Email berhasil diverifikasi');
      
      // Lanjut ke langkah berikutnya setelah verifikasi email
      setCurrentStep(2);
    } catch (error) {
      setOtpError(error.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Fungsi untuk memeriksa ketersediaan username
  const checkUsernameAvailability = async (value) => {
    if (value.length < 3) {
      setUsernameError('Username harus terdiri dari minimal 3 karakter.');
      return;
    }
    
    // Validasi huruf kecil
    if (value !== value.toLowerCase()) {
      setUsernameError('Username harus menggunakan huruf kecil semua.');
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
        .eq('whatsapp', number);
      
      if (error) {
        console.error('Error checking WhatsApp availability:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setWhatsappError("Nomor WhatsApp ini sudah terdaftar");
      } else {
        setWhatsappError(null); // Gunakan null untuk konsistensi dengan validasi lain
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
    setEmailVerified(false); // Reset status verifikasi email

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
    // Hanya menerima input angka dan harus diawali dengan 62
    if (value === '' || /^[0-9]+$/.test(value)) {
      let formattedValue = value;
      
      if (value.length === 1 && value !== '6') {
        formattedValue = '62' + value; // Menambahkan 62 jika hanya 1 digit
      } else if (value.length > 0 && !value.startsWith('62')) {
        formattedValue = '62' + value; // Menambahkan 62 jika tidak diawali dengan 62
      }

      // Menghilangkan angka 0 setelah 62
      if (formattedValue.startsWith('620')) {
        formattedValue = formattedValue.replace('620', '62'); // Menghapus 0 setelah 62
      }

      setWhatsapp(formattedValue);
      
      // Validasi dasar panjang nomor WhatsApp
      if (formattedValue === '') {
        setWhatsappError(null); // Reset error jika kosong
      } else {
        // Tambahkan debounce untuk pengecekan ketersediaan
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

  // Validasi langkah pertama (data pribadi)
  const validateStep1 = () => {
    return (
      name.trim() !== '' && 
      username.trim() !== '' && 
      !usernameError
    );
  };

  // Validasi langkah kedua (kontak)
  const validateStep2 = () => {
    return (
      email.trim() !== '' && 
      !emailError && 
      emailVerified && 
      whatsapp.trim() !== '' && 
      !whatsappError
    );
  };

  // Validasi langkah ketiga (password)
  const validateStep3 = () => {
    return (
      password.trim() !== '' && 
      confirmPassword.trim() !== '' && 
      !passwordError && 
      password === confirmPassword
    );
  };

  // Fungsi untuk pindah ke langkah berikutnya
  const goToNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  // Fungsi untuk kembali ke langkah sebelumnya
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

    // Pastikan email sudah diverifikasi
    if (!emailVerified) {
      setLoading(false);
      setError('Email harus diverifikasi terlebih dahulu.');
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
      email_verified: true,
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

  // Render indikator langkah
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
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
            {step < 3 && (
              <div className={`w-12 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto my-10 mt-24 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Daftar Akun Baru</h2>
      
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
        {/* Langkah 1: Data Pribadi */}
        {currentStep === 1 && (
          <div className="space-y-4">
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
            
            <button
              type="button"
              onClick={goToNextStep}
              disabled={!validateStep1()}
              className={`w-full p-3 rounded font-bold ${
                validateStep1() 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Lanjutkan
            </button>
          </div>
        )}
        
        {/* Langkah 2: Kontak dan Verifikasi */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  id="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={`flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    emailError ? 'border-red-500' : ''
                  } ${emailVerified ? 'bg-green-50 border-green-500' : ''}`}
                />
                
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={emailError || !email || sendingOtp || resendDisabled}
                    className={`whitespace-nowrap px-3 py-2 rounded font-bold ${
                      emailError || !email || sendingOtp || resendDisabled
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
                          : 'Verifikasi'}
                  </button>
                )}
              </div>
              
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
              
              {emailVerified && (
                <p className="text-xs text-green-500 mt-1">Email berhasil diverifikasi</p>
              )}
            </div>
            
            {/* Form OTP yang muncul setelah tombol verifikasi email ditekan */}
            {showOtpForm && !emailVerified && (
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
            
            <div className="mb-4">
              <label htmlFor="whatsapp" className="block text-gray-700 text-sm font-bold mb-2">
                Nomor WhatsApp
              </label>
              <input
                type="number"
                id="whatsapp"
                placeholder="Masukkan nomor WhatsApp"
                value={whatsapp}
                onChange={handleWhatsappChange}
                required
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  whatsappError ? 'border-red-500' : ''
                }`}
              />  
              <p className="text-sm text-gray-500 mt-1">
                Format: 628xxxxxxxxxx
              </p>
              {whatsappError && (
                <p className="text-xs text-red-500 mt-1">{whatsappError}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={goToPrevStep}
                className="w-1/3 p-3 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!validateStep2()}
                className={`w-2/3 p-3 rounded font-bold ${
                  validateStep2() 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}
        
        {/* Langkah 3: Password */}
        {currentStep === 3 && (
          <div className="space-y-4">
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
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={goToPrevStep}
                className="w-1/3 p-3 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleRegister}
                disabled={!validateStep3() || loading}
                className={`w-2/3 p-3 rounded font-bold ${
                  validateStep3() && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </div>
          </div>
        )}
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
