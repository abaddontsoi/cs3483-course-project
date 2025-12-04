"use client";
import CameraFeed from "@/src/components/cameraFeed";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

export default function CameraPage() {
    const [landmark, setHandLandmark] = useState<NormalizedLandmark | null>(null);
    const [gesture, setGesture] = useState<string>('none');

    const prevLandmarkRef = useRef<NormalizedLandmark | null>(null);

    const [velocityVector, setVelocityVector] = useState({ x: 0, y: 0 });
    const [horizontalDir, setHorizontalDir] = useState<string>("Staying");
    const [verticalDir, setVerticalDir] = useState<string>("Staying");

    useEffect(() => {
        const current = landmark;
        const previous = prevLandmarkRef.current;

        if (current && previous) {
            const dx = current.x - previous.x;
            const dy = current.y - previous.y;

            // Update velocity
            setVelocityVector({ x: dx, y: dy });

            // Horizontal direction
            if (Math.abs(dx) < 0.02) { 
                setHorizontalDir("Staying");
            } else if (dx > 0) {
                setHorizontalDir("To right");
            } else {
                setHorizontalDir("To left");
            }

            // Vertical direction
            if (Math.abs(dy) < 0.02) {
                setVerticalDir("Staying");
            } else if (dy > 0) {
                setVerticalDir("Down");
            } else {
                setVerticalDir("Up");
            }
        } else if (current) {
            // First detection
            setHorizontalDir("Staying");
            setVerticalDir("Staying");
        }
        prevLandmarkRef.current = current;
    }, [landmark]);

    const handleLandmarkUpdate = (newLandmark: NormalizedLandmark | null) => {
        setHandLandmark(newLandmark);
    };

    return (
        <div>
            <div>Camera Feed - {gesture}</div>
            <CameraFeed
                handleLandmarkUpdate={handleLandmarkUpdate}
                setGesture={setGesture}
            />
            <div>
                Current: {landmark ? `${landmark.x.toFixed(3)}, ${landmark.y.toFixed(3)}` : "No hand"}
            </div>
            <div>
                Velocity: {velocityVector.x.toFixed(4)}, {velocityVector.y.toFixed(4)}
            </div>
            <div>
                Direction: {horizontalDir} | {verticalDir}
            </div>
        </div>
    );
}