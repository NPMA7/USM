import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import midtransClient from "midtrans-client";

export async function GET(req) {
  try {
    let databaseStatus = "Tidak Terhubung";
    let midtransStatus = "Tidak Terhubung";
    let message = "";

    // Cek koneksi Supabase
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .limit(1);

      if (!error) {
        databaseStatus = "Terhubung";
      } else {
        message += "Gagal terhubung ke database. ";
      }
    } catch (err) {
      message += "Error saat mengecek database: " + err.message + ". ";
    }

    // Cek koneksi Midtrans
    try {
      const core = new midtransClient.CoreApi({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      await core.transaction.status("test-connection");
      midtransStatus = "Terhubung";
    } catch (err) {
      message += "Error saat mengecek Midtrans: " + err.message + ". ";
    }

    return NextResponse.json({
      success: true,
      message: message || "Pengecekan koneksi selesai",
      status: {
        database: databaseStatus,
        midtrans: midtransStatus
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan saat mengecek koneksi",
      error: error.message
    }, { status: 500 });
  }
}