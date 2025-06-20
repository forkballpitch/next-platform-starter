// 'use client';
// // src/App.js
// import { NavermapsProvider } from 'react-naver-maps';

// import dynamic from 'next/dynamic';
// const NaverMapsMarkerCluster = dynamic(() => import('./components/NaverMapsMarkerCluster'), { ssr: false });

// function App() {
//     // ncpClientId에 네이버 지도 API 클라이언트 키를 넣으면 된다.
//     // npx create-react-app으로 프로젝트를 생성했다면-별도의 의존성 설치 없이-프로젝트 최상위 폴더에 .env 파일을 생성하고 키를 기입하면 된다.
//     // .env에는 REACT_APP_NAVER_KEY의 값으로 키를 기입하면 되는데, REACT_APP_라는 prefix에 유의 하자!
//     const naverKey = 'u7amr5n722';

//     return (
//         <NavermapsProvider
//             ncpKeyId={naverKey} // 지도서비스 Client ID
//             error={<p>error</p>}
//             loading={<p>Maps Loading</p>}
//         >
//             <div style={{ display: 'flex', width: '100dvw', height: '100dvh' }}>
//                 <NaverMapsMarkerCluster />
//             </div>
//         </NavermapsProvider>
//     );
// }

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RssList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    useEffect(() => {
        const fetchRss = async () => {
            try {
                const res = await fetch('/api/rss');
                const text = await res.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'application/xml');
                const parsedItems = Array.from(xml.querySelectorAll('item')).map((item) => ({
                    title: item.querySelector('title')?.textContent ?? '',
                    link: item.querySelector('link')?.textContent ?? '',
                    slug: item.querySelector('link')?.textContent.split('/').pop() ?? '',
                    pubDate: item.querySelector('pubDate')?.textContent ?? ''
                }));
                setItems(parsedItems);
            } catch (err) {
                console.error('RSS fetch error:', err);
            } finally {
                setLoading(false); // 완료 시 로딩 false
            }
        };

        fetchRss();
    }, []);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>📰 RSS 목록</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" />
                    <p>로딩 중입니다...</p>
                </div>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.slug} style={{ margin: '1rem 0' }}>
                            <Link href={`/screen/rss/${item.slug}`}>
                                <span style={{ cursor: 'pointer', fontSize: '1.1rem', color: 'blue' }}>
                                    {item.title}
                                </span>
                            </Link>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.pubDate}</div>
                        </li>
                    ))}
                </ul>
            )}

            {/* 간단한 CSS */}
            <style jsx>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto;
                    border: 5px solid lightgray;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
