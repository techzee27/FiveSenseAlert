"use client";
import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader";

interface HistoryItem {
    id: string;
    timestamp: string;
    type: string;
    status: "delivered" | "failed";
    message: string;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const historyStr = localStorage.getItem("fivesense_history");
        if (historyStr) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setHistory(JSON.parse(historyStr));
            } catch (e) {
                console.error("Failed to parse history:", e);
            }
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem("fivesense_history");
        setHistory([]);
    };

    return (
        <div className="animate-in fade-in duration-500 pb-24">
            <div className="flex justify-between items-center mb-6 mt-4">
                <SectionHeader
                    title="Alert History"
                    description="Recent emergency alerts and their status"
                />

                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Clear
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No history available</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your recent alerts will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-800/80 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start"
                        >
                            <div className={`p-2 rounded-full mr-4 ${item.status === 'delivered'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {item.status === 'delivered' ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{item.type}</h3>
                                    <span className="text-[10px] font-medium text-gray-400">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                                <span className={`inline-block text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${item.status === 'delivered'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    }`}>
                                    {item.message || item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
