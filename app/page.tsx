"use client";

import { useEffect, useRef, useState } from "react";

import ReciepeDisplay from "@/src/components/ReciepeDisplay";
import TimerPage from "./timer/page";

import CameraWindow from "@/src/components/CameraWindow";
import CameraFeed from "@/src/components/cameraFeed";

import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { IReciepe } from "@/src/ReciepeContent";
import { TimerProvider } from "@/src/contexts/TimerContext";
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

	const [buffer, setBuffer] = useState<string>("000000");
	// 0 => 1 => 2 maps tp sec => min => hour
	const [selectedDigit, setSelectedDigit] = useState<number>(0);
	const [running, setRunning] = useState<boolean>(false);
	const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
	const intervalRef = useRef<number | null>(null);
	const [timeParts, setTimeParts] = useState<TimeParts>({
		hours: 0,
		minutes: 0,
		seconds: 0,
	})
	// const timeParts = running ? secondsToTimeParts(remainingSeconds) : bufferToTimeParts(buffer)

	useEffect(() => {
		if (remainingSeconds > 0) {
			setBuffer("")
		}
	}, [remainingSeconds])

	useEffect(() => {
		if (running) {
			if (intervalRef.current) window.clearInterval(intervalRef.current)
			intervalRef.current = window.setInterval(() => {
				setRemainingSeconds((prev) => {
					if (prev <= 1) {
						setRunning(false)
						if (intervalRef.current) window.clearInterval(intervalRef.current);
						intervalRef.current = null;
						resetTimParts();
						return 0;
					}
					return prev - 1
				});
			}, 1000);
		}

		return () => {
			if (intervalRef.current) window.clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}, [running])

	function pad2(n: number): string {
		return n.toString().padStart(2, "0")
	}

	function resetTimParts() {
		setTimeParts({
			seconds: 0,
			minutes: 0,
			hours: 0
		})
	}

	// function bufferToTimeParts(buffer: string): TimeParts {
	// 	// buffer contains up to 6 digits representing HHMMSS (right-aligned)
	// 	// const padded = buffer.padStart(6, "0")
	// 	const padded = buffer.slice(-6);
	// 	const h = parseInt(padded.slice(0, 2), 10);
	// 	const m = parseInt(padded.slice(2, 4), 10);
	// 	const s = parseInt(padded.slice(4, 6), 10);
	// 	// const h = parseInt(buffer.slice(0, 2), 10);
	// 	// const m = parseInt(buffer.slice(2, 4), 10);
	// 	// const s = parseInt(buffer.slice(4, 6), 10);
	// 	return { hours: isNaN(h) ? 0 : h, minutes: isNaN(m) ? 0 : m, seconds: isNaN(s) ? 0 : s }
	// }

	function timePartsToSeconds(tp: TimeParts): number {
		return tp.hours * 3600 + tp.minutes * 60 + tp.seconds
	}

	// function secondsToTimeParts(total: number): TimeParts {
	// 	const clamped = Math.max(0, Math.floor(total))
	// 	const hours = Math.floor(clamped / 3600)
	// 	const minutes = Math.floor((clamped % 3600) / 60)
	// 	const seconds = clamped % 60
	// 	return { hours, minutes, seconds }
	// }

	function timePartsToBuffer(t: TimeParts): string {
		return t.hours.toString() + t.minutes.toString() + t.seconds.toString();
	}

	// const handleNumberClick = (bufferstring: string) => {
	// 	if (running) { return };
	// 	setBuffer(bufferstring);
	// 	setTimeParts(bufferToTimeParts(buffer));
	// 	console.log(buffer);
	// }

	const handleSetClick = () => {
		// const secs = timePartsToSeconds(bufferToTimeParts(buffer));
		const secs = timePartsToSeconds(timeParts);
		if (secs > 0) {
			setRemainingSeconds(secs)
			setRunning(true)
		}
	}

	const handleClearClick = () => {
		// Reset timer
		setBuffer("")
		setTimeParts({
			seconds: 0,
			minutes: 0,
			hours: 0,
		})
		setRunning(false)
		setRemainingSeconds(0)
		if (intervalRef.current) {
			window.clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	useEffect(() => {
		if (confirm("open cammera window?")) {
			setOpenCammeraFeed(true); return;
		}
		// setTimeParts(bufferToTimeParts(buffer));
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

						timePartsToSeconds(timeParts);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.y > 0.2) {
						// Decrease selected digit 
						switch (selectedDigit) {
							case 0:
								setTimeParts(prev => {
									return {
										seconds: (prev.seconds - 1) % 60,
										minutes: prev.minutes,
										hours: prev.hours
									}
								})
								break;
							case 1:
								setTimeParts(prev => {
									return {
										seconds: (prev.seconds - 10) % 60,
										minutes: prev.minutes,
										hours: prev.hours
									}
								})
								break;
							case 2:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: (prev.minutes - 1) % 60,
										hours: prev.hours,
									}
								})
								break;
							case 3:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: (prev.minutes - 10) % 60,
										hours: prev.hours,
									}
								})
								break;
							case 4:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes,
										hours: (prev.hours - 1) % 24,
									}
								})
								break;
							case 5:
								setTimeParts(prev => {
									return {
										seconds: prev.seconds,
										minutes: prev.minutes,
										hours: (prev.hours - 10) % 24,
									}
								})
								break;
							default:
								break;
						}
						timePartsToSeconds(timeParts);
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.x > 0.2) {
						// Move indicator right
						setSelectedDigit(prev => (prev + 1) % 6)
						prevLandmarkRef.current = null;
						setHandLandmark(null);
						setVelocityVector({ x: 0, y: 0 });
					} else if (velocityVector.x < -0.2) {
						// Move indicator left
						setSelectedDigit(prev => (prev - 1) % 6)
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
			<TimerProvider>
				<Timer
					timeParts={timeParts}
					selectedDigit={selectedDigit}
					backButtonCallback={() => setPage(0)}
				/>
			</TimerProvider>
		)}
	</>);
}
export default Home;