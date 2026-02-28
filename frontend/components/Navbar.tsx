"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

function HomeIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function HistoryIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default function Navbar() {
    const pathname = usePathname();

    const isSettings = pathname?.startsWith("/settings") || pathname?.startsWith("/whatsapp-config");

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 rounded-t-2xl">
            <div className="flex justify-around items-center h-20 px-2 pb-2">
                <NavItem href="/" label="Home" active={pathname === "/"} icon={<HomeIcon />} />
                <NavItem href="/settings" label="Settings" active={isSettings} icon={<SettingsIcon />} />
            </div>
        </nav>
    );
}

function NavItem({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: ReactNode }) {
    return (
        <Link href={href} className="flex flex-col items-center justify-center space-y-1 w-20 flex-shrink-0 group">
            <div className={`p-2 rounded-xl transition-all duration-200 ${active ? "bg-[#E10600]/10 text-[#E10600]" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"}`}>
                <div className={`transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                    {icon}
                </div>
            </div>
            <span className={`text-[11px] font-medium transition-colors ${active ? "text-[#E10600]" : "text-gray-500 dark:text-gray-400"}`}>{label}</span>
        </Link>
    );
}
