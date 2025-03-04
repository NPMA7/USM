import { supabase } from '@/lib/supabase'; // Menggunakan yang sudah ada di lib
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


export async function POST(req) {
  try {
    const { email, purpose } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email diperlukan' },
        { status: 400 }
      );
    }

    // Untuk reset password, gunakan Service Role Key
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Jika purpose adalah reset_password, gunakan metode resetPasswordForEmail
    if (purpose === 'reset_password') {
      
      // Periksa apakah email terdaftar
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email);

      if (checkError) {
        return NextResponse.json(
          { error: 'Gagal memeriksa ketersediaan email' },
          { status: 500 }
        );
      }

      if (!existingUser || existingUser.length === 0) {
        return NextResponse.json(
          { error: 'Email tidak terdaftar' },
          { status: 400 }
        );
      }

      // Kirim email reset password menggunakan Supabase Auth dengan admin privileges
      const { data, error } = await adminSupabase.auth.resetPasswordForEmail(email);

      if (error) {
        
        // Periksa apakah error terkait rate limit
        if (error.message && (
            error.message.includes('rate limit') || 
            error.message.includes('too many requests') ||
            error.message.includes('too many emails')
          ) || 
          (error.code === 'over_email_send_rate_limit') ||
          (error.status === 429)) {
          return NextResponse.json(
            { error: 'Terlalu banyak permintaan. Mohon tunggu 15-30 menit sebelum mencoba lagi.' },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Email reset password telah dikirim ke email Anda',
      });
    } 
    // Jika purpose adalah verification, gunakan metode signInWithOtp
    else if (purpose === 'verification') {
      
      // Periksa apakah email sudah terdaftar (hanya untuk verifikasi pendaftaran)
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email);

      if (checkError) {
        return NextResponse.json(
          { error: 'Gagal memeriksa ketersediaan email' },
          { status: 500 }
        );
      }

      if (existingUser && existingUser.length > 0) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        
        // Periksa apakah error terkait rate limit
        if (error.message && (
            error.message.includes('rate limit') || 
            error.message.includes('too many requests') ||
            error.message.includes('too many emails')
          ) || 
          (error.code === 'over_email_send_rate_limit') ||
          (error.status === 429)) {
          return NextResponse.json(
            { error: 'Terlalu banyak permintaan. Mohon tunggu 15-30 menit sebelum mencoba lagi.' },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Kode OTP telah dikirim ke email Anda',
      });
    }
    // Jika purpose tidak valid
    else {
      return NextResponse.json(
        { error: 'Purpose tidak valid. Gunakan "reset_password" atau "verification"' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim OTP' },
      { status: 500 }
    );
  }
} 