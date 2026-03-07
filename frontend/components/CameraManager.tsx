"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function CameraManager({ onTrigger }: { onTrigger: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Store mediapipe instances in refs to avoid recreating
    const handsAnalyzer = useRef<HandLandmarker | null>(null);
    const requestRef = useRef<number>(0);

    // Throttle the trigger to prevent multiple fires
    const lastTriggered = useRef<number>(0);

    const checkPermissions = async () => {
        try {
            // Check geolocation
            navigator.geolocation.getCurrentPosition(() => { }, () => { });

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not available. Are you using HTTPS or localhost?");
            }

            // Request camera and microphone
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCameraActive(true);
                    setErrorMsg(null);
                };
            }
        } catch (err: unknown) {
            console.error("Permission error:", err);
            if (err instanceof DOMException && err.name === "NotAllowedError") {
                setErrorMsg("Camera permission denied. Please allow camera access in your browser or system settings.");
            } else {
                setErrorMsg(err instanceof Error ? err.message : "Failed to access camera.");
            }
        }
    };

    const countFingers = (landmarks: { x: number; y: number }[]) => {
        const tips = [4, 8, 12, 16, 20];
        const bases = [2, 5, 9, 13, 17];
        let count = 0;

        for (let i = 0; i < tips.length; i++) {
            const tip = landmarks[tips[i]];
            const base = landmarks[bases[i]];

            // Thumb
            if (i === 0) {
                if (Math.abs(tip.x - base.x) > 0.05) count++;
            } else {
                // Other fingers
                if (tip.y < base.y) count++;
            }
        }
        return count;
    };

    const initMediaPipe = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            handsAnalyzer.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });
            setDetecting(true);
        } catch (e) {
            console.error("Failed to initialize Mediapipe:", e);
        }
    };

    const predictWebcam = useCallback(async function loop() {
        if (!cameraActive || !handsAnalyzer.current || !videoRef.current) return;

        const video = videoRef.current;
        const startTimeMs = performance.now();

        if (video.currentTime > 0) {
            const results = handsAnalyzer.current.detectForVideo(video, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                const detectedFingers = countFingers(results.landmarks[0]);

                const now = Date.now();
                // If 5 fingers are detected and it's been at least 10 seconds since the last trigger
                if (detectedFingers >= 5 && (now - lastTriggered.current > 10000)) {
                    lastTriggered.current = now;
                    console.log("5 Fingers detected! Triggering Emergency...");
                    onTrigger();
                }
            }
        }

        if (detecting) {
            requestRef.current = requestAnimationFrame(loop);
        }
    }, [cameraActive, detecting, onTrigger]);

    useEffect(() => {
        checkPermissions();
        initMediaPipe();

        const currentVideo = videoRef.current;
        return () => {
            setDetecting(false);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (currentVideo && currentVideo.srcObject) {
                const tracks = (currentVideo.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (detecting && cameraActive) {
            requestRef.current = requestAnimationFrame(predictWebcam);
        }
    }, [detecting, cameraActive, predictWebcam]);

    return (
        <div className="flex justify-center mb-8 px-4 w-full">
            <div className="relative w-full max-w-[400px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200 dark:border-gray-800">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                ></video>
                {errorMsg ? (
                    <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
                        <svg className="w-12 h-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-white text-sm font-medium mb-4">{errorMsg}</p>
                        <button
                            onClick={checkPermissions}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-colors border border-white/20"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-2 shadow-lg z-10">
                        <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-pulse"}`}></span>
                        {cameraActive ? "Gesture Detection Active" : "Starting Camera..."}
                    </div>
                )}
            </div>
        </div>
    );
}
