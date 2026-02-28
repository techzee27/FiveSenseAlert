"use client";
import { useEffect, useState } from "react";
import HistoryCard, { HistoryItem } from "../../components/HistoryCard";
import SectionHeader from "../../components/SectionHeader";

export default function HistoryPage() {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/history");
            const data = await res.json();
            setHistoryData(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex items-center justify-between mt-2 mb-6">
                <SectionHeader title="Alert History" description="Record of past emergencies" className="!mb-0 !mt-0" />
                <button onClick={fetchHistory} className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95 disabled:opacity-50" disabled={loading}>
                    <svg className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                {loading && historyData.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-[#E10600]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading history...
                    </div>
                ) : historyData.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        No alerts found.
                    </div>
                ) : (
                    historyData.map(item => (
                        <HistoryCard key={item.id} item={item} />
                    ))
                )}
            </div>
        </div>
    );
}
