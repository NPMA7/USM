import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Ambil data dari request body
    const { orderId, amount, name, email, whatsapp, tournament, teamName } = await req.json();

    // Konfigurasi Midtrans
    let snap = new midtransClient.Snap({
      isProduction: false, // Ubah ke true jika live
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Parameter transaksi ke Midtrans
    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: `${name}`,
        email: email,
        phone: whatsapp,
        billing_address: {
          address: `${teamName} (${tournament})`,
        },
      },
      item_details: [
        {
          id: tournament,
          price: parseInt(amount),
          quantity: 1,
          name: teamName,
        },
    ]};

    // Buat transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Kirim token transaksi ke frontend
    return NextResponse.json({ token: transaction.token, tournament });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
