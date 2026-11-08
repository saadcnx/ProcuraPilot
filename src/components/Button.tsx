import React from "react";
import { LoaderCircleIcon, BoxIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger' | 'outlined-danger';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: BoxIcon;
  loading?: boolean;
  fullWidth?: boolean;
}
const variantClasses: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-e1',
  tonal: 'bg-primary-container text-on-primary-container hover:bg-primary-container-hover',
  outlined: 'border border-outline text-primary hover:bg-primary/[0.08]',
  text: 'px-3 text-primary hover:bg-primary/[0.08]',
  danger: 'bg-error text-on-primary hover:bg-error-hover hover:shadow-e1',
  'outlined-danger': 'border border-error/60 text-error hover:bg-error/[0.08]'
};
export function Button({
  variant = 'filled',
  icon: Icon,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} disabled={disabled || loading} className={twMerge('inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-sm font-medium tracking-[0.01em] transition-[background-color,box-shadow,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:shadow-none disabled:pointer-events-none disabled:opacity-40', variantClasses[variant], fullWidth && 'w-full', className)} {...rest}>
      {loading ? <LoaderCircleIcon className="h-[18px] w-[18px] animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-[18px] w-[18px]" aria-hidden="true" />}
      {children}
    </button>;
}