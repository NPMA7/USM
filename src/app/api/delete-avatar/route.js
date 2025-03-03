import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Inisialisasi Supabase client dengan Service Role Key untuk akses penuh
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { fileName } = await req.json();
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }
    
    // Periksa apakah file ada
    const { data: fileList, error: listError } = await adminSupabase.storage
      .from('avatars')
      .list('', {
        search: fileName
      });
    
    if (listError) {
      return NextResponse.json(
        { error: 'Error checking if file exists', details: listError },
        { status: 500 }
      );
    }
    
    // Jika file tidak ditemukan
    if (!fileList || fileList.length === 0) {
      return NextResponse.json(
        { success: false, message: 'File not found in bucket' },
        { status: 404 }
      );
    }
    
    // Hapus file menggunakan Service Role Key
    const { data, error } = await adminSupabase.storage
      .from('avatars')
      .remove([fileName]);
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete file', details: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      data
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
} 