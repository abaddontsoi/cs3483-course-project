'use client';
import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const CameraFeed: React.FC = () => {

    return (
        <div style={{ position: 'relative', width: '640px', height: '480px' }}>
            <Webcam />
        </div>
    );
};

export default CameraFeed;