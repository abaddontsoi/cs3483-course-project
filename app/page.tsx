"use client";

import { useEffect, useRef, useState } from "react";
import { IReciepe, getReciepe } from "@/src/ReciepeContent";
import { ReciepeBody } from "@/src/components/ReciepeBody";
import { ReciepeSelection } from "@/src/components/ReciepeSelection";
import CameraFeed from "@/components/cameraFeed";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import TimerBody from "@/src/components/TimerBody";


export default function Home() {
	// 0 for recepies display, 1 for timer display
	const [page, setPage] = useState<number>(0);
	const [reciepeList, setReciepeList] = useState<IReciepe[]>([]);
	const [currentReciepe, setCurrentReciepe] = useState<IReciepe>();
	const [currentReciepeIndex, setCurrentReciepeIndex] = useState(0);

	const [landmark, setHandLandmark] = useState<NormalizedLandmark | null>(null);
	const prevLandmarkRef = useRef<NormalizedLandmark | null>(null);
	const [gesture, setGesture] = useState<string>('none');

	const [velocityVector, setVelocityVector] = useState({ x: 0, y: 0 });

	const [selectedDigit, setSelectedDigit] = useState<number>(0);

	useEffect(() => {
		const fetchReciepe = async () => {
			const reciepeData = await getReciepe();
			setReciepeList(reciepeData);
			if (reciepeData.length > 0) {
				setCurrentReciepe(reciepeData[0]);
			}
		}
		fetchReciepe();
	}, [])

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
		<section className="recipe-root">
			<CameraFeed handleLandmarkUpdate={handleLandmarkUpdate} setGesture={setGesture} />
			<div>{gesture}</div>
			<div>
				Prev: {prevLandmarkRef.current?.x?.toFixed(3)} {prevLandmarkRef.current?.y?.toFixed(3)}
			</div>
			<div>
				Curr: {landmark?.x?.toFixed(3)} {landmark?.y?.toFixed(3)}
			</div>
			<div>
				V: {velocityVector.x} {velocityVector.y}
			</div>
			{
				page == 0 && <>
					<ReciepeSelection
						currentReciepeIndex={currentReciepeIndex}
						reciepeList={reciepeList}
						setCurrentReciepe={setCurrentReciepe}
						setCurrentReciepeIndex={setCurrentReciepeIndex} />
					{currentReciepe && <ReciepeBody reciepe={reciepeList[currentReciepeIndex]} />}
				</>
			} 
			{
				page == 1 && <TimerBody />
			}
		</section>
	</>);
}
