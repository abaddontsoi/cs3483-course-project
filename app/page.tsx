"use client";

import { useEffect, useRef, useState } from "react";
import { IReciepe, getReciepe } from "@/src/ReciepeContent";
import { ReciepeBody } from "@/src/components/ReciepeBody";
import { ReciepeSelection } from "@/src/components/ReciepeSelection";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import TimerBody from "@/src/components/TimerBody";
import { CameraWindow } from "@/components/CameraWindow";
import CameraFeed from "@/components/cameraFeed";
import { Hind_Madurai } from "next/font/google";


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

	useEffect(() => {
		const openCammerWindowAlert = async () => {
			const result: boolean = confirm("open cammera window?");
			if (result) {
				setOpenCammeraFeed(true);
				return
			}
		}

		const fetchReciepe = async () => {
			const reciepeData = await getReciepe();
			setReciepeList(reciepeData);
			if (reciepeData.length > 0) {
				setCurrentReciepe(reciepeData[0]);
			}
		}
		fetchReciepe();
		openCammerWindowAlert();
	}, [])

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

		<section className="recipe-root">
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
