"use client";
import { useRef, useEffect, useState } from "react";
import StatusCard from "../components/StatusCard";
import EmergencyButton from "../components/EmergencyButton";
import ToggleSwitch from "../components/ToggleSwitch";
import SectionHeader from "../components/SectionHeader";
import CameraManager from "../components/CameraManager";

export default function Home() {
    const triggerRef = useRef<{ triggerEmergency: () => void } | null>(null);
    const [config, setConfig] = useState({
        gestureDetection: true,
        voiceDetection: true
    });

    useEffect(() => {
        const savedConfig = localStorage.getItem("fivesense_config");
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setConfig({
                    gestureDetection: parsed.gestureDetection ?? true,
                    voiceDetection: parsed.voiceDetection ?? true
                });
            } catch (e) {
                console.error("Parse error", e);
            }
        }
    }, []);

    const updateConfig = (key: keyof typeof config, value: boolean) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);

        const existing = localStorage.getItem("fivesense_config");
        let fullConfig = { ...newConfig, batterySharing: true, locationSharing: true };
        if (existing) {
            fullConfig = { ...JSON.parse(existing), ...newConfig };
        }
        localStorage.setItem("fivesense_config", JSON.stringify(fullConfig));
    };

    const handleAutoTrigger = () => {
        if (triggerRef.current && config.gestureDetection) {
            triggerRef.current.triggerEmergency();
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mt-4 mb-4">
                {config.gestureDetection && <CameraManager onTrigger={handleAutoTrigger} />}
            </div>

            <div className="flex flex-col items-center justify-center mb-8">
                {/* @ts-ignore */}
                <EmergencyButton ref={triggerRef} />
            </div>

            <SectionHeader
                title="System Status"
                description="Real-time monitoring of your emergency sensors"
            />

            <div className="grid grid-cols-2 gap-4 mb-8">
                <StatusCard
                    label="Camera"
                    status={config.gestureDetection ? "active" : "inactive"}
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                />
                <StatusCard
                    label="Microphone"
                    status={config.voiceDetection ? "active" : "inactive"}
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                />
                <StatusCard
                    label="Location"
                    status="active"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <StatusCard
                    label="Battery"
                    status="warning"
                    value="Monitoring"
                    icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                />
            </div>

        </div>
    );
}
