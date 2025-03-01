import { useState, useEffect } from "react";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceDetails from "./InvoiceDetails";
import ActionButtons from "./ActionButtons";

export default function Invoice({ transactionData, order_id, invoiceRef, downloadInvoice }) {
  if (!transactionData) {
    return <p className="text-center text-red-500 font-medium">Data invoice tidak ditemukan.</p>;
  }

  // Pastikan created_at ada sebelum mencoba menggunakannya
  if (!transactionData.created_at) {
    console.error("Missing created_at in transaction data:", transactionData);
    return <p className="text-center text-red-500 font-medium">Data invoice tidak lengkap.</p>;
  }

  // Konversi created_at ke waktu lokal untuk pengecekan kadaluarsa
  const createdAt = new Date(transactionData.created_at);
  const now = new Date();
  const tenMinutes = 10 * 60 * 1000; // 10 menit dalam milidetik

  if (now - createdAt > tenMinutes) {
    return "Invoice sudah tidak dapat dilihat setelah 10 menit." ;
  }

  return (
      <div
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg border border-gray-300 relative"
        ref={invoiceRef}
      >
        <div className="flex flex-col items-center">
          <InvoiceHeader tournament={transactionData.tournament} />
          <InvoiceDetails transactionData={transactionData} order_id={order_id} />
          <ActionButtons downloadInvoice={downloadInvoice} />

          <p className="text-gray-400 text-xs text-center mt-4">
            &copy; 2025 U-StadyMate. All Rights Reserved.
          </p>
        </div>
      </div>
  );
}