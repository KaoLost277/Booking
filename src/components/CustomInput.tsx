import { type InputHTMLAttributes, forwardRef } from 'react';


interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  lightOnly?: boolean;
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, lightOnly = false, ...props }, ref) => {

    // สไตล์ให้ตรงกับ combobox ใน BookingFilter (OpenAI theme)
    const baseClasses = `block w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition-all ${lightOnly
        ? "bg-white text-[#0d0d0d] placeholder:text-[#acacbe]"
        : "bg-white dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-[#ececf1] placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80]"
      }`;

    const statusClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/10"
      : lightOnly
        ? "border-[#e5e5e5] hover:border-[#c5c5d2] focus:border-[#0d0d0d] focus:ring-1 focus:ring-[#0d0d0d]/10"
        : "border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className={`text-sm font-medium ${lightOnly ? "text-[#6e6e80]" : "text-[#6e6e80] dark:text-[#8e8ea0]"}`}>
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          className={`${baseClasses} ${statusClasses} ${className}`}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

InputComponent.displayName = 'InputComponent';

export default InputComponent;