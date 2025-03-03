import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase client dengan Service Role Key untuk bypass RLS
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { name, email, password, username, whatsapp } = await req.json();
    
    if (!name || !email || !password || !username) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada di auth.users
    const { data: authUser, error: authCheckError } = await adminSupabase.auth.admin
      .listUsers();

    const emailExists = authUser?.users?.some(user => user.email === email);
    
    if (emailExists) {
      // Jika email ada di auth tapi tidak di users table, hapus dari auth
      const { data: existingDbUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (!existingDbUser) {
        // Cari user ID dari auth users
        const userToDelete = authUser.users.find(user => user.email === email);
        if (userToDelete) {
          // Hapus user dari auth
          await adminSupabase.auth.admin.deleteUser(userToDelete.id);
        }
      } else {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        );
      }
    }
    
    // Cek username
    const { data: existingUsername, error: usernameError } = await adminSupabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    
    if (usernameError) {
      console.error('Error checking existing username:', usernameError);
      return NextResponse.json(
        { error: 'Gagal memeriksa username' },
        { status: 500 }
      );
    }
    
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }
    
    // Buat user di auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { error: 'Gagal membuat akun: ' + authError.message },
        { status: 500 }
      );
    }

    // Tambahkan user ke tabel users tanpa menyertakan id (akan di-generate otomatis)
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .insert([
        {
          name,
          email,
          username,
          whatsapp: whatsapp || null,
          password, // Pastikan password sudah di-hash sebelumnya
          role: 'user',
          created_at: new Date().toISOString(),
          email_verified: true
        }
      ])
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating user record:', userError);
      
      // Hapus auth user jika gagal membuat record di tabel users
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: 'Gagal membuat data pengguna: ' + userError.message },
        { status: 500 }
      );
    }

    // Update auth user dengan custom claims untuk menyimpan user_id dari tabel users
    await adminSupabase.auth.admin.updateUserById(
      authData.user.id,
      { user_metadata: { db_user_id: userData.id } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      user: userData
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan: ' + error.message },
      { status: 500 }
    );
  }
} 