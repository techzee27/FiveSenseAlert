"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function CameraManager({ onTrigger }: { onTrigger: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [detecting, setDetecting] = useState(false);

    // Store mediapipe instances in refs to avoid recreating
    const handsAnalyzer = useRef<HandLandmarker | null>(null);
    const requestRef = useRef<number>(0);

    // Throttle the trigger to prevent multiple fires
    const lastTriggered = useRef<number>(0);

    const checkPermissions = async () => {
        try {
            // Check geolocation
            navigator.geolocation.getCurrentPosition(() => { }, () => { });

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
                };
            }
        } catch (err) {
            console.error("Permission error:", err);
            alert("Camera, Microphone, and Location permissions are required for the emergency trigger to work.");
        }
    };

    const countFingers = (landmarks: any[]) => {
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

    const predictWebcam = useCallback(async () => {
        if (!cameraActive || !handsAnalyzer.current || !videoRef.current) return;

        const video = videoRef.current;
        let startTimeMs = performance.now();

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
            requestRef.current = requestAnimationFrame(predictWebcam);
        }
    }, [cameraActive, detecting, onTrigger]);

    useEffect(() => {
        checkPermissions();
        initMediaPipe();

        return () => {
            setDetecting(false);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
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
        <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl shadow-lg border-4 border-gray-100 dark:border-gray-800 bg-black aspect-video flex items-center justify-center">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />

            {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 animate-pulse text-sm font-medium">
                    Initializing Camera...
                </div>
            )}

            <div className="absolute top-3 right-3 flex space-x-2">
                {detecting && cameraActive && (
                    <span className="flex items-center space-x-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-[10px] text-white font-bold tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>SCANNING</span>
                    </span>
                )}
            </div>
        </div>
    );
}
