import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    // Parse request body
    const { bucket, fileName } = await request.json();
    
    if (!bucket || !fileName) {
      return NextResponse.json(
        { error: 'Bucket dan fileName diperlukan' },
        { status: 400 }
      );
    }
    
    // Inisialisasi Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Gunakan service role key untuk bypass RLS
    );
    
    // Hapus file dari bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) {
      console.error('Error menghapus file:', error);
      return NextResponse.json(
        { error: `Gagal menghapus file: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
} 