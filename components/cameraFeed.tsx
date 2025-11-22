'use client';
import React, { useRef, useEffect, useState } from 'react';

import Webcam from 'react-webcam';
import {
    FilesetResolver,
    HandLandmarker,
    DrawingUtils,
    NormalizedLandmark,
    GestureRecognizer
} from '@mediapipe/tasks-vision';

const CameraFeed = ({ setHandLandmarks, setGesture }: {
    setHandLandmarks: (landmarks: NormalizedLandmark[]) => void;
    setGesture: (gesture: string) => void;
}) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const recognizerRef = useRef<GestureRecognizer | null>(null);

    // const [gesture, setGesture] = useState<string>('none');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createGestureRecognizer = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
            );

            const recognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 2,
            });

            recognizerRef.current = recognizer;
            setIsLoading(false);
            console.log('Gesture Recognizer loaded!');
        } catch (err) {
            setError('Failed to load gesture model');
            console.error(err);
        }
    };

    const detectHands = async () => {
        if (!webcamRef.current?.video || !canvasRef.current || !recognizerRef.current) {
            requestAnimationFrame(detectHands);
            return;
        }

        const video = webcamRef.current.video!;
        if (video.readyState !== 4 || video.videoWidth === 0) {
            requestAnimationFrame(detectHands);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const results = await recognizerRef.current.recognizeForVideo(video, performance.now());

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const drawingUtils = new DrawingUtils(ctx);

        if (results.landmarks.length > 0) {
            results.landmarks.forEach((landmarks, index) => {
                // Send BOTH hands' landmarks to parent
                // setHandLandmarks(prev => {
                //     const updated = [...prev];
                //     updated[index] = landmarks;
                //     return updated.slice(0, 2); // keep only 2 hands
                // });

                // Draw skeleton
                drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 5,
                });
                drawingUtils.drawLandmarks(landmarks, {
                    color: '#FF0000',
                    lineWidth: 2,
                    radius: 6,
                });

                // Get and show gesture for this hand
                const gestureInfo = results.gestures[index]?.[0];
                const gestureName = gestureInfo?.categoryName || 'none';

                if (gestureInfo && gestureInfo.score > 0.7) {
                    const wrist = landmarks[0];
                    ctx.font = 'bold 36px sans-serif';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 6;
                    ctx.fillStyle = '#00FF00';
                    ctx.strokeText(gestureName.toUpperCase(), wrist.x * canvas.width - 100, wrist.y * canvas.height - 30);
                    ctx.fillText(gestureName.toUpperCase(), wrist.x * canvas.width - 100, wrist.y * canvas.height - 30);
                }

                // Update state with primary gesture (first hand)
                if (index === 0) {
                    setGesture(gestureName);
                }
            });
        } else {
            setGesture('none');
            setHandLandmarks([]); // clear when no hands
        }

        ctx.restore();
        requestAnimationFrame(detectHands);
    };

    const handleVideoReady = () => {
        console.log('Webcam ready!');
        detectHands();
    };

    // Run once on mount
    useEffect(() => {
        createGestureRecognizer();
        return () => {
            recognizerRef.current?.close(); // Clean up model
        };
    }, []);

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: 'user',
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mt-10">
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
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
                    className="hidden" // or visibility-hidden + zero size
                />

                {/* Canvas where we draw video + landmarks */}
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover scale-x-[-1]"
                />
            </div>
        </div>
    );
};

export default CameraFeed;