// app/draw/page.jsx

'use client';

import { useEffect, useRef, useState } from 'react';

export default function DrawPage() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [color, setColor] = useState('#000000');

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        setContext(ctx);
    }, []);

    useEffect(() => {
        if (context) {
            context.strokeStyle = color;
        }
    }, [color, context]);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        context.closePath();
        setIsDrawing(false);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>그림 그리기</h1>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="colorPicker">브러시 색상 선택: </label>
                <input
                    type="color"
                    id="colorPicker"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ border: '1px solid #000' }}
            />
        </div>
    );
}
