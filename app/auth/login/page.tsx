'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { useAuth } from '@/hooks/auth/useAuth';
import { authService, type IdentifyResult } from '@/services/auth.service';

const inputClass =
  'h-11 w-full rounded-lg border border-brand-200 px-3 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-200';
const buttonClass =
  'h-11 w-full rounded-lg bg-brand-900 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Login en dos pasos:
 * 1. Usuario → /auth/identify/: se valida en la base. Si no existe o está desactivado se queda aquí
 *    con el mensaje; si existe, muestra la marca de su empresa (si tiene una). Un conductor no entra:
 *    usa la app Hurgo Conductor en su celular.
 * 2. Contraseña.
 */
export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [identity, setIdentity] = useState<IdentifyResult | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const next = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStepError(null);
    try {
      setIdentity(await authService.identify(username.trim()));
    } catch (err) {
      const response = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
      if (response?.status === 404 || response?.status === 403) {
        setStepError(response.data?.detail ?? 'El usuario no existe.'); // no pasa a la contraseña
      } else if (response?.status === 429) {
        setStepError('Demasiados intentos. Espera un minuto e intenta de nuevo.');
      } else {
        setStepError('No se pudo verificar el usuario. Revisa la conexión e intenta de nuevo.');
      }
    } finally {
      setSending(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await login({ username: username.trim(), password });
    } catch {
      // el mensaje lo expone el AuthProvider
    } finally {
      setSending(false);
    }
  };

  const back = () => {
    setIdentity(null);
    setPassword('');
    clearError();
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

        {identity?.driver_only ? (
          <div className="mt-6 space-y-4">
            <p role="alert" className="rounded-lg border border-brand-200 bg-brand-200/30 px-3 py-3 text-sm">
              <b>{username.trim()}</b> es conductor: los conductores trabajan desde la app <b>Hurgo Conductor</b> en
              el celular (ahí le llegan sus viajes).
            </p>
            <button type="button" onClick={back} className={buttonClass}>Usar otro usuario</button>
          </div>
        ) : !identity ? (
          <form onSubmit={next} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium">Usuario</label>
              <input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false}
                autoFocus value={username} onChange={(e) => { setUsername(e.target.value); setStepError(null); }} required className={inputClass} />
            </div>
            {stepError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{stepError}</p>
            )}
            <button type="submit" disabled={sending || !username.trim()} className={buttonClass}>
              {sending ? 'Verificando…' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-200/20 px-3 py-2">
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">{username.trim()}</p>
                {identity.company && (
                  <p className="flex items-center gap-1.5 truncate text-brand-700">
                    <span aria-hidden className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{ background: identity.company.color || 'var(--color-brand-700)' }} />
                    {identity.company.name}
                  </p>
                )}
              </div>
              <button type="button" onClick={back} className="shrink-0 text-sm font-medium text-brand-700 hover:underline">
                Cambiar
              </button>
            </div>
            {/* Campo oculto: ayuda a los gestores de contraseñas a asociar el usuario */}
            <input type="text" name="username" autoComplete="username" value={username} readOnly hidden />
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Contraseña</label>
              <input id="password" name="password" type="password" autoComplete="current-password" autoFocus
                value={password} onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                required className={inputClass} />
            </div>
            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <button type="submit" disabled={sending || !password} className={buttonClass}>
              {sending ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        )}
      </section>

      <p className="absolute bottom-4 text-xs text-white/80">© {new Date().getFullYear()} Hurgo Transporte</p>
    </main>
  );
}
