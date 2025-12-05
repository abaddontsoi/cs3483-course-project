import {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
    useRef,
} from 'react';

// 1. Define the shape of your context value
interface TimerType {
    buffer: string;
    setBuffer: Dispatch<SetStateAction<string>>;
    timeparts: TimeParts;
    setTimeParts: Dispatch<SetStateAction<TimeParts>>;
    running: boolean;
    setRunning: Dispatch<SetStateAction<boolean>>;
    remainingSeconds: number;
    setRemainingSeconds: Dispatch<SetStateAction<number>>;
    intervalRef: React.MutableRefObject<number | null>;
}

// 2. Create the context with proper typing (undefined initially)
const TimerContext = createContext<TimerType | undefined>(undefined);

// 3. Create the Provider component
interface TimerProviderProps {
    children: ReactNode;
}

export function TimerProvider({ children }: TimerProviderProps) {
    // Your state and logic here
    const [buffer, setBuffer] = useState<string>("")
    const [running, setRunning] = useState<boolean>(false)
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
    const [timeparts, setTimeParts] = useState<TimeParts>({ hours: 0, minutes: 0, seconds: 0 });
    const intervalRef = useRef<number | null>(null)

    const someFunction = () => {
        console.log('Called from anywhere in the app!');
    };

    // Value that will be available everywhere
    const value: TimerType = {
        buffer,
        setBuffer,
        timeparts,
        setTimeParts,
        running,
        setRunning,
        remainingSeconds,
        setRemainingSeconds,
        intervalRef,
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