"use client";

import { useEffect, useState } from "react";
import { IReciepe } from "../ReciepeContent";

export const ReciepeSelection = ({ currentReciepeIndex, setCurrentReciepeIndex, setCurrentReciepe, reciepeList }: {
    currentReciepeIndex: number;
    reciepeList: IReciepe[];
    setCurrentReciepe: (reciepe: IReciepe) => void;
    setCurrentReciepeIndex: (inx: number) => void
}) => {

    // const [currentReciepeIndex, setCurrentReciepeIndex] = useState(0);

    const handlePrevReciepeClick = () => {
        setCurrentReciepeIndex(currentReciepeIndex > 0 ? currentReciepeIndex - 1 : reciepeList.length - 1);
    }

    const handleNextReciepeClick = () => {
        setCurrentReciepeIndex(currentReciepeIndex < reciepeList.length - 1 ? currentReciepeIndex + 1 : 0);
    }

    useEffect(() => {
        setCurrentReciepe(reciepeList[currentReciepeIndex]);
    }, [currentReciepeIndex]);

    const carouselBtnStyle: React.CSSProperties = {
        background: "transparent",
        border: "none",
        fontSize: "48px",
        cursor: "pointer",
    };

    return (<div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '18px 0',
        borderTop: '6px solid #222',
        borderBottom: '6px solid #222',
        position: 'relative',
    }}>
        <button
            style={carouselBtnStyle}
            onClick={handlePrevReciepeClick}
        >◀</button>

        {reciepeList.map((r, idx) => (
            <div className={`thumbnails ${idx === currentReciepeIndex ? 'thumb-active' : ''}`} key={idx}>
                <div
                    key={idx}
                    className="thumb"
                    onClick={() => setCurrentReciepeIndex(idx)}
                >
                    <img src={r.image} alt={`thumb-${idx}`} />
                </div>
            </div>
        ))
        }
        <button
            style={carouselBtnStyle}
            onClick={handleNextReciepeClick}
        >▶</button>

        <div className="timer-play">
            <div className="play-triangle">🕑</div>
        </div>
    </div >)
}