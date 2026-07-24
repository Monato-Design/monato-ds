import { cn } from '@/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

// Botón "Secondary" — no existe como variant en src/components/core/button.tsx (solo
// primary/danger/success/ghost). Confirmado con el usuario contra Figma: Colors/Skyblue/900
// (= --primitive-skyblue-900, ya existente en tokens.css). Hover usa skyblue-800 (un paso más
// claro) porque 900 ya es el tono más oscuro de la escala — no hay un paso más oscuro al cual
// bajar. Candidato a promoverse a variant real del Button compartido si se reutiliza fuera de Kora.
const secondaryButtonStyles = cva(
  'flex items-center justify-center gap-2 rounded-lg font-medium transition outline-none focus:ring-3 disabled:pointer-events-none',
  {
    variants: {
      appearance: {
        fill: 'bg-[var(--primitive-skyblue-900)] text-white-100 hover:bg-[var(--primitive-skyblue-800)] focus:ring-[var(--primitive-skyblue-900)]/30 disabled:bg-button-disabled-background disabled:text-button-disabled-text',
        outline:
          'border border-[var(--primitive-skyblue-900)] bg-background-50 text-[var(--primitive-skyblue-900)] hover:bg-[var(--primitive-skyblue-900)]/5 focus:ring-[var(--primitive-skyblue-900)]/20 disabled:border-button-outline-disabled-border disabled:text-button-outline-disabled-text',
      },
      size: {
        xs: 'px-3.5 py-2 text-xs',
        sm: 'px-3.5 py-2.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base',
      },
    },
    defaultVariants: { appearance: 'fill', size: 'md' },
  },
);

type PropsType = ComponentProps<'button'> & VariantProps<typeof secondaryButtonStyles>;

export function SecondaryButton({ appearance, size, className, ...props }: PropsType) {
  return (
    <button
      type="button"
      className={cn(secondaryButtonStyles({ appearance, size }), className)}
      {...props}
    />
  );
}
