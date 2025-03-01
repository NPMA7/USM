"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useEffect, useState, Suspense } from "react";
import domtoimage from "dom-to-image";
import { supabase } from "@/lib/supabase";

import ErrorDisplay from "@/components/payment/ErrorDisplay";
import LoadingState from "@/components/payment/LoadingState";
import WarningBanner from "@/components/payment/WarningBanner";
import Invoice from "@/components/payment/Invoice";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const invoiceRef = useRef(null);
  
  // Ambil order_id dari URL
  const order_id = params.get("order_id");
  
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!order_id) {
        setError("Order ID tidak ditemukan");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('order_id', order_id)
          .single();

        if (error) {
          throw new Error("Tidak dapat menemukan data transaksi");
        }

        if (!data) {
          throw new Error("Data transaksi tidak ditemukan");
        }

        // Cek apakah invoice sudah kadaluarsa
        const createdAt = new Date(data.created_at);
        const now = new Date();
        const tenMinutes = 10 * 60 * 1000; // 10 menit dalam milidetik
      
        if (now - createdAt > tenMinutes) {
          setError("Invoice sudah tidak dapat dilihat setelah 10 menit.");
          setIsExpired(true);
          setIsLoading(false);
          return;
        }

        setTransactionData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil data transaksi");
        setIsLoading(false);
      }
    };

    fetchTransactionData();
  }, [order_id]);

  // Tambahkan useEffect untuk menghitung waktu tersisa
  useEffect(() => {
    if (!transactionData || !transactionData.created_at) return;
    
    const createdAt = new Date(transactionData.created_at);
    const tenMinutes = 10 * 60 * 1000; // 10 menit dalam milidetik
    const expiryTime = new Date(createdAt.getTime() + tenMinutes);
    
    const updateTimeLeft = () => {
      const now = new Date();
      const diff = expiryTime - now;
      
      if (diff <= 0) {
        setTimeLeft("Invoice sudah tidak tersedia");
        setIsExpired(true);
        setError("Invoice sudah tidak dapat dilihat setelah 10 menit.");
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };
    
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [transactionData]);

  const downloadInvoice = () => {
    if (!invoiceRef.current) return;

    domtoimage.toPng(invoiceRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `invoice-${order_id}.png`;
        link.click();
      })
      .catch((error) => {});
  };

  if (isExpired || error) {
    return <ErrorDisplay error={error || "Invoice sudah tidak dapat dilihat setelah 10 menit."} />;
  }

  if (isLoading || !transactionData) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col mt-16 items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <WarningBanner />
      
      {/* Tampilkan timer di atas invoice */}
      {timeLeft && (
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium mb-4 shadow-sm">
          Tersisa: {timeLeft}
        </div>
      )}
      
      <Invoice 
        transactionData={transactionData} 
        order_id={order_id} 
        invoiceRef={invoiceRef} 
        downloadInvoice={downloadInvoice} 
      />
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
