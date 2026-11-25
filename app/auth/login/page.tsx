'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useAuth } from '@/hooks/auth/useAuth';

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [sending, setSending] = useState(false);

  const update = (field: 'username' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (error) clearError();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await login(form);
    } catch {
      // el mensaje lo expone el AuthProvider
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      {/* Foto de fondo + capa azul de marca (plana, sin degradado) para que el cuadro se lea */}
      <Image src="/img/login-flota.avif" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-brand-900/55" />

      <section className="w-full max-w-sm rounded-2xl bg-white px-6 py-8 shadow-xl sm:px-8">
        <div className="flex justify-center">
          <BrandLogo height={56} />
        </div>

        <h1 className="mt-8 text-xl font-semibold">Inicia sesión</h1>
        <p className="mt-1 text-sm text-brand-700">Sabe dónde va la carga sin tener que llamar a nadie.</p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={form.username}
              onChange={update('username')}
              required
              className="h-11 w-full rounded-lg border border-brand-200 px-3 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={update('password')}
              required
              className="h-11 w-full rounded-lg border border-brand-200 px-3 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending || !form.username || !form.password}
            className="h-11 w-full rounded-lg bg-brand-900 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </section>

      <p className="absolute bottom-4 text-xs text-white/80">© {new Date().getFullYear()} Hurgo Transporte</p>
    </main>
  );
}
