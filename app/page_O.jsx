// import Link from 'next/link';
// import { Card } from 'components/card';
// import { RandomQuote } from 'components/random-quote';
// import { Markdown } from 'components/markdown';
// import { ContextAlert } from 'components/context-alert';
// import { getNetlifyContext } from 'utils';
//
// const cards = [
//     //{ text: 'Hello', linkText: 'someLink', href: '/' }
// ];
//
// const contextExplainer = `
// The card below is rendered on the server based on the value of \`process.env.CONTEXT\`
// ([docs](https://docs.netlify.com/configure-builds/environment-variables/#build-metadata)):
// `;
//
// const preDynamicContentExplainer = `
// The card content below is fetched by the client-side from \`/quotes/random\` (see file \`app/quotes/random/route.js\`) with a different quote shown on each page load:
// `;
//
// const postDynamicContentExplainer = `
// On Netlify, Next.js Route Handlers are automatically deployed as [Serverless Functions](https://docs.netlify.com/functions/overview/).
// Alternatively, you can add Serverless Functions to any site regardless of framework, with acccess to the [full context data](https://docs.netlify.com/functions/api/).
//
// And as always with dynamic content, beware of layout shifts & flicker! (here, we aren't...)
// `;
//
// const ctx = getNetlifyContext();
//
// export default function Page() {
//     return (
//         <main className="flex flex-col gap-8 sm:gap-16">
//             <section className="flex flex-col items-start gap-3 sm:gap-4">
//                 <ContextAlert />
//                 <h1 className="mb-0">Learn Korean with Mario</h1>
//                 <p className="text-lg">Get started with Next.js and Netlify in seconds.</p>
//                 <Link
//                     href="https://docs.netlify.com/frameworks/next-js/overview/"
//                     className="btn btn-lg btn-primary sm:btn-wide"
//                 >
//                     Read the Docs
//                 </Link>
//             </section>
//             {!!ctx && (
//                 <section className="flex flex-col gap-4">
//                     <Markdown content={contextExplainer} />
//                     <RuntimeContextCard />
//                 </section>
//             )}
//             <section className="flex flex-col gap-4">
//                 <Markdown content={preDynamicContentExplainer} />
//                 <RandomQuote />
//                 <Markdown content={postDynamicContentExplainer} />
//             </section>
//             {/* !!cards?.length && <CardsGrid cards={cards} /> */}
//         </main>
//     );
// }
//
// function RuntimeContextCard() {
//     const title = `Netlify Context: running in ${ctx} mode.`;
//     if (ctx === 'dev') {
//         return <Card title={title} text="Next.js will rebuild any page you navigate to, including static pages." />;
//     } else {
//         return <Card title={title} text="This page was statically-generated at build time." />;
//     }
// }

'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';

// `react-canvas-draw`를 dynamic import하여 서버 사이드 렌더링 방지
const CanvasDraw = dynamic(() => import('react-canvas-draw'), { ssr: false });

export default function Home() {
    const [targetWord, setTargetWord] = useState('가');
    const [backgroundImage, setBackgroundImage] = useState('');
    const canvasRef = useRef(null);

    // 캔버스를 초기화하는 함수
    const clearCanvas = () => {
        canvasRef.current.clear();
    };

    // 정답 체크를 위한 함수 (아직 로직 구현 필요)
    const checkDrawing = () => {
        const dataUrl = canvasRef.current.canvasContainer.childNodes[1].toDataURL();
        alert('정답 체크 로직을 여기에 추가하세요!');
    };

    // `targetWord`가 변경될 때마다 가이드라인 이미지를 업데이트
    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 캔버스 설정
        canvas.width = 500;
        canvas.height = 500;
        ctx.font = '400px Arial';
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'; // 연한 색상으로 설정
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(targetWord, canvas.width / 2, canvas.height / 2);

        // 배경 이미지로 사용할 dataURL 생성
        setBackgroundImage(canvas.toDataURL());
    }, [targetWord]);

    return (
        <div className={styles.container}>
            <h1>한글 따라 쓰기 게임</h1>
            <h2>따라 쓸 글자: {targetWord}</h2>
            <div style={{ border: '2px solid #333', marginTop: '20px' }}>
                <CanvasDraw
                    ref={canvasRef}
                    canvasWidth={500}
                    canvasHeight={500}
                    brushColor={'#000'}
                    brushRadius={4}
                    lazyRadius={0}
                    imgSrc={backgroundImage} // 배경 이미지로 설정
                />
            </div>
            <button onClick={clearCanvas} className={styles.button}>
                다시 그리기
            </button>
            <button onClick={checkDrawing} className={styles.button}>
                정답 확인
            </button>
        </div>
    );
}
