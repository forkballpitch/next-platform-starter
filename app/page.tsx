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

//여기는 티스토리
// 'use client';

// import Link from 'next/link';
// import { useEffect, useState } from 'react';

// export default function RssList() {
//     const [items, setItems] = useState([]);
//     const [loading, setLoading] = useState(true); // 로딩 상태 추가

//     useEffect(() => {
//         const fetchRss = async () => {
//             try {
//                 const res = await fetch('/api/rss');
//                 const text = await res.text();
//                 const parser = new DOMParser();
//                 const xml = parser.parseFromString(text, 'application/xml');
//                 const parsedItems = Array.from(xml.querySelectorAll('item')).map((item) => ({
//                     title: item.querySelector('title')?.textContent ?? '',
//                     link: item.querySelector('link')?.textContent ?? '',
//                     slug: item.querySelector('link')?.textContent.split('/').pop() ?? '',
//                     pubDate: item.querySelector('pubDate')?.textContent ?? ''
//                 }));
//                 setItems(parsedItems);
//             } catch (err) {
//                 console.error('RSS fetch error:', err);
//             } finally {
//                 setLoading(false); // 완료 시 로딩 false
//             }
//         };

//         fetchRss();
//     }, []);

//     return (
//         <div style={{ padding: '1rem' }}>
//             <h2>📰 코딩학습(Backend)</h2>

//             {loading ? (
//                 <div style={{ textAlign: 'center', padding: '2rem' }}>
//                     <div className="spinner" />
//                     <p>로딩 중입니다...</p>
//                 </div>
//             ) : (
//                 <ul>
//                     {items.map((item) => (
//                         <li key={item.slug} style={{ margin: '1rem 0' }}>
//                             <Link href={`/screen/rss/${item.slug}`}>
//                                 <span style={{ cursor: 'pointer', fontSize: '1.1rem', color: 'blue' }}>
//                                     {item.title}
//                                 </span>
//                             </Link>
//                             <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.pubDate}</div>
//                         </li>
//                     ))}
//                 </ul>
//             )}

//             {/* 간단한 CSS */}
//             <style jsx>{`
//                 .spinner {
//                     width: 40px;
//                     height: 40px;
//                     margin: 0 auto;
//                     border: 5px solid lightgray;
//                     border-top: 5px solid #3498db;
//                     border-radius: 50%;
//                     animation: spin 0.8s linear infinite;
//                 }

//                 @keyframes spin {
//                     0% {
//                         transform: rotate(0deg);
//                     }
//                     100% {
//                         transform: rotate(360deg);
//                     }
//                 }
//             `}</style>
//         </div>
//     );
// }

'use client';

import { useRouter } from 'next/navigation';
import {
    MapPin,
    Heart,
    Search,
    Home,
    Star,
    TrendingDown,
    TrendingUp,
    ThumbsUp,
    Plus,
    Scale,
    BarChart,
    HeartPulse,
    MoveHorizontal
} from 'lucide-react';

export default function HomeScreen() {
    const router = useRouter();

    const handleGoToWordGame = () => {
        router.push('/screen/interest');
    };

    const quickMenus = [
        { icon: <MapPin className="w-8 h-8 text-gray-500" />, label: '지도로 찾기' },
        { icon: <Search className="w-8 h-8 text-gray-500" />, label: '지역명 검색' },
        { icon: <Home className="w-8 h-8 text-gray-500" />, label: '분양정보' },
        { icon: <Heart className="w-8 h-8 text-gray-500" />, label: '관심단지' }
    ];

    const icons = [
        { icon: <TrendingDown className="w-6 h-6 text-yellow-600" />, label: '최근하락' },
        { icon: <ThumbsUp className="w-6 h-6 text-blue-600" />, label: '최고가' },
        { icon: <Plus className="w-6 h-6 text-green-600" />, label: '매물증감' },
        { icon: <MoveHorizontal className="w-6 h-6 text-gray-800" />, label: '가격비교' },
        { icon: <TrendingUp className="w-6 h-6 text-yellow-600" />, label: '최고상승' },
        { icon: <HeartPulse className="w-6 h-6 text-red-600" />, label: '가격변동' },
        { icon: <Scale className="w-6 h-6 text-gray-600" />, label: '여러단지비교' },
        { icon: <MapPin className="w-6 h-6 text-blue-600" />, label: '많이산단지' },
        { icon: <BarChart className="w-6 h-6 text-green-600" />, label: '거래량' },
        {
            icon: <Star className="w-6 h-6 text-orange-500" />,
            label: '단어게임',
            onClick: handleGoToWordGame
        }
    ];

    return (
        <div className="p-4 bg-gray-50 min-h-screen space-y-4">
            {/* 상단 4패널 */}
            <div className="grid grid-cols-2 gap-3">
                {quickMenus.map((menu, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-100 rounded-xl flex flex-col items-center justify-center p-4 shadow"
                    >
                        {menu.icon}
                        <span className="mt-2 text-sm text-gray-700">{menu.label}</span>
                    </div>
                ))}
            </div>

            {/* 추천 패널 */}
            <div className="flex items-center justify-between rounded-xl p-3 text-white bg-gradient-to-r from-blue-500 to-purple-500">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">단어공부</span>
                </div>
                <span className="text-sm">단어공부하자</span>
            </div>

            {/* 아이콘 그리드 */}
            <div className="grid grid-cols-5 gap-2">
                {icons.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-100 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-gray-200"
                        onClick={item.onClick}
                    >
                        {item.icon}
                        <span className="text-xs mt-1 text-center break-keep">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
