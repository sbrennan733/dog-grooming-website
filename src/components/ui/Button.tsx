import { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary";

const baseStyles =
  "inline-flex items-center justify-center rounded-full px-7 py-3 font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand shadow-[0_6px_16px_rgb(15_118_110/0.28)] hover:-translate-y-0.5 hover:bg-brand-hover",
  secondary:
    "border-2 border-line bg-surface text-ink hover:-translate-y-0.5 hover:bg-surface-alt",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  className = ""
): string {
  return `${baseStyles} ${variants[variant]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClassName(variant, className)} {...props}>
      {children}
    </button>
  );
}
