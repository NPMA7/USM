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

export default function Home() {
  const { snapLoaded } = useMidtrans();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tournament, setTournament] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState(0);
  const [teamName, setTeamName] = useState("");
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

  const handleTournamentSelect = (tournamentType) => {
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
        .eq('tournament', tournament);
      
      if (error) {
        console.error('Error checking WhatsApp availability:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setWhatsappError("Nomor WhatsApp ini sudah terdaftar untuk turnamen ini");
      } else {
        setWhatsappError("");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Fungsi untuk memeriksa ketersediaan email
  const checkEmailAvailability = async (emailAddress) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('email', emailAddress)
        .eq('tournament', tournament);
      
      if (error) {
        console.error('Error checking email availability:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setEmailError("Email ini sudah terdaftar untuk turnamen ini");
      } else {
        setEmailError("");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isFormValid = () => {
    return name.trim() !== "" && 
           email.trim() !== "" && 
           whatsapp.trim() !== "" && 
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
          const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' '); // Format menjadi YYYY-MM-DD HH:MM:SS
          const { data, error } = await supabase
            .from('transactions')
            .insert([
              {
                order_id: result.order_id,
                status_code: result.status_code,
                transaction_status: result.transaction_status,
                gross_amount: result.gross_amount,
                payment_type: result.payment_type,
                fraud_status: result.fraud_status,
                transaction_time: result.transaction_time,
                name,
                email,
                whatsapp,
                tournament,
                team_name: teamName,
                created_at: formattedTime,
              }
            ])
            .select('*');

          if (error) {
            console.error('Error inserting into Supabase:', error);
            alert('Terjadi kesalahan saat menyimpan transaksi ke database.');
            setPreparingInvoice(false);
          } else {
            // Tambahkan jumlah tim hanya setelah transaksi berhasil
            setRegisteredTeams(prev => ({
              ...prev,
              [tournament]: prev[tournament] + 1,
            }));
            
            // Tambahkan parameter waktu ke URL untuk memastikan konsistensi
            window.location.href = `/payment-success?order_id=${result.order_id}`;
          }
        } catch (error) {
          console.error('Error in transaction processing:', error);
          setPreparingInvoice(false);
          alert('Terjadi kesalahan saat menyiapkan invoice. Silakan coba lagi.');
        }
      },
      onPending: function (result) {
        setShowCancelModal(true);
        setIsLoading(false);
      },
      onError: function (result) {
        alert('Pembayaran gagal.');
        setIsLoading(false);
        setProcessingPayment(false);
      },
      onClose: function () {
        setShowCancelModal(true);
      }
    });
  };

  const handlePayment = async () => {
    if (!snapLoaded) {
      alert("Midtrans belum siap, silakan coba lagi.");
      return;
    }

    if (!isFormValid()) {
      alert("Mohon lengkapi semua data terlebih dahulu.");
      return;
    }
    
    setIsLoading(true);
    setProcessingPayment(true);
    const newOrderId = `ORDER-${Date.now()}`;
    setOrderId(newOrderId);

    try {
      const response = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId: newOrderId, 
          amount, 
          name, 
          email, 
          whatsapp, 
          tournament, 
          teamName 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.token) {
        setSnapToken(data.token);
        setTimeout(() => {
          openSnapPopup(data.token);
          setIsLoading(false);
        }, 100);
      } else {
        throw new Error("Tidak mendapatkan token dari server");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      setIsLoading(false);
      setProcessingPayment(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (orderId) {
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

  // Fungsi untuk menangani pembatalan pembayaran
  const handleCancelPayment = async () => {
    // Logika pembatalan pembayaran
    // ...
    setShowConfirmationModal(false);
  };

  // Mengambil data jumlah tim terdaftar dari Supabase saat komponen dimuat
  useEffect(() => {
    const fetchRegisteredTeams = async () => {
      setIsLoadingTeams(true); // Set loading menjadi true saat mulai fetch
      try {
        // Ambil jumlah tim Mobile Legend
        const { count: mlCount, error: mlError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('tournament', 'MobileLegend');
        
        // Ambil jumlah tim Free Fire
        const { count: ffCount, error: ffError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('tournament', 'FreeFire');
        
        if (mlError || ffError) {
          console.error('Error mengambil data tim:', mlError || ffError);
          return;
        }
        
        // Update state dengan jumlah tim dari database
        setRegisteredTeams({
          MobileLegend: mlCount || 0,
          FreeFire: ffCount || 0
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingTeams(false); // Set loading menjadi false setelah selesai
      }
    };
    
    fetchRegisteredTeams();
  }, []);

  // Tambahkan fungsi resetForm
  const resetForm = () => {
    setName("");
    setEmail("");
    setWhatsapp("");
    setTeamName("");
    setWhatsappError("");
    setEmailError("");
  };

  // Perbarui fungsi untuk menutup form
  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
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
          handlePayment={handlePayment}
          isFormValid={isFormValid}
          isLoading={isLoading}
          processingPayment={processingPayment}
          preparingInvoice={preparingInvoice}
          onClose={handleCloseForm}
          whatsappError={whatsappError}
          checkWhatsappAvailability={checkWhatsappAvailability}
          emailError={emailError}
          checkEmailAvailability={checkEmailAvailability}
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
          onDismiss={() => setShowConfirmationModal(false)}
          isLoading={isLoading}
          isLoadingDismiss={false}
        />
      )}

    </div>
  );
}