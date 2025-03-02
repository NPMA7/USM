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
  const [isLoading, setIsLoading] = useState(true);

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

        setTransactionData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil data transaksi");
        setIsLoading(false);
      }
    };

    fetchTransactionData();
  }, [order_id]);

  const downloadInvoice = () => {
    if (!invoiceRef.current) return;

    domtoimage.toPng(invoiceRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `invoice-${order_id}.png`;
        link.click();
      })
      .catch((error) => {
        console.error("Error generating invoice image:", error);
      });
  };

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (isLoading || !transactionData) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col mt-16 items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <WarningBanner />
      
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
