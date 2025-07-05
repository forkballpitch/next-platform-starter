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
import { useEffect, useState } from 'react';
import {
    MapPin,
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

// 예시 구/동 코드
const guList = [
    {
        name: '강남구',
        code: '11680',
        dongs: [
            { name: '역삼동', code: '11680101' },
            { name: '논현동', code: '11680102' }
        ]
    },
    {
        name: '서초구',
        code: '11650',
        dongs: [
            { name: '서초동', code: '11650101' },
            { name: '반포동', code: '11650102' }
        ]
    }
];

export default function AptDealsPage() {
    const router = useRouter();

    // quick menu handlers
    const handleGoToWordGame = () => {
        router.push('/screen/preschool');
    };
    const handleGoToMap = () => {
        router.push('/screen/aptMap');
    };
    const handleGoToAcademy = () => {
        router.push('/screen/academymap');
    };

    const quickMenus = [
        {
            icon: <MapPin className="w-8 h-8 text-gray-500" />,
            label: '실거래지도',
            onClick: handleGoToMap
        },
        {
            icon: <MapPin className="w-8 h-8 text-gray-500" />,
            label: '학원지도',
            onClick: handleGoToAcademy
        }
    ];

    // 거래조회 상태
    const [selectedGu, setSelectedGu] = useState('');
    const [selectedGuCd, setSelectedGuCd] = useState('');
    const [selectedDong, setSelectedDong] = useState('');
    const [selectedDongCd, setSelectedDongCd] = useState('');
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedGuCd || !selectedDongCd) return;

        setLoading(true);
        fetch(`/api/fetchAptDeals?guCd=${selectedGuCd}&dongCd=${selectedDongCd}`)
            .then((res) => res.json())
            .then((data) => setDeals(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [selectedGuCd, selectedDongCd]);

    return (
        <div className="p-4 max-w-3xl mx-auto space-y-6">
            {/* 🟠 Quick Menus */}
            <div className="grid grid-cols-3 gap-4">
                {quickMenus.map((menu, idx) => (
                    <div
                        key={idx}
                        onClick={menu.onClick}
                        className="bg-gray-100 rounded-xl flex flex-col items-center justify-center p-4 shadow cursor-pointer hover:bg-gray-200"
                    >
                        {menu.icon}
                        <span className="mt-2 text-sm text-gray-700">{menu.label}</span>
                    </div>
                ))}
            </div>

            {/* 🟠 거래조회 제목 */}
            <h1 className="text-2xl font-bold mt-4">🏢 아파트 실거래 조회</h1>

            {/* 구 선택 */}
            <div>
                <label className="font-semibold mr-2">구 선택:</label>
                <select
                    className="border rounded p-2"
                    value={selectedGu}
                    onChange={(e) => {
                        const guName = e.target.value;
                        const gu = guList.find((g) => g.name === guName);
                        setSelectedGu(guName);
                        setSelectedGuCd(gu?.code ?? '');
                        setSelectedDong('');
                        setSelectedDongCd('');
                    }}
                >
                    <option value="">-- 구를 선택하세요 --</option>
                    {guList.map((gu) => (
                        <option key={gu.code} value={gu.name}>
                            {gu.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 동 선택 */}
            {selectedGu && (
                <div>
                    <label className="font-semibold mr-2">동 선택:</label>
                    <select
                        className="border rounded p-2"
                        value={selectedDong}
                        onChange={(e) => {
                            const dongName = e.target.value;
                            const dong = guList
                                .find((g) => g.name === selectedGu)
                                ?.dongs.find((d) => d.name === dongName);
                            setSelectedDong(dongName);
                            setSelectedDongCd(dong?.code ?? '');
                        }}
                    >
                        <option value="">-- 동을 선택하세요 --</option>
                        {guList
                            .find((g) => g.name === selectedGu)
                            ?.dongs.map((dong) => (
                                <option key={dong.code} value={dong.name}>
                                    {dong.name}
                                </option>
                            ))}
                    </select>
                </div>
            )}

            {/* 결과 */}
            {loading && <div>⏳ 데이터를 불러오는 중입니다...</div>}

            {!loading && deals.length > 0 && (
                <ul className="space-y-2">
                    {deals.map((deal, idx) => (
                        <li key={idx} className="border p-3 rounded shadow-sm">
                            <p className="font-semibold">🏠 {deal.apt}</p>
                            <p>📅 {deal.date}</p>
                            <p>💰 {deal.amount} 만원</p>
                        </li>
                    ))}
                </ul>
            )}

            {!loading && deals.length === 0 && selectedDong && <div>📭 거래 정보가 없습니다.</div>}
        </div>
    );
}
