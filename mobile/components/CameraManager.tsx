import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraManager({ onTrigger }: { onTrigger: () => void }) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
        video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-family: sans-serif; font-size: 14px; text-align: center; }
        .error { position: absolute; top: 10%; left: 0; width: 100%; color: red; font-family: sans-serif; font-size: 14px; text-align: center; padding: 10px; box-sizing: border-box; }
    </style>
</head>
<body>
    <div id="loader" class="loading">Loading ML Models...<br><br>Waiting for camera...</div>
    <div id="err" class="error"></div>
    <video id="videoElement" autoplay playsinline muted></video>

    <script type="module">
        import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";

        let handLandmarker;
        let lastVideoTime = -1;
        let lastTriggerTime = 0;
        let isDetecting = false;
        
        const video = document.getElementById('videoElement');
        const loader = document.getElementById('loader');
        const errbox = document.getElementById('err');

        function sendMessage(type, payload = null) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
        }

        async function initMediaPipe() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                
                handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                
                loader.style.display = 'none';
                isDetecting = true;
                sendMessage('MODEL_READY');
                detectWebcam();
            } catch (e) {
                errbox.innerText = "ML Error: " + e.message;
                sendMessage('ERROR', e.message);
            }
        }

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "user" }
                });
                window.stream = stream;
                video.srcObject = stream;
                
                video.onloadeddata = () => {
                   initMediaPipe();
                }
            } catch (err) {
                errbox.innerText = "Camera Error: " + err.name + " - " + err.message;
                sendMessage('ERROR', "Camera denied: " + err.message);
            }
        }

        function countFingers(landmarks) {
            const tips = [4, 8, 12, 16, 20];
            const bases = [2, 5, 9, 13, 17];
            let count = 0;

            for (let i = 0; i < tips.length; i++) {
                const tip = landmarks[tips[i]];
                const base = landmarks[bases[i]];

                if (i === 0) {
                    if (Math.abs(tip.x - base.x) > 0.05) count++;
                } else {
                    if (tip.y < base.y) count++; 
                }
            }
            return count;
        }

        async function detectWebcam() {
            if (!isDetecting || !handLandmarker) return;

            if (video.currentTime !== lastVideoTime) {
                lastVideoTime = video.currentTime;
                
                try {
                    const results = handLandmarker.detectForVideo(video, performance.now());
                    
                    if (results.landmarks && results.landmarks.length > 0) {
                        const fingers = countFingers(results.landmarks[0]);
                        const now = Date.now();
                        
                        // Allow 4 or 5 fingers since overlapping ML coordinates can sometimes drop a finger
                        if (fingers >= 4 && (now - lastTriggerTime > 10000)) {
                            lastTriggerTime = now;
                            sendMessage('GESTURE_DETECTED');
                        }
                    }
                } catch(e) {}
            }
            
            requestAnimationFrame(detectWebcam);
        }

        startCamera();
    </script>
</body>
</html>
    `;

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'GESTURE_DETECTED') {
                console.log("5 Fingers detected via ML Webview! Triggering Emergency...");
                onTrigger();
            }
        } catch (e) { }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cameraWrapper}>
                <WebView
                    source={{ html: htmlContent, baseUrl: 'https://localhost' }}
                    originWhitelist={['*']}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    mediaCapturePermissionGrantType="grant"
                    javaScriptEnabled={true}
                    onMessage={handleMessage}
                    style={styles.camera}
                />
                <View style={styles.badge}>
                    <View style={styles.dot} />
                    <Text style={styles.badgeText}>Gesture Detection ML Active</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 0,
        width: '100%',
    },
    cameraWrapper: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.22,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#e5e7eb',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    camera: {
        flex: 1,
        backgroundColor: '#000',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '600',
    },
});
