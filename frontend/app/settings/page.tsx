"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import SectionHeader from "../../components/SectionHeader";
import ToggleSwitch from "../../components/ToggleSwitch";
import PrimaryButton from "../../components/PrimaryButton";

export default function SettingsPage() {
    const [isTesting, setIsTesting] = useState(false);

    // Default config values
    const [config, setConfig] = useState({
        voiceDetection: true,
        gestureDetection: true,
        batterySharing: true,
        locationSharing: true
    });

    useEffect(() => {
        // Load initial config from local storage if available
        const savedConfig = localStorage.getItem("fivesense_config");
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error("Failed to parse config", e);
            }
        }
    }, []);

    const updateConfig = (key: keyof typeof config, value: boolean) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        localStorage.setItem("fivesense_config", JSON.stringify(newConfig));
        // You could also ping a backend endpoint here if needed
    };

    const handleTestAlert = async () => {
        setIsTesting(true);
        try {
            const formData = new FormData();
            formData.append("latitude", "40.7128");
            formData.append("longitude", "-74.0060");
            formData.append("battery_level", "100");
            formData.append("battery_status", "Charging [TEST]");

            const savedWaConfig = localStorage.getItem("fivesense_whatsapp_config");
            if (savedWaConfig) {
                try {
                    const waConfig = JSON.parse(savedWaConfig);
                    if (waConfig.accessToken) formData.append("whatsapp_access_token", waConfig.accessToken);
                    if (waConfig.phoneNumberId) formData.append("whatsapp_phone_number_id", waConfig.phoneNumberId);
                    if (waConfig.recipients) formData.append("whatsapp_recipients", waConfig.recipients);
                } catch (e) {
                    console.error("Failed to parse WhatsApp config", e);
                }
            }

            const res = await fetch("/api/send-alert", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Test failed");
            alert("Test alert sent successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to send test alert check if backend is running on port 5000.");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <SectionHeader title="Settings" description="Configure your system preferences" className="!mt-2" />

            <div className="mt-6 mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Trigger Settings</h3>
                <ToggleSwitch
                    label="Enable Voice Detection"
                    initialState={config.voiceDetection}
                    onChange={(val) => updateConfig('voiceDetection', val)}
                />
                <ToggleSwitch
                    label="Enable Gesture Detection"
                    initialState={config.gestureDetection}
                    onChange={(val) => updateConfig('gestureDetection', val)}
                />
            </div>

            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Device Monitoring</h3>
                <ToggleSwitch
                    label="Enable Battery Status Sharing"
                    initialState={config.batterySharing}
                    onChange={(val) => updateConfig('batterySharing', val)}
                />
                <ToggleSwitch
                    label="Enable Location Sharing"
                    initialState={config.locationSharing}
                    onChange={(val) => updateConfig('locationSharing', val)}
                />
            </div>

            <div className="mb-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Integrations</h3>
                <Link href="/whatsapp-config">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center active:scale-[0.99] transition-transform my-2">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#10B981]">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.125-.339-.153-.873-.349-2.023-1.499-1.328-1.328-1.503-1.34-1.724-1.636-.217-.291-.013-.48.118-.616.103-.105.228-.276.331-.402.106-.129.141-.222.213-.371.073-.146.036-.275-.018-.382-.054-.108-.475-1.151-.652-1.575-.17-.406-.341-.351-.475-.357-.123-.005-.264-.006-.407-.006-.144 0-.377.054-.575.267-.202.215-.769.752-.769 1.834 0 1.084.788 2.131.897 2.277.112.148 1.554 2.378 3.766 3.332.527.227.938.363 1.258.465.529.168 1.01.144 1.391.087.433-.065 1.328-.544 1.516-1.068.188-.525.188-.975.132-1.069-.057-.094-.213-.15-.444-.266z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">WhatsApp Configuration</h4>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Setup API keys and recipients</p>
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <PrimaryButton variant="secondary" className="mt-2" onClick={handleTestAlert} isLoading={isTesting}>
                    Send Test Alert
                </PrimaryButton>
            </div>
        </div>
    );
}
