'use client';

import { useEffect, useRef, useState } from 'react';

export default function DrawPage() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState(null);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        setContext(ctx);

        // 창 크기가 변경될 때 캔버스 크기 재조정
        const handleResize = () => {
            canvas.width = window.innerWidth * 0.8;
            canvas.height = window.innerHeight * 0.8;
            redraw(); // 캔버스 내용 재그리기 (필요한 경우)
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (context) {
            context.strokeStyle = color;
        }
    }, [color, context]);

    useEffect(() => {
        if (context) {
            context.lineWidth = lineWidth;
        }
    }, [lineWidth, context]);

    const getEventPosition = (e) => {
        if (e.type.includes('mouse')) {
            return {
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY
            };
        } else if (e.type.includes('touch')) {
            const touch = e.nativeEvent.touches[0];
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        }
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        context.beginPath();
        context.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { x, y } = getEventPosition(e);
        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        context.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="lineWidth">브러시 두께: </label>
                <input
                    type="range"
                    id="lineWidth"
                    min="1"
                    max="20"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                />
            </div>
            <button onClick={clearCanvas} style={{ marginBottom: '10px' }}>
                캔버스 지우기
            </button>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                style={{ border: '1px solid #000', touchAction: 'none' }}
            />
        </div>
    );
}
