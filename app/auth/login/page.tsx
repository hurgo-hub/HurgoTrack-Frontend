'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { UserRound } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordField } from '@/components/auth/PasswordField';
import { Alert, Button, Input } from '@/components/UI';
import { AUTH_FLASH_KEY, clearAuthFlash } from '@/context/AuthProvider';
import { useStorageValue } from '@/hooks/useStorageValue';
import { useAuth } from '@/hooks/auth/useAuth';

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const successMessage = useStorageValue(AUTH_FLASH_KEY, 'session');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  // El aviso se muestra durante esta visita y se descarta al salir
  useEffect(() => () => clearAuthFlash(), []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData);
    } catch {
      // El error lo gestiona el contexto
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Inicia sesión"
      description="Ingresa a tu cuenta para continuar."
    >
      <div className="space-y-4">
        {successMessage && <Alert type="success" message={successMessage} />}
        {error && <Alert type="error" message={error} onClose={clearError} />}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-5" noValidate>
        <Input
          name="username"
          label="Usuario"
          placeholder="nombre de usuario"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={formData.username}
          onChange={handleChange}
          required
          icon={<UserRound />}
        />

        <div>
          <PasswordField
            name="password"
            label="Contraseña"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isLoading} disabled={!formData.username || !formData.password}>
          {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>
      </form>
    </AuthLayout>
  );
}
