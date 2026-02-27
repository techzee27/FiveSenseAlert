"use client";
import { useState, useEffect } from "react";

interface ToggleProps {
    label: string;
    initialState?: boolean;
    onChange?: (state: boolean) => void;
    description?: string;
}

export default function ToggleSwitch({ label, initialState = false, onChange, description }: ToggleProps) {
    const [enabled, setEnabled] = useState(initialState);

    useEffect(() => {
        setEnabled(initialState);
    }, [initialState]);

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState);
        if (onChange) onChange(newState);
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 my-2 transition-all hover:border-gray-200 dark:hover:border-gray-600">
            <div className="flex flex-col pr-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{label}</span>
                {description && <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</span>}
            </div>

            <button
                onClick={handleToggle}
                type="button"
                role="switch"
                aria-checked={enabled}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E10600] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${enabled ? "bg-[#E10600]" : "bg-gray-200 dark:bg-gray-600"
                    }`}
            >
                <span className="sr-only">Toggle {label}</span>
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    );
}
