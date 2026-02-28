"use client";
import { formatDate } from "../lib/helpers";

export interface HistoryItem {
    id: string;
    label: string;
    location: string;
    date: string;
    battery: string;
    deliveryStatus: "sent" | "delivered" | "failed";
    video_url?: string | null;
}

export default function HistoryCard({ item }: { item: HistoryItem }) {
    const statusConfig = {
        sent: { color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40", label: "Sent" },
        delivered: { color: "text-[#10B981] bg-green-100 dark:text-green-400 dark:bg-green-900/40", label: "Delivered" },
        failed: { color: "text-[#E10600] bg-red-100 dark:text-red-400 dark:bg-red-900/40", label: "Failed" },
    };

    const status = statusConfig[item.deliveryStatus] || statusConfig.delivered;

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition-all hover:shadow-md active:scale-[0.99]">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <span className="text-xl leading-none block">🚨</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{item.label}</h3>
                        <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 mt-4">
                <div className="flex items-start space-x-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <svg className="w-5 h-5 text-[#E10600] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <a href={`https://www.google.com/maps?q=${item.location.replace(/ /g, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline leading-tight text-sm font-medium pr-2">
                        {item.location}
                    </a>
                </div>

                {item.video_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <video src={item.video_url} controls className="w-full h-auto max-h-48 object-cover bg-black" />
                    </div>
                )}

                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 pt-1 px-1">
                    <div className="flex items-center space-x-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDate(item.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-orange-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{item.battery}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
