'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';

// `react-canvas-draw`를 dynamic import하여 서버 사이드 렌더링 방지
const CanvasDraw = dynamic(() => import('react-canvas-draw'), { ssr: false });

export default function Home() {
    const [targetWord, setTargetWord] = useState('가');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [catPosition, setCatPosition] = useState({ x: 0, y: 0 });
    const [strokeCount, setStrokeCount] = useState(0); // 획수 상태
    const canvasRef = useRef(null);

    const mazeSize = 10; // 미로 크기 (10x10)
    const cellSize = 50; // 각 셀의 크기 (px)

    useEffect(() => {
        // 글자 변경 시 상태 초기화
        setStrokeCount(0);
        setCatPosition({ x: 0, y: 0 });
    }, [targetWord]);

    // 가이드라인을 업데이트할 때마다 호출
    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 500;
        canvas.height = 500;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
        ctx.font = '400px Arial';
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(targetWord, canvas.width / 2, canvas.height / 2);

        setBackgroundImage(canvas.toDataURL());
    }, [targetWord]);

    // 사용자가 글씨를 그릴 때마다 호출되는 함수
    const handleCanvasChange = () => {
        if (!canvasRef.current) return;

        // 변경 사항이 있을 때마다 상태 업데이트
        console.log('Canvas content changed!');
        setStrokeCount((prevCount) => prevCount + 1); // 획수 증가
    };

    // `strokeCount`가 변경될 때 고양이 위치를 업데이트
    useEffect(() => {
        console.log(`Current Stroke Count: ${strokeCount}`);
        if (strokeCount > 0 && strokeCount % 2 === 0) {
            moveCat();
        }
    }, [strokeCount]);

    // 고양이 이동 함수
    const moveCat = () => {
        setCatPosition((prevPosition) => {
            const { x, y } = prevPosition;
            if (x < mazeSize - 1) {
                return { x: x + 1, y }; // 오른쪽으로 한 칸 이동
            } else if (y < mazeSize - 1) {
                return { x: 0, y: y + 1 }; // 아래로 한 칸 이동
            } else {
                return prevPosition; // 더 이상 이동할 곳이 없으면 멈춤
            }
        });
        console.log(`New Cat Position: x=${catPosition.x}, y=${catPosition.y}`);
    };

    return (
        <div className={styles.container}>
            <h1>한글 따라 쓰기 게임</h1>

            <div className={styles.selectContainer}>
                <label htmlFor="letter-select">따라 쓸 글자 선택: </label>
                <select id="letter-select" value={targetWord} onChange={(e) => setTargetWord(e.target.value)}>
                    <option value="가">가</option>
                    <option value="나">나</option>
                    <option value="다">다</option>
                    <option value="라">라</option>
                    <option value="마">마</option>
                    <option value="바">바</option>
                    <option value="사">사</option>
                </select>
            </div>

            <h2>따라 쓸 글자: {targetWord}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ border: '2px solid #333' }}>
                    <CanvasDraw
                        ref={canvasRef}
                        canvasWidth={500}
                        canvasHeight={500}
                        brushColor={'#000'}
                        brushRadius={4}
                        lazyRadius={0}
                        imgSrc={backgroundImage}
                        onChange={handleCanvasChange} // 사용자가 그릴 때마다 호출
                    />
                </div>

                <div className={styles.maze}
                     style={{ position: 'relative', width: mazeSize * cellSize, height: mazeSize * cellSize }}>
                    {/* 미로의 각 셀 */}
                    {Array.from({ length: mazeSize }).map((_, rowIndex) =>
                        Array.from({ length: mazeSize }).map((_, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={styles.cell}
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    border: '1px solid #ddd',
                                    boxSizing: 'border-box',
                                    backgroundColor: rowIndex === catPosition.y && colIndex === catPosition.x ? '#FFDDC1' : 'white'
                                }}
                            >
                                {rowIndex === catPosition.y && colIndex === catPosition.x && (
                                    <span role="img" aria-label="cat" style={{ fontSize: '24px' }}>
                                        🐱
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <button onClick={() => canvasRef.current.clear()} className={styles.button}>
                다시 그리기
            </button>
        </div>
    );
}
