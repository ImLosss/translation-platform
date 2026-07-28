'use server';

import { cookies } from 'next/headers';

// ==========================================
// ACTION: LOGIN MANUAL
// ==========================================
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email dan password wajib diisi.' };
  }

  // SIMULASI CEK DATABASE (Ganti dengan logika database sungguhan nanti)
  if (email === 'admin@example.com' && password === 'rahasia123') {
    
    // Set HTTP-Only Cookie yang aman
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'dummy_token_rahasia_123', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // Berlaku 1 minggu
    });

    return { success: true, message: 'Login berhasil!' };
  }

  return { success: false, message: 'Email atau password salah.' };
}

// ==========================================
// ACTION: SIGNUP MANUAL
// ==========================================
export async function signupAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password || password.length < 8) {
    return { success: false, message: 'Pastikan semua data valid (Password min 8 karakter).' };
  }

  // SIMULASI SIMPAN KE DATABASE DI SINI...

  // Set cookie setelah berhasil daftar
  const cookieStore = await cookies();
  cookieStore.set('auth_token', 'dummy_token_rahasia_123', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return { success: true, message: 'Akun berhasil dibuat!' };
}

// ==========================================
// ACTION: GOOGLE LOGIN
// ==========================================
export async function googleLoginAction(accessToken: string) {
  try {
    // Verifikasi Access Token langsung ke server Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error("Token Google tidak valid");
    }

    // Dapatkan data user dari Google
    const payload = await response.json();
    
    if (!payload.email) {
      return { success: false, message: 'Gagal mendapatkan email dari Google' };
    }

    // SIMULASI: Cek/Simpan email & nama ke database Anda di sini...
    // console.log("User Google login:", payload.name, payload.email);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'dummy_token_google_123', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 
    });

    return { 
      success: true, 
      message: `Login berhasil sebagai ${payload.name}` 
    };

  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, message: 'Autentikasi Google gagal.' };
  }
}