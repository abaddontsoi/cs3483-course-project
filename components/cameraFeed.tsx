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

const CameraFeed = ({ handleLandmarkUpdate, setGesture }: {
    handleLandmarkUpdate: (newLandmark: NormalizedLandmark | null) => void;
    setGesture: (gesture: string) => void;
}) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const recognizerRef = useRef<GestureRecognizer | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastDetectionTimeRef = useRef<number>(0);

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
                numHands: 1,
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
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(detectHands);
            return;
        }

        const now = performance.now();

        if (now - lastDetectionTimeRef.current < 500) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d')!;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            requestAnimationFrame(detectHands);
            return;
        }

        lastDetectionTimeRef.current = now; // Update timestamp

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const results = await recognizerRef.current.recognizeForVideo(video, now);
        const drawingUtils = new DrawingUtils(ctx);

        if (results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];

            drawingUtils.drawConnectors(
                landmarks,
                GestureRecognizer.HAND_CONNECTIONS,
                { color: '#00FF00', lineWidth: 5 }
            );
            drawingUtils.drawLandmarks(landmarks, {
                color: '#FF0000',
                lineWidth: 2,
                radius: 6,
            });

            const gestureInfo = results.gestures[0]?.[0];
            const gestureName = gestureInfo?.categoryName || 'none';

            const flippedLandmarks = landmarks.map(lm => ({
                ...lm,
                x: 1 - lm.x
            }));
            handleLandmarkUpdate(flippedLandmarks[0]);
            setGesture(gestureName);
        } else {
            handleLandmarkUpdate(null);
            setGesture('none');
        }

        ctx.restore();
        requestAnimationFrame(detectHands);
    };

    const handleVideoReady = () => {
        detectHands();
    };

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
                    className="hidden"
                />

                {/* Canvas where we draw video + landmarks */}
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default CameraFeed;