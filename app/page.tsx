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

	const handleLandmarkUpdate = (newLandmark: NormalizedLandmark) => {
		setHandLandmark(newLandmark);
	};

	return (<>
		<section className="recipe-root">
			<CameraFeed handleLandmarkUpdate={handleLandmarkUpdate} setGesture={setGesture} />
			<div>{gesture}</div>
			<ReciepeSelection reciepeList={reciepeList} setCurrentReciepe={setCurrentReciepe} />
			{currentReciepe && <ReciepeBody reciepe={currentReciepe} />}
		</section>
	</>);
}
