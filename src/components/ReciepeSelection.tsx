"use client";

import { useEffect, useState } from "react";
import { IReciepe } from "../ReciepeContent";

export const ReciepeSelection = ({ currentReciepeIndex, setCurrentReciepeIndex, setCurrentReciepe, reciepeList }: {
    currentReciepeIndex: number;
    reciepeList: IReciepe[];
    setCurrentReciepe: (reciepe: IReciepe) => void;
    setCurrentReciepeIndex: (inx: number) => void
}) => {
    const handlePrevReciepeClick = () => {
        setCurrentReciepeIndex(currentReciepeIndex > 0 ? currentReciepeIndex - 1 : reciepeList.length - 1);
    }

    const handleNextReciepeClick = () => {
        setCurrentReciepeIndex(currentReciepeIndex < reciepeList.length - 1 ? currentReciepeIndex + 1 : 0);
    }

    useEffect(() => {
        setCurrentReciepe(reciepeList[currentReciepeIndex]);
    }, [currentReciepeIndex]);

    return (<div style={{
        padding: '16px 16px 16px 0',
        // padding: '16px 0',
        borderRight: '6px solid #222',
        display: 'flex',
        paddingRight: '16px',
        width: "90%",
    }}>
        <div
            className="nav-triangle-l"
            style={{
                display: "flex",
                width: "3%"
            }}
            onClick={handlePrevReciepeClick}
        />
        <div style={{
            display: "flex",
            width: "94%",
            justifyContent: "space-between",
            padding: "0 40px",
        }}>
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
            ))}
        </div>

        <div
            className="nav-triangle-r"
            style={{
                display: "flex",
                width: "3%"
            }}
            onClick={handleNextReciepeClick}
        />
    </div>)
}