"use client";

import { useEffect, useRef, useState } from "react"

import "./timer.css";

interface TimerPageProps {
    timeParts: TimeParts;
    selectedDigit: number;
    backButtonCallback: () => void;
}

function pad2(n: number): string {
    return n.toString().padStart(2, "0")
}

function bufferToTimeParts(buffer: string): TimeParts {
    // buffer contains up to 6 digits representing HHMMSS (right-aligned)
    const padded = buffer.padStart(6, "0")
    const h = parseInt(padded.slice(0, 2), 10)
    const m = parseInt(padded.slice(2, 4), 10)
    const s = parseInt(padded.slice(4, 6), 10)
    return { hours: isNaN(h) ? 0 : h, minutes: isNaN(m) ? 0 : m, seconds: isNaN(s) ? 0 : s }
}

function timePartsToSeconds(tp: TimeParts): number {
    return tp.hours * 3600 + tp.minutes * 60 + tp.seconds
}

function secondsToTimeParts(total: number): TimeParts {
    const clamped = Math.max(0, Math.floor(total))
    const hours = Math.floor(clamped / 3600)
    const minutes = Math.floor((clamped % 3600) / 60)
    const seconds = clamped % 60
    return { hours, minutes, seconds }
}

function timePartsToBuffer(t: TimeParts): string {
    return t.hours.toString() + t.minutes.toString() + t.seconds.toString();
}

export default function Timer(props: TimerPageProps) {
    const [buffer, setBuffer] = useState<string>("")
    const [running, setRunning] = useState<boolean>(false)
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
    const intervalRef = useRef<number | null>(null)

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

    const handleBackClick = () => {
        window.history.pushState({}, '', '/');
        props.backButtonCallback();
    }

    const handleNumberClick = (n: number) => {
        if (running) { return };
        setBuffer((b) => (b + n.toString()).slice(-6));
    }

    const handleSetClick = () => {
        const secs = timePartsToSeconds(bufferToTimeParts(buffer))
        if (secs > 0) {
            setRemainingSeconds(secs)
            setRunning(true)
        }
    }

    const handleClearClick = () => {
        setBuffer("")
        setRunning(false)
        setRemainingSeconds(0)
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    useEffect(() => {
        if (remainingSeconds > 0) setBuffer("")
    }, [remainingSeconds])

    const timeParts = running ? secondsToTimeParts(remainingSeconds) : bufferToTimeParts(buffer)

    return (
        <div className="recipe-root">
            <div style={{ width: 1045, margin: "auto", }}>

                <div onClick={handleBackClick} className="back-button">
                    <button>◀</button>
                </div>

                <div className="number-display">
                    <div>
                        <div>{pad2(timeParts.hours)[0]}{pad2(timeParts.hours)[1]}</div>
                        <div>Hour</div>
                    </div>
                    <div><div>:</div></div>
                    <div>
                        <div>{pad2(timeParts.minutes)[0]}{pad2(timeParts.minutes)[1]}</div>
                        <div>Minutes</div>
                    </div>
                    <div><div>:</div></div>
                    <div>
                        <div>{pad2(timeParts.seconds)[0]}{pad2(timeParts.seconds)[1]}</div>
                        <div>Seconds</div>
                    </div>
                </div>

                <div className="key-pad">
                    <div>{[0, 1, 2, 3, 4].map((n) => (<button key={n} onClick={() => { handleNumberClick(n) }}>{n.toString()}</button>))}<button onClick={handleSetClick}>Start</button></div>
                    <div>{[5, 6, 7, 8, 9].map((n) => (<button key={n} onClick={() => { handleNumberClick(n) }}>{n.toString()}</button>))}<button onClick={handleClearClick}>Clear</button></div>
                </div>

            </div>
        </div>
    )
}