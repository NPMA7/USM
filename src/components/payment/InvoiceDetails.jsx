export default function InvoiceDetails({ transactionData, order_id }) {
  return (
    <div className="mt-4">
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm w-md mx-auto">
        <div className="grid grid-cols-2 gap-2">
          <p className="font-semibold text-gray-600 flex justify-between w-full">Order ID <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{order_id}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">Nama <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{transactionData.name}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">Nama Tim <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{transactionData.team_name}</p>
          
          <p className="font-semibold text-gray-600 flex justify-between w-full">Divisi Turnamen <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{transactionData.tournament}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">Email <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{transactionData.email}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">WhatsApp <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{transactionData.whatsapp}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">Status <span>:</span></p>
          <p className="text-green-600 font-bold overflow-hidden text-ellipsis">{transactionData.transaction_status}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">Total <span>:</span></p>
          <p className="text-gray-900 font-bold overflow-hidden text-ellipsis">Rp {transactionData.gross_amount}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">Pembayaran <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{transactionData.payment_type}</p>

          <p className="font-semibold text-gray-600 flex justify-between w-full">Tanggal <span>:</span></p>
          <p className="text-gray-900 break-words overflow-hidden text-ellipsis">{transactionData.transaction_time}</p>
        </div>
      </div>
    </div>
  );
} 