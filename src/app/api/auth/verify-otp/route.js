import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Inisialisasi Supabase client dengan kunci server
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email dan OTP diperlukan' },
        { status: 400 }
      );
    }

    // Verifikasi OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return NextResponse.json(
        { error: 'Kode OTP tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memverifikasi OTP' },
      { status: 500 }
    );
  }
} 