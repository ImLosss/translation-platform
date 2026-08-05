'use server';

import { cookies } from 'next/headers';
import { api } from '../lib/api';

// ==========================================
// ACTION: LOGIN MANUAL
// ==========================================
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Email dan password wajib diisi.' };
  }

  const data = await api<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).catch((error) => { return { success: false, message: error.message }; });

  if (data && data.access_token) {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, message: 'Login Berhasil', user: data.user };
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

  const data = await api<any>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username: name, email, password }),
  }).catch((error) => { return { success: false, message: error.message }; });

  if (!data || !data.access_token) {
    return { success: false, message: data?.message || 'Gagal membuat akun.' };
  }

  // Set cookie setelah berhasil daftar
  const cookieStore = await cookies();
  cookieStore.set('auth_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, message: 'Akun berhasil dibuat!' };
}

// ==========================================
// ACTION: GOOGLE LOGIN
// ==========================================
export async function googleLoginAction(accessToken: string) {
  try {
    const data = await api<any>("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        accessToken,
      }),
    });

    const cookieStore = await cookies();

    cookieStore.set("auth_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      message: "Login Berhasil",
      user: data.user,
    };
  } catch (e) {
    console.error("Google login error:", e);
    return {
      success: false,
      message: "Login Google gagal",
    };
  }
}