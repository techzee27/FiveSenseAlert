import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
    title: 'Five Sense Alert',
    description: 'Emergency Detection System Mobile Web App',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col pt-16 pb-20 max-w-lg mx-auto shadow-2xl overflow-x-hidden relative sm:border-x sm:border-gray-200 dark:sm:border-gray-800">
                <header className="fixed top-0 left-0 right-0 max-w-lg mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 z-40">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#E10600] flex items-center justify-center text-white font-bold">5</div>
                        <h1 className="font-bold text-lg tracking-tight">Five Sense Alert</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-6">
                    {children}
                </main>

                <Navbar />
            </body>
        </html>
    );
}
