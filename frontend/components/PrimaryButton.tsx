import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "success" | "danger";
    isLoading?: boolean;
}

export default function PrimaryButton({ children, variant = "primary", isLoading, className = "", ...props }: PrimaryButtonProps) {
    const baseStyle = "w-full py-4 px-6 rounded-xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center space-x-2 uppercase tracking-wide text-sm";

    const variants = {
        primary: "bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-lg shadow-gray-900/20 dark:shadow-white/10 hover:bg-gray-800 dark:hover:bg-gray-100",
        secondary: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm",
        success: "bg-[#10B981] text-white shadow-lg shadow-green-500/30 hover:bg-green-600",
        danger: "bg-[#E10600] text-white shadow-lg shadow-red-500/30 hover:bg-red-700",
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            <span>{children}</span>
        </button>
    );
}
