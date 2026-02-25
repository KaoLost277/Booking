import { type ButtonHTMLAttributes, forwardRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    loading?: boolean;
    fullWidth?: boolean;
}

const CustomButton = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', loading, fullWidth, className = '', disabled, ...props }, ref) => {

        const baseClasses = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";

        const variantClasses = {
            primary:
                "bg-[#0d0d0d] dark:bg-[#ececf1] text-white dark:text-[#0d0d0d] hover:bg-[#353740] dark:hover:bg-[#d9d9e3] focus-visible:ring-[#0d0d0d] dark:focus-visible:ring-[#ececf1]",
            secondary:
                "bg-white dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-[#ececf1] border border-[#e5e5e5] dark:border-[#2a2a2a] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] focus-visible:ring-[#a3a3a3]",
            danger:
                "bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 focus-visible:ring-red-400",
            ghost:
                "bg-transparent text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececf1] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] shadow-none focus-visible:ring-[#a3a3a3]",
            outline:
                "bg-transparent text-[#0d0d0d] dark:text-[#ececf1] border border-[#e5e5e5] dark:border-[#2a2a2a] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] focus-visible:ring-[#a3a3a3]"
        };

        const widthClass = fullWidth ? 'w-full' : '';

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
                {...props}
            >
                {loading && (
                    <LoadingSpinner
                        size="sm"
                        variant={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
                    />
                )}
                {children}
            </button>
        );
    }
);

CustomButton.displayName = 'CustomButton';

export default CustomButton;
