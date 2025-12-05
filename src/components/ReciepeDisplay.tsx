"use client";

import { useEffect, useState } from "react";

import { IReciepe, getReciepe } from "@/src/ReciepeContent";
import { ReciepeBody } from "@/src/components/ReciepeBody";
import { ReciepeSelection } from "@/src/components/ReciepeSelection";

interface ReciepeDisplayProps {
    triggerTimerOpen: () => void;
    currentReciepeIndex: number;
    reciepeList: IReciepe[];
    currentReciepe?: IReciepe;
    setCurrentReciepe: (reciepe: IReciepe) => void;
    setCurrentReciepeIndex: (inx: number) => void;
    setReciepeList: (r: IReciepe[]) => void;
}

const ReciepeDisplay = (props: ReciepeDisplayProps) => {

    useEffect(() => {
        const fetchReciepe = async () => {
            const reciepeData = await getReciepe();
            props.setReciepeList(reciepeData);
            if (reciepeData.length > 0) {
                props.setCurrentReciepe(reciepeData[0]);
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
                currentReciepeIndex={props.currentReciepeIndex}
                reciepeList={props.reciepeList}
                setCurrentReciepe={props.setCurrentReciepe}
                setCurrentReciepeIndex={props.setCurrentReciepeIndex} />

            <div style={{ width: "10%", }}>
                <div className="timer-play">
                    <div className="play-triangle" onClick={(event) => {
                        // event.preventDefault()
                        // window.history.pushState({}, '', '/timer');
                        props.triggerTimerOpen();
                    }}>🕑</div>
                </div>
            </div>
        </div>

        {props.currentReciepe && <ReciepeBody reciepe={props.reciepeList[props.currentReciepeIndex]} />}
    </section>)
}

export default ReciepeDisplay;