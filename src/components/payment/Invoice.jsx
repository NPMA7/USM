import InvoiceHeader from "./InvoiceHeader";
import InvoiceDetails from "./InvoiceDetails";
import ActionButtons from "./ActionButtons";

export default function Invoice({ transactionData, order_id, invoiceRef, downloadInvoice }) {
  return (
    <div
      className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg border border-gray-300 relative"
      ref={invoiceRef}
    >
      <InvoiceHeader tournament={transactionData.tournament} />
      <InvoiceDetails transactionData={transactionData} order_id={order_id} />
      <ActionButtons downloadInvoice={downloadInvoice} />

      <p className="text-gray-400 text-xs text-center mt-4">
        &copy; 2025 U-StadyMate. All Rights Reserved.
      </p>
    </div>
  );
} 