# To-Do List untuk Testing

## 1. Pengujian Fungsionalitas Registrasi
- Uji pendaftaran pengguna dengan semua field yang valid. ✅
- Uji pendaftaran dengan email yang sudah terdaftar. ✅
- Uji pendaftaran dengan username yang sudah digunakan. ✅
- Uji pendaftaran dengan format email yang tidak valid. ✅
- Uji pendaftaran dengan password yang kurang dari 6 karakter. ✅

## 2. Pengujian Fungsionalitas Login
- Uji login dengan email/username dan password yang benar. ✅
- Uji login dengan email/username yang tidak terdaftar. ✅
- Uji login dengan password yang salah. ✅
- Uji login dengan format email yang tidak valid. ✅

## 3. Pengujian Fungsionalitas Lupa Password
- Uji pengiriman OTP untuk email yang terdaftar. ✅
- Uji pengiriman OTP untuk email yang tidak terdaftar. ✅
- Uji verifikasi OTP yang benar. ✅
- Uji verifikasi OTP yang salah. ✅

## 4. Pengujian Fungsionalitas Pembayaran
- Uji proses pembayaran dengan data yang valid. ✅
- Uji proses pembayaran dengan nomor WhatsApp yang sudah terdaftar. ✅
- Uji proses pembayaran dengan email yang sudah terdaftar. ✅
- Uji penanganan kesalahan saat pembayaran gagal. ✅

## 5. Pengujian Fungsionalitas Pendaftaran Tim
- Uji pendaftaran tim dengan semua field yang valid. ✅
- Uji pendaftaran tim dengan nama tim yang sudah terdaftar. ✅
- Uji pendaftaran tim dengan nomor WhatsApp yang tidak valid. ✅

## 6. Pengujian Fungsionalitas Halaman Utama
- Uji tampilan dan fungsionalitas semua komponen di halaman utama. ✅
- Uji navigasi ke halaman lain dari halaman utama. ✅

## 7. Pengujian Fungsionalitas Modal
- Uji tampilan dan fungsionalitas modal konfirmasi. ✅
- Uji tampilan dan fungsionalitas modal sukses. ✅
- Uji tampilan dan fungsionalitas modal pembatalan. ✅

## 8. Pengujian Ketersediaan Data
- Uji pengambilan data turnamen dari Supabase. ✅
- Uji pengambilan data transaksi pengguna. ✅

## 9. Pengujian Responsivitas
- Uji tampilan aplikasi di berbagai ukuran layar (desktop, tablet, mobile).

## 10. Pengujian Keamanan
- Uji penanganan kesalahan untuk input yang tidak valid. 
- Uji perlindungan terhadap serangan XSS dan CSRF.

## 11. Pengujian Kinerja
- Uji waktu respons untuk pengambilan data dari API. ✅
- Uji beban saat banyak pengguna mengakses aplikasi secara bersamaan. ✅

## 12. Pengujian Integrasi
- Uji integrasi antara frontend dan backend. ✅
- Uji integrasi dengan layanan pihak ketiga (seperti Midtrans). ✅

## 13. Pengujian Fungsionalitas Admin
- Uji akses halaman admin untuk pengguna dengan role admin dan owner. ✅
- Uji navigasi antar tab (Users, Tournaments, Transactions, Match Schedules, Teams) di halaman admin. ✅
- Uji penghapusan pengguna oleh admin. ✅
- Uji penambahan turnamen baru oleh admin. ✅
- Uji penghapusan turnamen oleh admin. ✅
- Uji pengelolaan jadwal pertandingan oleh admin. ✅
- Uji tampilan dan fungsionalitas modal konfirmasi penghapusan di halaman admin. ✅
- Uji pengambilan data pengguna dan turnamen dari Supabase di halaman admin. ✅
- Uji penanganan kesalahan saat admin mencoba menghapus pengguna yang tidak ada. ✅
- Uji penanganan kesalahan saat admin mencoba menambahkan turnamen dengan data yang tidak valid. ✅
