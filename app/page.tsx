"use client";

import { useEffect, useRef, useState } from "react";
import { IReciepe, getReciepe } from "@/src/ReciepeContent";
import { ReciepeBody } from "@/src/components/ReciepeBody";
import { ReciepeSelection } from "@/src/components/ReciepeSelection";
import CameraFeed from "@/components/cameraFeed";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";


export default function Home() {

	const [reciepeList, setReciepeList] = useState<IReciepe[]>([]);
	const [currentReciepe, setCurrentReciepe] = useState<IReciepe>();
	const [currentReciepeIndex, setCurrentReciepeIndex] = useState(0);

	const [landmark, setHandLandmark] = useState<NormalizedLandmark | null>(null);
	const [gesture, setGesture] = useState<string>('none');

	const prevLandmarkRef = useRef<NormalizedLandmark | null>(null);

	const [velocityVector, setVelocityVector] = useState({ x: 0, y: 0 });
	const [horizontalDir, setHorizontalDir] = useState<string>("Staying");
	const [verticalDir, setVerticalDir] = useState<string>("Staying");

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
		const current = landmark;
		const previous = prevLandmarkRef.current;

		if (current) {
			// Hand is detected
			if (previous) {
				const dx = current.x - previous.x;
				const dy = current.y - previous.y;

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
			} else {
				// First time hand appears
				setHorizontalDir("Staying");
				setVerticalDir("Staying");
				setVelocityVector({ x: 0, y: 0 });
			}

			// Always update previous for next frame
			prevLandmarkRef.current = current;

		} else {
			prevLandmarkRef.current = null;
			setVelocityVector({ x: 0, y: 0 });
			setHorizontalDir("No hand");
			setVerticalDir("No hand");
		}
		console.log({
			currentHand: current,
			prev: prevLandmarkRef.current,
		});
	}, [landmark]);

	useEffect(() => {
		if (gesture === 'Open_Palm' && velocityVector.x > 0.2) {
			setCurrentReciepeIndex(prev => prev < reciepeList.length - 1 ? prev + 1 : 0);
		} else if (gesture === 'Open_Palm' && velocityVector.x < -0.2) {
			setCurrentReciepeIndex(prev => prev > 0 ? prev - 1 : reciepeList.length - 1);
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
			<ReciepeSelection
				currentReciepeIndex={currentReciepeIndex}
				reciepeList={reciepeList}
				setCurrentReciepe={setCurrentReciepe}
				setCurrentReciepeIndex={setCurrentReciepeIndex} />
			{currentReciepe && <ReciepeBody reciepe={reciepeList[currentReciepeIndex]} />}
		</section>
	</>);
}
