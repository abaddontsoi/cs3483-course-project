"use client";

import { useEffect, useRef, useState } from "react";

import ReciepeDisplay from "@/src/components/ReciepeDisplay";

import CameraWindow from "@/src/components/CameraWindow";
import CameraFeed from "@/src/components/cameraFeed";

import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { IReciepe } from "@/src/ReciepeContent";
import { TimerProvider, useTimerContext } from "@/src/contexts/TimerContext";
import Timer from "@/src/components/Timer";

const Home = () => {
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

	const {
		buffer,
		setBuffer,
		timeparts,
		setTimeParts,
		selectedDigit,
        setSelectedDigit,
		running,
		setRunning,
		remainingSeconds,
		setRemainingSeconds,
		intervalRef,
		pad2,
		timePartsToSeconds,
		bufferToTimeParts,
		secondsToTimeParts,
		handleNumberClick,
		handleSetClick,
		handleClearClick,
		timePartsToBuffer,
		resetTimeParts,
	} = useTimerContext();


	useEffect(() => {
		if (confirm("open cammera window?")) {
			setOpenCammeraFeed(true); return;
		}
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
					if (velocityVector.y < -0.2) {
						// Increase selected digit 
						switch (selectedDigit) {
							case 0:
								setTimeParts(prev => {
									return {
										seconds: (prev.seconds + 1) % 60,
										minutes: prev.minutes,
										hours: prev.hours
									}
								})
								break;
							case 1:
								setTimeParts(prev => {
									return {
										seconds: (prev.seconds + 10) % 60,
										minutes: prev.minutes,
										hours: prev.hours
									}
								})
								break;
							case 2:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: (prev.minutes + 1) % 60,
										hours: prev.hours,
									}
								})
								break;
							case 3:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: (prev.minutes + 10) % 60,
										hours: prev.hours,
									}
								})
								break;
							case 4:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes,
										hours: (prev.hours + 1) % 24,
									}
								})
								break;
							case 5:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes,
										hours: (prev.hours + 10) % 24,
									}
								})
								break;
							default:
								break;
						}
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.y > 0.2) {
						// Decrease selected digit 
						switch (selectedDigit) {
							case 0:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds == 0 ? 59 : prev.seconds - 1 ,
										minutes: prev.minutes,
										hours: prev.hours
									}
								})
								break;
							case 1:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds < 10 ? 60 + prev.seconds -10 : prev.seconds - 10,
										minutes: prev.minutes,
										hours: prev.hours
									}
								})
								break;
							case 2:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes == 0 ? 59: prev.minutes - 1,
										hours: prev.hours,
									}
								})
								break;
							case 3:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes < 10 ? 60 + prev.minutes - 10: prev.minutes - 10,
										hours: prev.hours,
									}
								})
								break;
							case 4:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes,
										hours: prev.hours == 0 ? 23 : prev.hours - 1,
									}
								})
								break;
							case 5:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes,
										hours: prev.hours - 10 ? 24 + prev.hours - 10 : prev.hours - 10,
									}
								})
								break;
							default:
								break;
						}
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.x > 0.2) {
						// Move indicator right
						setSelectedDigit(prev => prev == 0 ? 5 : prev - 1)
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.x < -0.2) {
						// Move indicator left
						setSelectedDigit(prev => prev == 5 ? 0 : prev + 1)
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					}
				}
				break;
			case 'Thumb_Up':
				if (page == 1) {
					handleSetClick()
					prevLandmarkRef.current = null;
				}
				break;
			case 'Thumb_Down':
				if (page == 1) {
					handleClearClick()
					prevLandmarkRef.current = null;
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
		{page === 1 && (
			<Timer
				backButtonCallback={() => setPage(0)}
			/>
		)}
	</>);
}
export default Home;