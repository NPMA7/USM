export default function InvoiceDetails({ transactionData, order_id }) {
  return (
    <div className="mt-4">
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <p className="font-semibold text-gray-600">Order ID:</p>
          <p className="text-gray-900">{order_id}</p>

          <p className="font-semibold text-gray-600">Nama:</p>
          <p className="text-gray-900">{transactionData.name}</p>

          <p className="font-semibold text-gray-600">Nama Tim:</p>
          <p className="text-gray-900">{transactionData.teamName} ({transactionData.tournament})</p>

          <p className="font-semibold text-gray-600">Email:</p>
          <p className="text-gray-900">{transactionData.email}</p>

          <p className="font-semibold text-gray-600">WhatsApp:</p>
          <p className="text-gray-900">{transactionData.whatsapp}</p>

          <p className="font-semibold text-gray-600">Status:</p>
          <p className="text-green-600 font-bold">{transactionData.transaction_status}</p>

          <p className="font-semibold text-gray-600">Total:</p>
          <p className="text-gray-900 font-bold">Rp {transactionData.gross_amount}</p>

          <p className="font-semibold text-gray-600">Pembayaran:</p>
          <p className="text-gray-900">{transactionData.payment_type}</p>

          <p className="font-semibold text-gray-600">Tanggal:</p>
          <p className="text-gray-900">{transactionData.transaction_time}</p>
        </div>
      </div>
    </div>
  );
} 