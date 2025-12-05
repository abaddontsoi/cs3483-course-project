import {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
    useRef,
    useEffect,
} from 'react';

// 1. Define the shape of your context value
interface TimerType {
    buffer: string;
    setBuffer: Dispatch<SetStateAction<string>>;
    timeparts: TimeParts;
    setTimeParts: Dispatch<SetStateAction<TimeParts>>;
    selectedDigit: number;
    setSelectedDigit: Dispatch<SetStateAction<number>>;
    running: boolean;
    setRunning: Dispatch<SetStateAction<boolean>>;
    remainingSeconds: number;
    setRemainingSeconds: Dispatch<SetStateAction<number>>;
    intervalRef: React.MutableRefObject<number | null>;
    pad2: (n: number) => string;
    timePartsToSeconds: (tp: TimeParts) => number;
    bufferToTimeParts: (buffer: string) => TimeParts;
    secondsToTimeParts: (total: number) => TimeParts;
    handleNumberClick: (n: number) => void;
    handleSetClick: () => void;
    handleClearClick: () => void;
    timePartsToBuffer: (tp: TimeParts) => string;
    resetTimParts: () => void;
}

// 2. Create the context with proper typing (undefined initially)
const TimerContext = createContext<TimerType | undefined>(undefined);

// 3. Create the Provider component
interface TimerProviderProps {
    children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
    // Your state and logic here
    const [buffer, setBuffer] = useState<string>("000000")
    const [running, setRunning] = useState<boolean>(false)
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
    const [timeparts, setTimeParts] = useState<TimeParts>({ hours: 0, minutes: 0, seconds: 0 });
    const [selectedDigit, setSelectedDigit] = useState<number>(0);
    const intervalRef = useRef<number | null>(null)

    const pad2 = (n: number) => {
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

    const timePartsToBuffer = (t: TimeParts) => {
        return t.hours.toString() + t.minutes.toString() + t.seconds.toString();
    }

    const resetTimParts = () => {
        setTimeParts({
            seconds: 0,
            minutes: 0,
            hours: 0
        })
    }

    useEffect(() => {
        setBuffer(pad2(timeparts.hours).toString() + pad2(timeparts.minutes).toString() + pad2(timeparts.seconds).toString())
    }, [timeparts]);

    // Value that will be available everywhere
    const value: TimerType = {
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
        resetTimParts,
    };

    return (
        <TimerContext.Provider value={value}>
            {children}
        </TimerContext.Provider>
    );
}

// 4. Create a custom hook – THIS IS MANDATORY for clean usage
export function useTimerContext() {
    const context = useContext(TimerContext);

    // Safety check – helps catch bugs early
    if (context === undefined) {
        throw new Error('useTimerContext must be used within a TimerProvider');
    }

    return context;
}