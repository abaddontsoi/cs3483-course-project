"use client";

import { useEffect, useRef, useState } from "react";

import ReciepeDisplay from "@/src/components/ReciepeDisplay";
import TimerPage from "./timer/page";

import CameraWindow from "@/src/components/CameraWindow";
import CameraFeed from "@/src/components/cameraFeed";

import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { IReciepe } from "@/src/ReciepeContent";


export default function Home() {
	// 0 for recepies display, 1 for timer display
	const [page, setPage] = useState<number>(0);
	const [reciepeList, setReciepeList] = useState<IReciepe[]>([]);
	const [currentReciepe, setCurrentReciepe] = useState<IReciepe>();
	const [currentReciepeIndex, setCurrentReciepeIndex] = useState(0);

	const [openCammeraFeed, setOpenCammeraFeed] = useState(false);
	const [userCameraConfim, setUserCameraConfirm] = useState(false);

	const [landmark, setHandLandmark] = useState<NormalizedLandmark | null>(null);
	const [gesture, setGesture] = useState<string>('none');
	const prevLandmarkRef = useRef<NormalizedLandmark | null>(null);

	const [velocityVector, setVelocityVector] = useState({ x: 0, y: 0 });

	useEffect(() => {
		if (confirm("open cammera window?")) { setOpenCammeraFeed(true); return; }
	}, []);

	useEffect(() => {
		if (landmark != null) {
			if (prevLandmarkRef.current != null) {
				const dx = landmark.x - prevLandmarkRef.current.x;
				const dy = landmark.y - prevLandmarkRef.current.y;
				setVelocityVector({ x: dx, y: dy });
			} else {
				setVelocityVector({ x: 0, y: 0 });
			}
		} else {
			setVelocityVector({ x: 0, y: 0 });
		}

		prevLandmarkRef.current = landmark;

		console.log({
			current: landmark,
			previous: prevLandmarkRef.current,
		});
	}, [landmark]);

	useEffect(() => {
		switch (gesture) {
			case 'Open_Palm':
				// Switch page
				if (Math.abs(velocityVector.x) > 0.2) {
					setPage(prev => prev == 0 ? 1 : 0)
					prevLandmarkRef.current = null;
					setHandLandmark(null);
					setVelocityVector({ x: 0, y: 0 });
				}

				// Scrolling
				if (page == 0) {
					if (velocityVector.y > 0.2) {
						// setCurrentReciepeIndex(prev => prev < reciepeList.length - 1 ? prev + 1 : 0);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.y < -0.2) {
						// setCurrentReciepeIndex(prev => prev > 0 ? prev - 1 : reciepeList.length - 1);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					}
				}
				break;
			case 'Closed_Fist':
				// Recepies page
				if (page == 0) {
					if (velocityVector.y > 0.2) {
						setCurrentReciepeIndex(prev => prev < reciepeList.length - 1 ? prev + 1 : 0);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.y < -0.2) {
						setCurrentReciepeIndex(prev => prev > 0 ? prev - 1 : reciepeList.length - 1);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					}
				} else if (page == 1) {
					if (velocityVector.y > 0.2) {
						setCurrentReciepeIndex(prev => prev < reciepeList.length - 1 ? prev + 1 : 0);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.y < -0.2) {
						setCurrentReciepeIndex(prev => prev > 0 ? prev - 1 : reciepeList.length - 1);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					}
				}
				break;
			case 'Thumb_Up':
				if (page == 1) {

				}
				break;
			case 'Thumb_Down':
				if (page == 1) {

				}
				break;
			default:
				break;
		}
		console.log(velocityVector);
	}, [velocityVector]);

	const handleLandmarkUpdate = (newLandmark: NormalizedLandmark | null) => {
		setHandLandmark(newLandmark);
	};

	return (<>
		{openCammeraFeed ? (
			<CameraWindow>
				<CameraFeed handleLandmarkUpdate={handleLandmarkUpdate} setGesture={setGesture} />
			</CameraWindow>
		) : userCameraConfim ? (
			<div style={{ display: "hidden" }}>
				<CameraFeed handleLandmarkUpdate={handleLandmarkUpdate} setGesture={setGesture} />
			</div>
		) : (<></>)}
		{page === 0 && (<ReciepeDisplay
			triggerTimerOpen={() => setPage(1)}
			currentReciepeIndex={currentReciepeIndex}
			reciepeList={reciepeList}
			currentReciepe={currentReciepe}
			setCurrentReciepe={setCurrentReciepe}
			setCurrentReciepeIndex={setCurrentReciepeIndex}
			setReciepeList={setReciepeList} />)}
		{page === 1 && (<TimerPage backButtonCallback={() => setPage(0)} />)}
	</>);
}
