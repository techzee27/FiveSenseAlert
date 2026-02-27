"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "../../components/SectionHeader";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";

export default function WhatsAppConfigPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [config, setConfig] = useState({
        accessToken: "",
        phoneNumberId: "",
        recipients: ""
    });

    useEffect(() => {
        const savedConfig = localStorage.getItem("fivesense_whatsapp_config");
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error("Parse config error", e);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({
            ...config,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        localStorage.setItem("fivesense_whatsapp_config", JSON.stringify(config));

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
            <div className="flex items-center space-x-3 mt-2 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <SectionHeader title="WhatsApp Setup" className="!mb-0 !mt-0" />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-5 rounded-2xl mb-8 text-sm font-medium border border-blue-100 dark:border-blue-800/50 leading-relaxed shadow-sm">
                Configure your WhatsApp Business API credentials to enable instant emergency alerts via messages.
            </div>

            <form onSubmit={handleSave} className="space-y-2">
                <InputField
                    label="WhatsApp Access Token"
                    name="accessToken"
                    type="password"
                    placeholder="Enter secure token"
                    value={config.accessToken}
                    onChange={handleChange}
                    required
                />
                <InputField
                    label="Phone Number ID"
                    name="phoneNumberId"
                    type="text"
                    placeholder="e.g. 1029384756"
                    value={config.phoneNumberId}
                    onChange={handleChange}
                    required
                />
                <InputField
                    label="Recipient Numbers"
                    name="recipients"
                    type="text"
                    placeholder="Comma separated (+123456789)"
                    value={config.recipients}
                    onChange={handleChange}
                    required
                />

                <div className="pt-8 flex flex-col space-y-4">
                    <PrimaryButton type="submit" variant="primary" isLoading={isLoading}>
                        Save Configuration
                    </PrimaryButton>
                    <PrimaryButton type="button" variant="secondary" onClick={() => alert("Test ping sent!")}>
                        Test API Connection
                    </PrimaryButton>
                </div>
            </form>

            {showSuccess && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 z-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-bold text-sm tracking-wide">Configuration Saved!</span>
                </div>
            )}
        </div>
    );
}
