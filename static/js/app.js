let camera;
let hands;
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let recordingTimeout;
let fiveFingerDetected = false;
let alertInProgress = false;

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusBox = document.getElementById('status-box');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const fingerCount = document.getElementById('count-value');
const recordingIndicator = document.getElementById('recording-indicator');
const alertMessage = document.getElementById('alert-message');

function updateStatus(icon, text, state = '') {
    statusIcon.textContent = icon;
    statusText.textContent = text;
    statusBox.className = 'status-box ' + state;
}

function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = 'alert-message show ' + type;
    setTimeout(() => {
        alertMessage.className = 'alert-message';
    }, 5000);
}

function countFingers(landmarks) {
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerBases = [2, 5, 9, 13, 17];
    let count = 0;

    for (let i = 0; i < fingerTips.length; i++) {
        const tip = landmarks[fingerTips[i]];
        const base = landmarks[fingerBases[i]];
        
        if (i === 0) {
            const tipX = tip.x;
            const baseX = base.x;
            if (Math.abs(tipX - baseX) > 0.05) {
                count++;
            }
        } else {
            if (tip.y < base.y) {
                count++;
            }
        }
    }

    return count;
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let detectedFingers = 0;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            detectedFingers += countFingers(landmarks);
            
            if (window.drawConnectors && window.HAND_CONNECTIONS) {
                window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 2
                });
            }
            if (window.drawLandmarks) {
                window.drawLandmarks(canvasCtx, landmarks, {
                    color: '#FF0000',
                    lineWidth: 1,
                    radius: 3
                });
            }
        }
    }

    fingerCount.textContent = detectedFingers;

    if (detectedFingers >= 5 && !isRecording && !alertInProgress) {
        updateStatus('✋', 'Five fingers detected!', 'detecting');
        fiveFingerDetected = true;
        setTimeout(() => {
            if (fiveFingerDetected && !isRecording && !alertInProgress) {
                startRecording();
            }
        }, 500);
    } else if (detectedFingers < 5) {
        fiveFingerDetected = false;
        if (!isRecording && !alertInProgress) {
            updateStatus('👋', 'Ready - Show 5 fingers to alert', '');
        }
    }

    canvasCtx.restore();
}

async function startRecording() {
    if (isRecording || alertInProgress) return;

    try {
        updateStatus('📹', 'Recording started - 5 seconds', 'recording');
        recordingIndicator.classList.add('active');
        isRecording = true;
        alertInProgress = true;
        recordedChunks = [];

        const stream = videoElement.srcObject;
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            await sendEmergencyAlert(blob);
        };

        mediaRecorder.start();

        recordingTimeout = setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                isRecording = false;
                recordingIndicator.classList.remove('active');
            }
        }, 5000);

    } catch (error) {
        console.error('Recording error:', error);
        showAlert('Recording failed: ' + error.message, 'error');
        isRecording = false;
        alertInProgress = false;
        recordingIndicator.classList.remove('active');
        updateStatus('❌', 'Recording failed', 'error');
    }
}

async function sendEmergencyAlert(videoBlob) {
    try {
        updateStatus('📍', 'Getting location...', 'recording');

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000
            });
        });

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        updateStatus('📤', 'Sending alert to WhatsApp...', 'recording');

        const formData = new FormData();
        formData.append('video', videoBlob, 'emergency.webm');
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        const response = await fetch('/send-alert', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            updateStatus('✅', 'Alert sent successfully!', 'success');
            showAlert('✅ Emergency alert sent successfully to WhatsApp!', 'success');
        } else {
            throw new Error(result.error || 'Failed to send alert');
        }

    } catch (error) {
        console.error('Alert error:', error);
        updateStatus('❌', 'Alert failed', 'error');
        showAlert('❌ Failed to send alert: ' + error.message, 'error');
    } finally {
        setTimeout(() => {
            alertInProgress = false;
            updateStatus('👋', 'Ready - Show 5 fingers to alert', '');
        }, 3000);
    }
}

async function initCamera() {
    try {
        hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(onResults);

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        videoElement.srcObject = stream;

        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                resolve();
            };
        });

        camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 1280,
            height: 720
        });

        camera.start();

        updateStatus('✅', 'Ready - Show 5 fingers to alert', '');

    } catch (error) {
        console.error('Camera initialization error:', error);
        updateStatus('❌', 'Camera access denied', 'error');
        showAlert('Please allow camera access to use this app.', 'error');
    }
}

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showAlert('Your browser does not support camera access.', 'error');
} else {
    initCamera();
}
