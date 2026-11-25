'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, type InputProps } from '@/components/UI/Input';
import { cn, getPasswordStrength } from '@/utils/helpers';

/** Campo de contraseña con botón para mostrar/ocultar */
export function PasswordField(props: Omit<InputProps, 'type' | 'icon' | 'rightIcon'>) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      icon={<Lock />}
      rightIcon={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="press inline-flex size-9 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
        >
          {visible ? <EyeOff className="size-[1.125rem]" aria-hidden /> : <Eye className="size-[1.125rem]" aria-hidden />}
        </button>
      }
    />
  );
}

const toneBar = { danger: 'bg-danger', warning: 'bg-warning', success: 'bg-success' } as const;
const toneText = { danger: 'text-danger', warning: 'text-warning', success: 'text-success' } as const;

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-200', i < strength.score ? toneBar[strength.tone] : 'bg-line')} />
        ))}
      </div>
      <span className={cn('text-xs font-medium', toneText[strength.tone])}>Seguridad: {strength.label}</span>
    </div>
  );
}
