import { type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="block space-y-1.5" htmlFor={fieldId}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        id={fieldId}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-accent ${
          error ? "border-warn" : "border-line"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="block text-sm text-warn">{error}</span>
      ) : hint ? (
        <span className="block text-sm text-ink-muted">{hint}</span>
      ) : null}
    </label>
  );
}
