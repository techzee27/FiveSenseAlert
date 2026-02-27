import { ReactNode } from "react";

interface StatusCardProps {
    label: string;
    status: "active" | "inactive" | "warning";
    value?: string;
    icon: ReactNode;
}

export default function StatusCard({ label, status, value, icon }: StatusCardProps) {
    const statusColors = {
        active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        inactive: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
        warning: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };

    const statusText = {
        active: "Active",
        inactive: "Inactive",
        warning: value || "Warning",
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transform transition-transform hover:scale-[1.02] active:scale-95 cursor-default">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                    {icon}
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[status]}`}>
                    {status === "warning" ? value : statusText[status]}
                </div>
            </div>
            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{label}</div>
        </div>
    );
}
