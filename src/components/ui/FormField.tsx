import { InputHTMLAttributes } from "react";

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
      <label htmlFor={name} className="mb-1 block font-medium text-gray-900">
        {label}
      </label>

      <input
        id={name}
        name={name}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={errorId}
        className={`w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${className}`}
        {...props}
      />

      {errors?.map((error) => (
        <p
          key={error}
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </p>
      ))}
    </div>
  );
}
