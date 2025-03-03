'use client'
import { useState, useEffect } from "react";
import TournamentCard from "@/components/TournamentCard";
import RegistrationForm from "@/components/RegistrationForm";
import ConfirmationModal from "@/components/ConfirmationModal";
import SuccessModal from "@/components/SuccessModal";
import useMidtrans from "@/hooks/useMidtrans";
import Image from "next/image";
import FAQ from "@/components/FAQ";
import InfoSection from "@/components/InfoSection";
import { supabase } from "@/lib/supabase"; // Mengimpor supabase dari lib
import { useTeams } from "@/context/TeamContext";
import { useRouter } from "next/navigation";
import SessionExpiredModal from '@/components/SessionExpiredModal';

export default function Home() {
  const router = useRouter();
  const { snapLoaded } = useMidtrans();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tournament, setTournament] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [captainNickname, setCaptainNickname] = useState("");
  const [captainGameId, setCaptainGameId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [snapToken, setSnapToken] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [preparingInvoice, setPreparingInvoice] = useState(false);
  const [registeredTeams, setRegisteredTeams] = useState({
    MobileLegend: 0,
    FreeFire: 0,
  });
  const totalTeams = 128; // Total tim yang bisa mendaftar
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoadingDismiss, setIsLoadingDismiss] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");
  const [emailError, setEmailError] = useState("");
  const { updateRegisteredTeams } = useTeams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [teamData, setTeamData] = useState(null);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // Cek status login pengguna
  useEffect(() => {
    const checkLoginStatus = () => {
      const user = localStorage.getItem('user');
      const loginTime = localStorage.getItem('loginTime');
      
      if (user) {
        const parsedUser = JSON.parse(user);
        
        // Cek waktu login
        if (loginTime) {
          const currentTime = new Date().getTime();
          const oneHour = 60 * 60 * 1000; // 1 jam dalam milidetik
          
          if (currentTime - parseInt(loginTime) > oneHour) {
            // Logout otomatis jika sudah lebih dari 1 jam
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            setShowSessionExpiredModal(true);
            setIsLoggedIn(false);
            setUserData(null);
            return;
          }
        }
        
        setIsLoggedIn(true);
        setUserData(parsedUser);
        // Pre-fill form dengan data pengguna
        setName(parsedUser.name || "");
        setEmail(parsedUser.email || "");
        setWhatsapp(parsedUser.whatsapp || "");
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkLoginStatus();
  }, []);

  const handleTournamentSelect = async (tournamentType) => {
    // Cek apakah pengguna sudah login
    if (!isLoggedIn) {
      // Simpan jenis turnamen yang dipilih ke localStorage
      localStorage.setItem('selectedTournament', tournamentType);
      // Redirect ke halaman login
      router.push('/auth/login');
      return;
    }

    // Cek apakah pengguna sudah mendaftar untuk turnamen ini
    const alreadyRegistered = await checkUserRegistration(userData, tournamentType);
    
    if (alreadyRegistered) {
      alert("Anda sudah mendaftarkan tim untuk turnamen ini. Satu pengguna hanya dapat mendaftarkan satu tim per turnamen.");
      return;
    }

    setTournament(tournamentType);
    setAmount(tournamentType === "MobileLegend" ? 35000 : 25000);
    setShowForm(true);
  };

  // Fungsi untuk memeriksa ketersediaan nomor WhatsApp
  const checkWhatsappAvailability = async (number) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('whatsapp', number)
        .eq('tournament', tournament)
        .eq('transaction_status', 'settlement'); // Hanya cek yang sudah settlement
      
      if (error) {
        return;
      }
      
      if (data && data.length > 0) {
        setWhatsappError("Nomor WhatsApp ini sudah terdaftar untuk turnamen ini");
      } else {
        setWhatsappError("");
      }
    } catch (error) {
      // Handle error
    }
  };

  // Fungsi untuk memeriksa ketersediaan email
  const checkEmailAvailability = async (emailAddress) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('email', emailAddress)
        .eq('tournament', tournament)
        .eq('transaction_status', 'settlement'); // Hanya cek yang sudah settlement
      
      if (error) {
        return;
      }
      
      if (data && data.length > 0) {
        setEmailError("Email ini sudah terdaftar untuk turnamen ini");
      } else {
        setEmailError("");
      }
    } catch (error) {
      // Handle error
    }
  };

  const isFormValid = () => {
    return name.trim() !== "" && 
           email.trim() !== "" && 
           whatsapp.trim() !== "" && 
           whatsapp.length >= 10 &&
           teamName.trim() !== "" && 
           !whatsappError &&
           !emailError;
  };

  const openSnapPopup = (token) => {
    if (!token) {
      setIsLoading(false);
      setProcessingPayment(false);
      return;
    }
  
    if (!window.snap) {
      alert('Midtrans belum siap, silakan coba lagi.');
      setIsLoading(false);
      setProcessingPayment(false);
      return;
    }
    
    window.snap.pay(token, {
      onSuccess: async function (result) {
        setProcessingPayment(false);
        setPreparingInvoice(true);
        
        try {
          // Simpan ke Supabase dengan waktu saat ini
          const currentTime = new Date();
          currentTime.setHours(currentTime.getHours() + 7); // Menambahkan 7 jam untuk waktu Indonesia
          const formattedTime = currentTime.toISOString(); // Gunakan format ISO untuk timestamp
          
          // Sesuaikan data transaksi dengan struktur tabel yang ada
          const transactionData = {
            order_id: result.order_id,
            status_code: result.status_code,
            transaction_status: result.transaction_status,
            gross_amount: result.gross_amount,
            payment_type: result.payment_type,
            fraud_status: result.fraud_status || 'none',
            transaction_time: result.transaction_time || formattedTime,
            name,
            email,
            whatsapp,
            tournament,
            team_name: teamName,
            created_at: formattedTime
          };
          
          const { data, error } = await supabase
            .from('transactions')
            .insert([transactionData])
            .select();
            
          if (error) {
            throw new Error(`Gagal menyimpan transaksi: ${error.message}`);
          }
          
          // Ambil data tim dari localStorage
          const savedTeamData = localStorage.getItem('teamData');
          
          if (savedTeamData) {
            const parsedTeamData = JSON.parse(savedTeamData);
            
            if (parsedTeamData.captainNickname && parsedTeamData.captainGameId) {
              const teamDetailsData = {
                order_id: result.order_id,
                team_name: teamName,
                captain_nickname: parsedTeamData.captainNickname,
                captain_game_id: parsedTeamData.captainGameId,
                email: email,
                tournament: tournament,
                created_at: formattedTime
              };
              
              // Simpan data kapten ke tabel team_details
              const { error: teamError } = await supabase
                .from('team_details')
                .insert([teamDetailsData]);
                
              if (teamError) {
                // Handle error
              } else {
                // Hapus data tim dari localStorage setelah berhasil disimpan
                localStorage.removeItem('teamData');
              }
            } else {
              // Handle incomplete captain data
            }
          } else {
            // Handle missing team data
          }
          
          // Arahkan ke halaman sukses dengan order ID
          router.push(`/payment-success?order_id=${result.order_id}`);
        } catch (error) {
          setPreparingInvoice(false);
          alert(`Terjadi kesalahan saat menyimpan transaksi: ${error.message}. Silakan hubungi admin dengan bukti pembayaran Anda.`);
        }
      },
      onPending: function(result) {
        setProcessingPayment(false);
        setShowConfirmationModal(true);
      },
      onError: function(result) {
        setProcessingPayment(false);
        alert("Pembayaran gagal! Silakan coba lagi.");
      },
      onClose: function() {
        setProcessingPayment(false);
        setShowCancelModal(true);
      }
    });
  };

  const handlePayment = async (teamDetails) => {
    if (!isFormValid()) return;

    // Simpan data tim ke state dan localStorage
    setTeamData(teamDetails);
    localStorage.setItem('teamData', JSON.stringify(teamDetails));
    
    // Simpan juga ke state terpisah untuk keamanan
    setCaptainNickname(teamDetails.captainNickname);
    setCaptainGameId(teamDetails.captainGameId);

    setIsLoading(true);
    setPreparingInvoice(true);
    setError("");

    try {
      // Buat ID pesanan unik
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 1000);
      const newOrderId = `ORDER-${timestamp}-${randomNum}`;
      setOrderId(newOrderId);

      // Kirim data ke API untuk mendapatkan token Midtrans
      const response = await fetch("/api/midtrans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: newOrderId,
          amount,
          name,
          email,
          whatsapp,
          tournament,
          teamName,
          userEmail: userData?.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSnapToken(data.token);
        setPreparingInvoice(false);
        setProcessingPayment(true);

        // Buka Snap untuk pembayaran
        if (window.snap && data.token) {
          openSnapPopup(data.token);
        } else {
          setError("Terjadi kesalahan saat memuat pembayaran. Silakan coba lagi.");
          setIsLoading(false);
          setProcessingPayment(false);
        }
      } else {
        setError(data.error || "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
        setIsLoading(false);
        setProcessingPayment(false);
        setPreparingInvoice(false);
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
      setIsLoading(false);
      setProcessingPayment(false);
      setPreparingInvoice(false);
    }
  };

  // Fungsi untuk menangani konfirmasi pembatalan pembayaran
  const handleCancelPayment = async (confirmed) => {
    setShowConfirmationModal(false);
    
    if (confirmed) {
      // Jika pengguna mengkonfirmasi pembatalan
      setIsCancelLoading(true);
      try {
        // Lakukan pembatalan transaksi jika diperlukan
        const response = await fetch("/api/cancel-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setSuccessMessage("Transaksi berhasil dibatalkan");
        } else {
          setSuccessMessage("Transaksi gagal dibatalkan, tetapi Anda dapat mencoba lagi nanti");
        }
        
        // Reset form dan state
        resetForm();
        setShowForm(false);
        setShowSuccessModal(true);
      } catch (error) {
        setSuccessMessage("Terjadi kesalahan saat membatalkan transaksi");
        setShowSuccessModal(true);
      } finally {
        setIsCancelLoading(false);
        setIsLoading(false);
        setProcessingPayment(false);
      }
    } else {
      // Jika pengguna ingin melanjutkan pembayaran
      if (snapToken) {
        // Buka kembali popup pembayaran
        openSnapPopup(snapToken);
      } else {
        setIsLoading(false);
        setProcessingPayment(false);
      }
    }
  };

  const handleCancelConfirm = async (confirmed) => {
    if (confirmed) {
      setIsCancelLoading(true);
      try {
        const response = await fetch("/api/cancel-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setSuccessMessage("Transaksi berhasil dibatalkan");
          setShowSuccessModal(true);
          
          setName("");
          setEmail("");
          setWhatsapp("");
          setTeamName("");
          setShowForm(false);
          setProcessingPayment(false);
        } else {
          setSuccessMessage("Transaksi gagal dibatalkan");
          setShowSuccessModal(true);
          setProcessingPayment(false);
        }
        
      } catch (error) {
        setSuccessMessage("Error saat membatalkan transaksi");
        setShowSuccessModal(true);
        setProcessingPayment(false);
      } finally {
        setIsCancelLoading(false);
        setShowCancelModal(false);
        setIsLoading(false);
      }
    } else {
      setShowCancelModal(false);
      setIsLoading(false);
    }
  };

  const handleCancelDismiss = () => {
    setIsLoadingDismiss(true);
    
    setTimeout(() => {
      setShowCancelModal(false);
      
      if (snapToken) {
        openSnapPopup(snapToken);
      } else {
        setIsLoading(false);
        setProcessingPayment(false);
      }
      
      setIsLoadingDismiss(false);
    }, 500);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // Mengambil data jumlah tim terdaftar dari Supabase saat komponen dimuat
  useEffect(() => {
    const fetchRegisteredTeams = async () => {
      setIsLoadingTeams(true); // Set loading menjadi true saat mulai fetch
      try {
        // Ambil jumlah tim Mobile Legend yang sudah settlement
        const { count: mlCount, error: mlError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('tournament', 'MobileLegend')
          .eq('transaction_status', 'settlement'); // Hanya hitung yang sudah settlement
        
        // Ambil jumlah tim Free Fire yang sudah settlement
        const { count: ffCount, error: ffError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('tournament', 'FreeFire')
          .eq('transaction_status', 'settlement'); // Hanya hitung yang sudah settlement
        
        if (mlError || ffError) {
          return;
        }
        
        // Update state dengan jumlah tim dari database
        setRegisteredTeams({
          MobileLegend: mlCount || 0,
          FreeFire: ffCount || 0
        });
      } catch (error) {
        // Handle error
      } finally {
        setIsLoadingTeams(false); // Set loading menjadi false setelah selesai
      }
    };
    
    fetchRegisteredTeams();
  }, []);

  // Tambahkan fungsi resetForm
  const resetForm = () => {
    setName(userData?.name || "");
    setEmail(userData?.email || "");
    setWhatsapp(userData?.whatsapp || "");
    setTeamName("");
    setWhatsappError("");
    setEmailError("");
  };

  // Perbarui fungsi untuk menutup form
  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handlePaymentSuccess = (tournament) => {
    // Logika untuk menangani pembayaran yang berhasil
    updateRegisteredTeams(tournament);
  };

  useEffect(() => {
    const fetchRegisteredTeams = async () => {
      try {
        // Ambil jumlah tim Mobile Legend yang sudah settlement
        const { count: mlCount, error: mlError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('tournament', 'MobileLegend')
          .eq('transaction_status', 'settlement'); // Hanya hitung yang sudah settlement

        // Ambil jumlah tim Free Fire yang sudah settlement
        const { count: ffCount, error: ffError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('tournament', 'FreeFire')
          .eq('transaction_status', 'settlement'); // Hanya hitung yang sudah settlement

        if (mlError || ffError) {
          return;
        }

        // Update state dengan jumlah tim dari database
        updateRegisteredTeams('MobileLegend', mlCount || 0);
        updateRegisteredTeams('FreeFire', ffCount || 0);
      } catch (error) {
        // Handle error
      }
    };

    fetchRegisteredTeams();
  }, [updateRegisteredTeams]);

  // Fungsi untuk memeriksa apakah pengguna sudah mendaftar untuk turnamen tertentu
  const checkUserRegistration = async (userData, tournamentType) => {
    try {
      // Gunakan email sebagai pengenal unik untuk pengguna
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('email', userData.email)
        .eq('tournament', tournamentType)
        .eq('transaction_status', 'settlement'); // Hanya cek yang sudah settlement
      
      if (error) {
        return false;
      }
      
      // Jika data ditemukan, berarti pengguna sudah mendaftar
      return data && data.length > 0;
    } catch (error) {
      return false;
    }
  };

  // Ganti dengan useEffect yang hanya menghapus selectedTournament dari localStorage
  useEffect(() => {
    if (isLoggedIn) {
      // Hapus dari localStorage jika ada, tapi tidak otomatis memilih turnamen
      localStorage.removeItem('selectedTournament');
    }
  }, [isLoggedIn]);

  // Tambahkan handler untuk menutup modal
  const handleCloseSessionModal = () => {
    setShowSessionExpiredModal(false);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500">
      {/* Hero Section */}
      <div id="home" className="relative h-[100vh] flex items-center justify-center overflow-hidden pt-16 bg-blue-800">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/gaming-banner.webp" 
            alt="Gaming Tournament Banner"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            TURNAMEN GAMING <span className="text-yellow-400">USM</span>
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-md">
            Tunjukkan kemampuanmu dan jadilah juara dalam turnamen gaming terbesar di USM!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => document.getElementById('tournaments').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
            >
              Daftar Sekarang
            </button>
            <button 
              onClick={() => document.getElementById('info').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300"
            >
              Info Turnamen
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <InfoSection />

      {/* Tournament Section */}
      <div id="tournaments" className="py-16 bg-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">Pilih Turnamen</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Pilih turnamen yang ingin kamu ikuti dan mulai perjalananmu menuju kemenangan!
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <TournamentCard 
              title="Mobile Legends" 
              price={35000} 
              image="https://i.pinimg.com/originals/ec/fe/91/ecfe91596fffa8eefc1860de6b8d92bd.jpg" 
              onSelect={handleTournamentSelect}
              type="MobileLegend"
              description="Turnamen 5v5 MOBA terpopuler dengan format Best of 3 untuk babak penyisihan dan Best of 5 untuk grand final."
              registeredTeams={registeredTeams.MobileLegend}
              isLoading={isLoadingTeams}
            />
            
            <TournamentCard 
              title="Free Fire" 
              price={25000} 
              image="https://wallpapers.com/images/hd/free-fire-banner-with-complete-cast-5vfv6tj9bc7x37rw.jpg" 
              onSelect={handleTournamentSelect}
              type="FreeFire"
              description="Turnamen battle royale dengan 4 orang per tim. Poin dihitung berdasarkan peringkat dan jumlah kill."
              registeredTeams={registeredTeams.FreeFire}
              isLoading={isLoadingTeams}
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-100">
        <FAQ />
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Untuk Bertanding?</h2>
          <p className="mb-8 text-blue-200">
            Jangan lewatkan kesempatan untuk menunjukkan skill gaming terbaikmu dan menangkan hadiah menarik!
          </p>
          <button 
            onClick={() => document.getElementById('tournaments').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <RegistrationForm 
          tournament={tournament}
          amount={amount}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
          teamName={teamName}
          setTeamName={setTeamName}
          captainNickname={captainNickname}
          setCaptainNickname={setCaptainNickname}
          captainGameId={captainGameId}
          setCaptainGameId={setCaptainGameId}
          handlePayment={handlePayment}
          isFormValid={isFormValid}
          isLoading={isLoading}
          processingPayment={processingPayment}
          preparingInvoice={preparingInvoice}
          onClose={handleCloseForm}
          whatsappError={whatsappError}
          setWhatsappError={setWhatsappError}
          emailError={emailError}
          setEmailError={setEmailError}
          checkWhatsappAvailability={checkWhatsappAvailability}
          checkEmailAvailability={checkEmailAvailability}
          isLoggedIn={isLoggedIn}
          userData={userData}
          error={error}
        />
      )}

      {showCancelModal && (
        <ConfirmationModal 
          onConfirm={handleCancelConfirm}
          onDismiss={handleCancelDismiss}
          isLoading={isCancelLoading}
          isLoadingDismiss={isLoadingDismiss}
        />
      )}

      {showSuccessModal && (
        <SuccessModal 
          message={successMessage}
          onClose={closeSuccessModal}
        />
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          onConfirm={handleCancelPayment}
          onDismiss={() => handleCancelPayment(false)}
          isLoading={isCancelLoading}
          isLoadingDismiss={isLoadingDismiss}
        />
      )}

      {showSessionExpiredModal && (
        <SessionExpiredModal onClose={handleCloseSessionModal} />
      )}

    </div>
  );
}