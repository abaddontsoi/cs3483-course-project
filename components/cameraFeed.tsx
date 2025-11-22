'use client';
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import {
    FilesetResolver,
    HandLandmarker,
    DrawingUtils,
} from '@mediapipe/tasks-vision';

const CameraFeed: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createHandLandmarker = async () => {
        try {
            // This loads the WebAssembly files from CDN
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
            );

            // Create the hand detector model
            const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    delegate: 'GPU', // Use GPU if available (falls back to CPU)
                },
                runningMode: 'VIDEO',     // Important: VIDEO mode for real-time
                numHands: 2,              // Detect up to 2 hands
                minHandDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            handLandmarkerRef.current = handLandmarker;
            setIsLoading(false);
            console.log('Hand Landmarker loaded!');
        } catch (err) {
            setError('Failed to load model');
            console.error(err);
        }
    };


    const detectHands = async () => {
        if (!webcamRef.current?.video || !canvasRef.current || !handLandmarkerRef.current) return;

        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn('Video not ready yet (dimensions 0x0), retrying...');
            requestAnimationFrame(detectHands);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const startTimeMs = performance.now();

        try {
            // Run detection (now safe!)
            const results = await handLandmarkerRef.current.detectForVideo(
                video,
                startTimeMs
            );

            // Clear and draw the video frame
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Draw hand landmarks and connections
            if (results.landmarks) {
                const drawingUtils = new DrawingUtils(ctx);

                for (const landmarks of results.landmarks) {
                    drawingUtils.drawLandmarks(landmarks, {
                        color: '#00FF00',
                        lineWidth: 2,
                        radius: 4,
                    });

                    drawingUtils.drawConnectors(
                        landmarks,
                        HandLandmarker.HAND_CONNECTIONS,
                        { color: '#00FF00', lineWidth: 4 }
                    );
                }
            }
        } catch (err) {
            console.error('Detection error:', err);
            setError('Detection failed—check console');
        }

        ctx.restore();

        // Keep looping
        requestAnimationFrame(detectHands);
    };

    const handleVideoReady = () => {
        console.log('Webcam ready!');
        detectHands();
    };

    // Run once on mount
    useEffect(() => {
        createHandLandmarker();

        return () => {
            handLandmarkerRef.current?.close(); // Clean up model
        };
    }, []);

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: 'user',
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-center mb-4">
                Hand Pose Detection with MediaPipe
            </h1>

            {isLoading && <p className="text-center">Loading model...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="relative border-4 border-gray-800 rounded-lg overflow-hidden">
                {/* Hidden webcam */}
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    mirrored={true}
                    onUserMedia={handleVideoReady}
                    onUserMediaError={(err) => setError('Camera access denied')}
                    className="absolute opacity-0"
                />

                {/* Canvas where we draw video + landmarks */}
                <canvas
                    ref={canvasRef}
                    className="w-full h-auto scale-x-[-1]"
                />
            </div>

            <p className="text-center mt-4 text-gray-600">
                Show your hand to the camera
            </p>
        </div>
    );
};

export default CameraFeed;