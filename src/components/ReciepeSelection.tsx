"use client";

import { useEffect, useState } from "react";
import { IReciepe } from "../ReciepeContent";

export const ReciepeSelection = ({ setCurrentReciepe, reciepeList }: {
    reciepeList: IReciepe[];
    setCurrentReciepe: (reciepe: IReciepe) => void;
}) => {

    const [currentReciepeIndex, setCurrentReciepeIndex] = useState(0);

    const handlePrevReciepeClick = () => {
        setCurrentReciepeIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : reciepeList.length - 1));
    }

    const handleNextReciepeClick = () => {
        setCurrentReciepeIndex((prevIndex) => (prevIndex < reciepeList.length - 1 ? prevIndex + 1 : 0));
    }

    useEffect(() => {
        setCurrentReciepe(reciepeList[currentReciepeIndex]);
    }, [currentReciepeIndex]);

    const carouselBtnStyle: React.CSSProperties = {
        background: "transparent",
        border: "none",
        fontSize: "28px",
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
            <div className={`thumbnails ${idx === currentReciepeIndex ? 'active' : ''}`} key={idx}>
                <div key={idx} className="thumb">
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