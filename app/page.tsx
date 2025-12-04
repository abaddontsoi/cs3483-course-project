"use client";

import { useEffect, useState } from "react";

import ReciepeDisplay from "@/src/components/ReciepeDisplay";
import TimerPage from "./timer/page";

import CameraWindow from "@/src/components/CameraWindow";
import CameraFeed from "@/src/components/cameraFeed";

import { NormalizedLandmark } from "@mediapipe/tasks-vision";


export default function Home() {
	// 0 for recepies display, 1 for timer display
	const [page, setPage] = useState<number>(0);

	const [openCammeraFeed, setOpenCammeraFeed] = useState(false);
	const [userCameraConfim, setUserCameraConfirm] = useState(false);

	const [landmark, setHandLandmark] = useState<NormalizedLandmark | null>(null);
	const [gesture, setGesture] = useState<string>('none');

	useEffect(() => {
		if (confirm("open cammera window?")) { setOpenCammeraFeed(true); return; }
	}, []);

	return (<>
		{openCammeraFeed ? (
			<CameraWindow>
				<CameraFeed handleLandmarkUpdate={(i) => setHandLandmark(i)} setGesture={setGesture} />
			</CameraWindow>
		) : userCameraConfim ? (
			<div style={{ display: "hidden" }}>
				<CameraFeed handleLandmarkUpdate={(i) => setHandLandmark(i)} setGesture={setGesture} />
			</div>
		) : (<></>)}
		{page === 0 && (<ReciepeDisplay triggerTimerOpen={() => setPage(1)} />)}
		{page === 1 && (<TimerPage backButtonCallback={() => setPage(0)} />)}
	</>);
}
