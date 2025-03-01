'use client'
import { useState } from "react";
import TournamentCard from "@/components/TournamentCard";
import RegistrationForm from "@/components/RegistrationForm";
import ConfirmationModal from "@/components/ConfirmationModal";
import SuccessModal from "@/components/SuccessModal";
import useMidtrans from "@/hooks/useMidtrans";

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

  const handleTournamentSelect = (tournamentType) => {
    setTournament(tournamentType);
    setAmount(tournamentType === "MobileLegend" ? 35000 : 25000);
    setShowForm(true);
  };

  const isFormValid = () => {
    return name.trim() !== "" && 
           email.trim() !== "" && 
           whatsapp.trim() !== "" && 
           teamName.trim() !== "";
  };

  const openSnapPopup = (token) => {
    if (!token) {
      setIsLoading(false);
      setProcessingPayment(false);
      return;
    }

    if (!window.snap) {
      alert("Midtrans belum siap, silakan coba lagi.");
      setIsLoading(false);
      setProcessingPayment(false);
      return;
    }
    
    window.snap.pay(token, {
      onSuccess: async function (result) {
        setProcessingPayment(false);
        setPreparingInvoice(true);
        
        try {
          await fetch("/api/save-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
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
              teamName,
            }),
          });

          window.location.href = `/payment-success?order_id=${result.order_id}`;
        } catch (error) {
          setPreparingInvoice(false);
          alert("Terjadi kesalahan saat menyiapkan invoice. Silakan coba lagi.");
        }
      },
      onPending: function (result) {
        setShowCancelModal(true);
        setIsLoading(false);
      },
      onError: function (result) {
        alert("Pembayaran gagal.");
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
          setShowSuccessModal(true);
          setProcessingPayment(false);
        }
        
      } catch (error) {
        setSuccessMessage("Error saat membatalkan transaksi");
        setShowSuccessModal(true);
        setProcessingPayment(false);
      }
    }
    
    setShowCancelModal(false);
    setIsLoading(false);
  };

  const handleCancelDismiss = () => {
    setShowCancelModal(false);
    if (snapToken) {
      openSnapPopup(snapToken);
    } else {
      setIsLoading(false);
      setProcessingPayment(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">Turnamen Gaming USM</h1>
        <p className="text-center text-gray-600 mb-12">Pilih turnamen yang ingin kamu ikuti dan mulai perjalananmu!</p>

        <div className="grid md:grid-cols-2 gap-8">
          <TournamentCard 
            title="Mobile Legends" 
            price={35000} 
            image="https://i.pinimg.com/originals/ec/fe/91/ecfe91596fffa8eefc1860de6b8d92bd.jpg" 
            onSelect={handleTournamentSelect}
            type="MobileLegend"
          />
          
          <TournamentCard 
            title="Free Fire" 
            price={25000} 
            image="https://wallpapers.com/images/hd/free-fire-banner-with-complete-cast-5vfv6tj9bc7x37rw.jpg" 
            onSelect={handleTournamentSelect}
            type="FreeFire"
          />
        </div>

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
            onClose={() => setShowForm(false)}
          />
        )}

        {showCancelModal && (
          <ConfirmationModal 
            onConfirm={handleCancelConfirm}
            onDismiss={handleCancelDismiss}
          />
        )}

        {showSuccessModal && (
          <SuccessModal 
            message={successMessage}
            onClose={closeSuccessModal}
          />
        )}
      </div>
    </div>
  );
}