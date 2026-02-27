import { InputHTMLAttributes, forwardRef } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, className = "", ...props }, ref) => {
        return (
            <div className="mb-5 w-full">
                <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus-within:border-[#E10600] dark:focus-within:border-[#E10600] focus-within:ring-1 focus-within:ring-[#E10600] transition-all">
                    <input
                        {...props}
                        ref={ref}
                        className={`peer w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-transparent px-4 pb-2.5 pt-6 focus:outline-none ${className}`}
                        placeholder={label}
                    />
                    <label className={`absolute left-4 top-4 text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1.5 peer-focus:text-xs font-medium peer-focus:text-[#E10600] ${props.value || props.defaultValue ? 'top-1.5 text-xs' : ''
                        } ${error ? 'text-red-500' : ''}`}>
                        {label}
                    </label>
                </div>
                {error && <p className="mt-1.5 text-xs font-bold text-red-500 px-1">{error}</p>}
            </div>
        );
    }
);
InputField.displayName = "InputField";
export default InputField;
