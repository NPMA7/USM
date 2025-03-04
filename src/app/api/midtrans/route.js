import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase client menggunakan kunci anonim yang tersedia
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    // Ambil data dari request body
    const { orderId, amount, name, email, whatsapp, tournament, teamName, userEmail } = await req.json();

    // Cek apakah pengguna sudah mendaftar untuk turnamen ini
    if (userEmail) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('email', userEmail)
        .eq('tournament_name', tournament);
      
      if (error) {
        throw new Error(`Error checking registration: ${error.message}`);
      }
      
      if (data && data.length > 0) {
        return NextResponse.json(
          { error: "Anda sudah mendaftarkan tim untuk turnamen ini" },
          { status: 400 }
        );
      }
    }

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
      ],
      team_name: teamName, // Menyimpan nama tim
    };

    // Buat transaksi di Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Kirim token transaksi ke frontend
    return NextResponse.json({ token: transaction.token, tournament });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
