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
    const [strokeCount, setStrokeCount] = useState(0); // 그린 획수 추적
    const [canvasKey, setCanvasKey] = useState(0); // 캔버스 재렌더링을 위한 키 값
    const canvasRef = useRef(null);

    const mazeSize = 20; // 미로 크기 (20x20)
    const cellSize = 25; // 각 셀의 크기 (px)

    // 글자가 변경될 때마다 상태 초기화 및 캔버스 리셋
    useEffect(() => {
        setStrokeCount(0);
        setCatPosition({ x: 0, y: 0 });

        // 캔버스를 완전히 리셋하고 초기화
        if (canvasRef.current) {
            canvasRef.current.clear(); // 캔버스를 초기화
            canvasRef.current.eraseAll(); // 사용자가 그린 그림도 모두 초기화
        }

        updateCanvas(); // 새로운 배경 이미지 업데이트
        setCanvasKey((prevKey) => prevKey + 1); // 캔버스 리렌더링을 위해 key 값 변경
    }, [targetWord]);

    // 배경 이미지를 업데이트하는 함수
    const updateCanvas = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 500;
        canvas.height = 500;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 초기화
        ctx.fillStyle = 'white'; // 배경을 흰색으로 설정하여 초기화
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '400px Arial';
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(targetWord, canvas.width / 2, canvas.height / 2);

        setBackgroundImage(canvas.toDataURL()); // 새로운 배경 이미지 설정
    };

    // 사용자가 글씨를 그릴 때마다 호출되는 함수
    const handleCanvasChange = () => {
        moveCat();
        if (!canvasRef.current) return;

        setStrokeCount((prevCount) => prevCount + 1); // 획수 증가
    };

    useEffect(() => {
        if (strokeCount > 0 && strokeCount % 2 === 0) {
            moveCat();
        }
    }, [strokeCount]);

    // 고양이의 랜덤 이동 로직
    const moveCat = () => {
        setCatPosition((prevPosition) => {
            const { x, y } = prevPosition;

            // 이동 가능한 방향 (상, 하, 좌, 우)
            const directions = [
                { x: x + 1, y },     // 오른쪽
                { x: x - 1, y },     // 왼쪽
                { x, y: y + 1 },     // 아래쪽
                { x, y: y - 1 }     // 위쪽
            ];

            // 미로 경계 체크: 미로 바깥으로 나가지 않도록 필터링
            const validDirections = directions.filter(
                (pos) => pos.x >= 0 && pos.x < mazeSize && pos.y >= 0 && pos.y < mazeSize
            );

            // 랜덤한 방향으로 이동
            const randomDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            return randomDirection;
        });
    };

    return (
        <div className={styles.container}>
            <h1>한글 따라 쓰기 게임</h1>

            {/* 글자 선택 드롭다운 */}
            <div className={styles.selectContainer}>
                <label htmlFor="letter-select">따라 쓸 글자 선택: </label>
                <select id="letter-select" value={targetWord} onChange={(e) => setTargetWord(e.target.value)}>
                    {/* 가~하 */}
                    <option value="가">가</option>
                    <option value="나">나</option>
                    <option value="다">다</option>
                    <option value="라">라</option>
                    <option value="마">마</option>
                    <option value="바">바</option>
                    <option value="사">사</option>
                    <option value="아">아</option>
                    <option value="자">자</option>
                    <option value="차">차</option>
                    <option value="카">카</option>
                    <option value="타">타</option>
                    <option value="파">파</option>
                    <option value="하">하</option>

                    {/* 고~호 */}
                    <option value="고">고</option>
                    <option value="노">노</option>
                    <option value="도">도</option>
                    <option value="로">로</option>
                    <option value="모">모</option>
                    <option value="보">보</option>
                    <option value="소">소</option>
                    <option value="오">오</option>
                    <option value="조">조</option>
                    <option value="초">초</option>
                    <option value="코">코</option>
                    <option value="토">토</option>
                    <option value="포">포</option>
                    <option value="호">호</option>
                </select>

            </div>

            <h2>따라 쓸 글자: {targetWord}</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* 캔버스 영역 */}
                <div style={{ border: '2px solid #333' }}>
                    <CanvasDraw
                        key={canvasKey} // 글자가 변경될 때마다 캔버스 강제 리렌더링
                        ref={canvasRef}
                        canvasWidth={500}
                        canvasHeight={500}
                        brushColor={'#000'}
                        brushRadius={4}
                        lazyRadius={0}
                        imgSrc={backgroundImage}
                        onChange={handleCanvasChange}
                    />
                </div>

                {/* 20x20 크기의 고양이 미로 */}
                <div className={styles.maze} style={{
                    position: 'relative',
                    width: mazeSize * cellSize,
                    height: mazeSize * cellSize,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${mazeSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${mazeSize}, ${cellSize}px)`
                }}>
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
                                    backgroundColor: rowIndex === catPosition.y && colIndex === catPosition.x ? '#FFDDC1' : 'white',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {rowIndex === catPosition.y && colIndex === catPosition.x && (
                                    <span role="img" aria-label="cat" style={{ fontSize: '18px' }}>
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
