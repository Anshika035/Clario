import { type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
};

const variants = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-dark hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  secondary:
    "bg-card text-ink border border-line hover:border-accent/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  ghost: "text-ink hover:bg-paper active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const sizing = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm";

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variants[variant]} ${sizing} ${className}`}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonLinkProps) {
  const sizing = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm";

  return (
    <a
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-[background-color,border-color,box-shadow,transform] ${variants[variant]} ${sizing} ${className}`}
      {...props}
    />
  );
}
