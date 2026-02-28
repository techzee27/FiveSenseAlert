"use client";
import { useState, forwardRef, useImperativeHandle } from "react";

const EmergencyButton = forwardRef((props, ref) => {
    const [status, setStatus] = useState<"idle" | "recording" | "sending" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const triggerEmergency = async () => {
        if (status === "sending" || status === "recording") return;
        setStatus("recording");

        let videoBlob: Blob | null = null;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // First determine supported mime type for this browser
            let mimeType = '';
            if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
                mimeType = 'video/webm;codecs=h264,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                mimeType = 'video/webm;codecs=vp9,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                mimeType = 'video/webm;codecs=vp8,opus';
            } else {
                mimeType = 'video/webm';
            }

            videoBlob = await new Promise<Blob>((resolve) => {
                const mediaRecorder = new MediaRecorder(stream, { mimeType });
                const chunks: BlobPart[] = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    stream.getTracks().forEach(track => track.stop());
                    resolve(blob);
                };

                mediaRecorder.start();

                setTimeout(() => {
                    if (mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }
                }, 5000);
            });
        } catch (e) {
            console.error("Camera access or recording failed", e);
        }

        setStatus("sending");

        try {
            const { Geolocation } = await import('@capacitor/geolocation');

            let latitude = "0.0";
            let longitude = "0.0";

            try {
                // Request permissions if not granted, though Capacitor usually handles basic prompting
                const permissionStatus = await Geolocation.checkPermissions();
                if (permissionStatus.location !== 'granted') {
                    await Geolocation.requestPermissions();
                }

                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });

                latitude = position.coords.latitude.toString();
                longitude = position.coords.longitude.toString();
            } catch (err) {
                console.error("Capacitor Geolocation failed:", err);
                try {
                    // Try low accuracy fallback
                    const position = await Geolocation.getCurrentPosition({
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: Infinity
                    });
                    latitude = position.coords.latitude.toString();
                    longitude = position.coords.longitude.toString();
                } catch (fallbackErr) {
                    console.error("Fallback Capacitor Geolocation failed:", fallbackErr);
                }
            }

            // Get battery
            let batteryLevel = "100";
            let batteryStatus = "Unknown";
            try {
                // @ts-ignore
                if (navigator.getBattery) {
                    // @ts-ignore
                    const battery = await navigator.getBattery();
                    batteryLevel = Math.round(battery.level * 100).toString();
                    batteryStatus = battery.charging ? "Charging" : "Not Charging";
                }
            } catch (e) {
                console.error("Battery error:", e);
            }

            const formData = new FormData();
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("battery_level", batteryLevel);
            formData.append("battery_status", batteryStatus);
            if (videoBlob) {
                formData.append("video", videoBlob, "record.webm");
            }

            const savedConfig = localStorage.getItem("fivesense_whatsapp_config");
            if (savedConfig) {
                try {
                    const waConfig = JSON.parse(savedConfig);
                    if (waConfig.accessToken) formData.append("whatsapp_access_token", waConfig.accessToken);
                    if (waConfig.phoneNumberId) formData.append("whatsapp_phone_number_id", waConfig.phoneNumberId);
                    if (waConfig.recipients) formData.append("whatsapp_recipients", waConfig.recipients);
                } catch (e) {
                    console.error("Failed to parse WhatsApp config", e);
                }
            }

            // In a Capacitor app, `/api/...` won't work because there is no node server.
            // We use NEXT_PUBLIC_API_URL so that the app knows where the hosted backend is.
            // By default, it falls back to a relative route which will work for the standard web app dev space.
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/send-alert` : "/api/send-alert";

            const res = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const errText = data.error || "Failed to send alert";
                setErrorMessage(errText);
                setStatus("error");
                setTimeout(() => {
                    setStatus("idle");
                    setErrorMessage("");
                }, 6000);
                return;
            }

            setStatus("success");
            setErrorMessage("");
            setTimeout(() => setStatus("idle"), 4000);
        } catch (error: any) {
            setErrorMessage(error.message || "Connection failed");
            setStatus("error");
            setTimeout(() => {
                setStatus("idle");
                setErrorMessage("");
            }, 6000);
        }
    };

    useImperativeHandle(ref, () => ({
        triggerEmergency
    }));

    return (
        <div className="flex flex-col items-center justify-center my-10 relative">
            <div className={`w-64 h-64 flex items-center justify-center absolute -z-10 bg-[#E10600]/20 rounded-full blur-xl ${status === "sending" || status === "recording" ? "animate-pulse" : "animate-pulse-fast"}`}></div>

            <button
                onClick={triggerEmergency}
                disabled={status === "sending" || status === "recording"}
                className={`w-56 h-56 rounded-full shadow-[0_10px_40px_rgba(225,6,0,0.4)] flex flex-col items-center justify-center text-white border-4 border-white dark:border-gray-800 transform transition-transform active:scale-95 disabled:opacity-80 disabled:scale-95 ${status === "success" ? "bg-green-500 from-green-400 to-green-600 shadow-[0_10px_40px_rgba(16,185,129,0.4)]" :
                    status === "error" ? "bg-orange-500 from-orange-400 to-orange-600" :
                        "bg-gradient-to-br from-[#FF3B30] to-[#E10600]"
                    }`}
            >
                <span className="text-3xl font-black tracking-widest text-shadow-sm mb-1">
                    {status === "recording" ? "RECORDING" : status === "sending" ? "SENDING" : status === "success" ? "SENT" : status === "error" ? "FAILED" : "EMERGENCY"}
                </span>
                <span className="text-sm font-bold opacity-90">
                    {status === "recording" ? "CAPTURING 5S VIDEO" : status === "sending" ? "PLEASE WAIT" : status === "success" ? "HELP IS ON THE WAY" : status === "error" ? "TRY AGAIN" : "TAP TO TRIGGER"}
                </span>
            </button>

            <div className="mt-8 text-center max-w-sm px-4">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide break-words max-w-full ${status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    status === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}>
                    {status === "idle" ? "Manual trigger ready" :
                        status === "recording" ? "Recording video evidence..." :
                            status === "sending" ? "Acquiring location..." :
                                status === "success" ? "Alert delivered" : (errorMessage || "Connection failed")}
                </span>
            </div>
        </div>
    );
});

EmergencyButton.displayName = "EmergencyButton";
export default EmergencyButton;

