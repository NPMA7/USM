import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    // Konfigurasi Midtrans Core API
    let core = new midtransClient.CoreApi({
      isProduction: false, // Ubah ke true jika live
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    // Batalkan transaksi di Midtrans
    const response = await core.transaction.cancel(orderId);

    return NextResponse.json({ 
      success: true, 
      message: "Transaksi berhasil dibatalkan",
      data: response
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 