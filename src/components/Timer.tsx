"use client";

import { useEffect, useRef, useState } from "react"

import "./timer.css";
import { useTimerContext } from "../contexts/TimerContext";
import clsx from "clsx";

interface TimerProps {
    backButtonCallback: () => void;
}

export default function Timer(props: TimerProps) {
    const {
        buffer,
        setBuffer,
        timeparts,
        setTimeParts,
        selectedDigit,
        setSelectedDigit,
        running,
        setRunning,
        remainingSeconds,
        setRemainingSeconds,
        intervalRef,
        pad2,
        timePartsToSeconds,
        bufferToTimeParts,
        secondsToTimeParts,
        handleNumberClick,
        handleSetClick,
        handleClearClick,
        timePartsToBuffer,
        resetTimeParts,
    } = useTimerContext();

    useEffect(() => {
        if (running) {
            if (intervalRef.current) window.clearInterval(intervalRef.current)
            intervalRef.current = window.setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        setRunning(false)
                        if (intervalRef.current) window.clearInterval(intervalRef.current)
                        intervalRef.current = null
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [running])

    useEffect(() => {
        if (remainingSeconds > 0) {
        }
    }, [remainingSeconds])

    const handleBackClick = () => {
        window.history.pushState({}, '', '/');
        props.backButtonCallback();
    }

    const timeParts = running ? secondsToTimeParts(remainingSeconds) : bufferToTimeParts(buffer)

    return (
        <div className="recipe-root">
            <div style={{ width: 1045, margin: "auto", }}>

                <div onClick={handleBackClick} className="back-button">
                    <button>◀</button>
                </div>

                <div className="number-display">
                    <div>
                        <div>
                            <span style={{
                                color: selectedDigit == 5 && !running ? 'green' : 'black'
                            }}>
                                {pad2(timeParts.hours)[0]}
                            </span>
                            <span style={{
                                color: selectedDigit == 4 && !running ? 'green' : 'black'
                            }}>
                                {pad2(timeParts.hours)[1]}
                            </span>
                        </div>
                        <div>Hour</div>
                    </div>
                    <div><div>:</div></div>
                    <div>
                        <div>
                            <span style={{
                                color: selectedDigit == 3 && !running ? 'green' : 'black'
                            }}>
                                {pad2(timeParts.minutes)[0]}
                            </span>
                            <span style={{
                                color: selectedDigit == 2 && !running ? 'green' : 'black'
                            }}>
                                {pad2(timeParts.minutes)[1]}
                            </span>
                        </div>
                        <div>Minutes</div>
                    </div>
                    <div><div>:</div></div>
                    <div>
                        <div>
                            <span style={{
                                color: selectedDigit == 1 && !running ? 'green' : 'black'
                            }}>
                                {pad2(timeParts.seconds)[0]}
                            </span>
                            <span style={{
                                color: selectedDigit == 0 && !running ? 'green' : 'black'
                            }}>
                                {pad2(timeParts.seconds)[1]}
                            </span>
                        </div>
                        <div>Seconds</div>
                    </div>
                </div>

                <div className="key-pad">
                    <div>{[0, 1, 2, 3, 4].map((n) => (<button key={n} onClick={() => { handleNumberClick(n) }}>{n.toString()}</button>))}<button onClick={handleSetClick}>Start</button></div>
                    <div>{[5, 6, 7, 8, 9].map((n) => (<button key={n} onClick={() => { handleNumberClick(n) }}>{n.toString()}</button>))}<button onClick={handleClearClick}>Clear</button></div>
                </div>

            </div>
        </div >
    )
}