import { type InputHTMLAttributes, forwardRef } from 'react';


interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  lightOnly?: boolean;
  icon?: React.ReactNode;
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, lightOnly = false, icon, ...props }, ref) => {

    // สไตล์ให้ตรงกับ combobox ใน BookingFilter (OpenAI theme)
    const isReadOnlyOrDisabled = props.readOnly || props.disabled;
    const baseClasses = `block w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${isReadOnlyOrDisabled
      ? "bg-[#f7f7f8] dark:bg-[#2a2a2a] text-[#6e6e80] dark:text-[#8e8ea0] cursor-not-allowed"
      : lightOnly
        ? "bg-white text-[#0d0d0d] placeholder:text-[#acacbe]"
        : "bg-white dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-[#ececf1] placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80]"
      } ${icon ? 'pl-10' : ''}`;

    const statusClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/10"
      : isReadOnlyOrDisabled
        ? "border-[#e5e5e5] dark:border-[#353740]"
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

        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-[#acacbe] dark:text-[#6e6e80] group-focus-within:text-[#0d0d0d] dark:group-focus-within:text-[#ececf1] transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`${baseClasses} ${statusClasses} ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

InputComponent.displayName = 'InputComponent';

export default InputComponent;