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
	const [prevLandmark, setPrevLandmark] = useState<NormalizedLandmark | null>(null);
	const [gesture, setGesture] = useState<string>('none');

	const [velocityVector, setVelocityVector] = useState({ x: 0, y: 0 });

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
		if (landmark) {
			if (prevLandmark) {
				const dx = landmark.x - prevLandmark.x;
				const dy = landmark.y - prevLandmark.y;
				setVelocityVector({ x: dx, y: dy });
			}
		} else {
			setVelocityVector({ x: 0, y: 0 });
		}
		setPrevLandmark(landmark);
		console.log({
			currentHand: landmark,
			prev: prevLandmark,
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
			<div>
				Prev: {prevLandmark?.x} {prevLandmark?.y}
			</div>
			<div>
				Curr: {landmark?.x} {landmark?.y}
			</div>
			<div>
				V: {velocityVector.x} {velocityVector.y}
			</div>
			<ReciepeSelection
				currentReciepeIndex={currentReciepeIndex}
				reciepeList={reciepeList}
				setCurrentReciepe={setCurrentReciepe}
				setCurrentReciepeIndex={setCurrentReciepeIndex} />
			{currentReciepe && <ReciepeBody reciepe={reciepeList[currentReciepeIndex]} />}
		</section>
	</>);
}
