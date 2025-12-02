// TimerBody.tsx
import React, { useState, useEffect } from 'react';

const DigitPair: React.FC<{ value: string; label: string }> = ({ value, label }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="flex">
                <span className="w-20 text-center font-bold text-9xl text-[#1f1f1f] tracking-tighter">
                    {value[0]}
                </span>
                <span className="w-20 text-center font-bold text-9xl text-[#1f1f1f] tracking-tighter">
                    {value[1]}
                </span>
            </div>
            <span className="mt-2 text-gray-500 text-xl font-medium">{label}</span>
        </div>
    );
};

const Colon: React.FC = () => (
    <div className="flex flex-col items-center justify-end h-48 pb-8">
        <span className="text-8xl font-bold text-[#1f1f1f] leading-none">:</span>
    </div>
);

const TriangleDown: React.FC = () => (
    <div className="w-0 h-0 mt-8 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[50px] border-t-black" />
);

const TopIcons: React.FC = () => (
    <div className="absolute top-6 right-6 flex gap-4 text-3xl text-gray-700">
        <i className="fa-regular fa-hand-peace cursor-pointer hover:text-black transition" />
        <i className="fa-regular fa-circle-question cursor-pointer hover:text-black transition" />
    </div>
);

const TimerBody: React.FC = () => {
    const [time, setTime] = useState(0);
    const [isRunning] = useState(true);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');

        return { h: pad(hours), m: pad(minutes), s: pad(seconds) };
    };

    const { h, m, s } = formatTime(time);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center relative p-8">
            <TopIcons />

            <div className="relative">
                {/* Main Timer Box */}
                <div className="bg-white border-4 border-gray-800 rounded-3xl px-12 py-10 shadow-xl">
                    <div className="flex items-end justify-center gap-4 md:gap-8">
                        <DigitPair value={h} label="Hour" />
                        <Colon />
                        <DigitPair value={m} label="Mins" />
                        <Colon />
                        <DigitPair value={s} label="Sec" />
                    </div>
                </div>

                {/* Downward Triangle */}
                <div className="flex justify-center">
                    <TriangleDown />
                </div>
            </div>
        </div>
    );
};

export default TimerBody;