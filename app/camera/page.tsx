"use client";
import CameraFeed from "@/components/cameraFeed";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { useEffect, useState } from "react";

export default function CameraPage() {
    const [landmarks, setHandLandmarks] = useState<NormalizedLandmark[]>();
    const [gesture, setGesture] = useState<string>('none');

    return (
        <div>
            Camera Feed - {gesture}
            <CameraFeed setHandLandmarks={setHandLandmarks} setGesture={setGesture}/>
        </div>
    )
}