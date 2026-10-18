import { InputHTMLAttributes } from "react";
import { inputClassName, labelClassName } from "./form-styles";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  errors?: string[];
}

export default function FormField({
  label,
  name,
  errors,
  className = "",
  ...props
}: FormFieldProps) {
  const errorId = errors?.length ? `${name}-error` : undefined;

  return (
    <div>
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={errorId}
        className={`${inputClassName} ${className}`}
        {...props}
      />

      {errorId && (
        <div id={errorId} role="alert">
          {errors?.map((error) => (
            <p key={error} className="mt-1 text-sm text-danger">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
