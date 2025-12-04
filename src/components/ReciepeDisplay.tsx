"use client";

import { useEffect, useState } from "react";

import { IReciepe, getReciepe } from "@/src/ReciepeContent";
import { ReciepeBody } from "@/src/components/ReciepeBody";
import { ReciepeSelection } from "@/src/components/ReciepeSelection";

const ReciepeDisplay = ({ triggerTimerOpen }: {
    triggerTimerOpen: () => void;
}) => {
    const [reciepeList, setReciepeList] = useState<IReciepe[]>([]);
    const [currentReciepe, setCurrentReciepe] = useState<IReciepe>();
    const [currentReciepeIndex, setCurrentReciepeIndex] = useState(0);

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

    return (<section className="recipe-root">
        <div style={{
            display: 'flex',
            alignItems: 'center',
            borderTop: '6px solid #222',
            borderBottom: '6px solid #222',
            position: 'relative',
        }}>
            <ReciepeSelection
                currentReciepeIndex={currentReciepeIndex}
                reciepeList={reciepeList}
                setCurrentReciepe={setCurrentReciepe}
                setCurrentReciepeIndex={setCurrentReciepeIndex} />

            <div style={{ width: "10%", }}>
                <div className="timer-play">
                    <div className="play-triangle" onClick={(event) => {
                        event.preventDefault()
                        window.history.pushState({}, '', '/timer');
                        triggerTimerOpen();
                    }}>🕑</div>
                </div>
            </div>
        </div>

        {currentReciepe && <ReciepeBody reciepe={reciepeList[currentReciepeIndex]} />}
    </section>)
}

export default ReciepeDisplay;