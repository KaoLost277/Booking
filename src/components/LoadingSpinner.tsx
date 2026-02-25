import React from 'react';

interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'white' | 'slate';
    fullPage?: boolean;
    className?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({
    size = 'md',
    variant = 'primary',
    fullPage = false,
    className = ''
}) => {
    const sizeClasses = {
        xs: 'h-3 w-3 border-[1.5px]',
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
    };

    const variantClasses = {
        primary: 'border-[#e5e5e5] dark:border-[#2a2a2a] border-t-[#0d0d0d] dark:border-t-[#ececf1]',
        white: 'border-white/30 border-t-white',
        slate: 'border-[#e5e5e5] dark:border-[#2a2a2a] border-t-[#6e6e80] dark:border-t-[#8e8ea0]',
    };

    const spinner = (
        <div
            className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            role="status"
            aria-label="loading"
        />
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-[#0d0d0d]/80 backdrop-blur-sm transition-all">
                <div className="flex flex-col items-center gap-3">
                    {spinner}
                    <span className="text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">Loading...</span>
                </div>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
