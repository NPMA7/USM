"use client";

import { useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import domtoimage from "dom-to-image";

import ErrorDisplay from "@/components/payment/ErrorDisplay";
import LoadingState from "@/components/payment/LoadingState";
import WarningBanner from "@/components/payment/WarningBanner";
import Invoice from "@/components/payment/Invoice";

export default function PaymentSuccess() {
  const params = useSearchParams();
  const invoiceRef = useRef(null);
  
  // Ambil order_id dari URL
  const order_id = params.get("order_id");
  
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (order_id) {
        try {
          const response = await fetch(`/api/save-transaction?order_id=${order_id}`);
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }

          const data = await response.json();
          setTransactionData(data);
        } catch (err) {
          setError(err.message);
        }
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
      .catch((error) => {});
  };

  if (error) return <ErrorDisplay error={error} />;

  if (!transactionData) return <LoadingState />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
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
