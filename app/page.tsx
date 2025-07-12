'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

// ✅ 대치동을 포함
const guList = [
    {
        name: '강남구',
        code: '11680',
        dongs: [
            { name: '역삼동', code: '11680101' },
            { name: '논현동', code: '11680102' },
            { name: '대치동', code: '11680103' } // ✅ 추가
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

    // ✅ 강남구 대치동을 기본 선택
    const [selectedGu, setSelectedGu] = useState('강남구');
    const [selectedGuCd, setSelectedGuCd] = useState('11680');
    const [selectedDong, setSelectedDong] = useState('대치동');
    const [selectedDongCd, setSelectedDongCd] = useState('11680103');

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
            <div className="grid grid-cols-2 gap-4">
                {quickMenus.map((menu, idx) => (
                    <div
                        key={idx}
                        onClick={menu.onClick}
                        className="
                                    rounded-2xl
                                    flex flex-col items-center justify-center
                                    p-6
                                    bg-gradient-to-b from-white to-gray-50
                                    shadow-md
                                    border border-gray-200
                                    hover:shadow-lg
                                    hover:scale-105
                                    transition
                                    cursor-pointer
                                "
                    >
                        {/* 아이콘 강조 색상 */}
                        <div className="text-blue-600 mb-2">{menu.icon}</div>
                        <span className="text-base font-semibold text-gray-800">{menu.label}</span>
                    </div>
                ))}
            </div>

            {/* 🟠 거래조회 제목 */}
            <h1 className="text-2xl font-bold mt-4">🏢 아파트 실거래 조회</h1>

            {/* 구/동 선택 */}
            <div className="flex flex-wrap gap-4 items-center">
                {/* 구 선택 */}
                <div className="flex items-center gap-2">
                    <label className="font-semibold">구 선택:</label>
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
                    <div className="flex items-center gap-2">
                        <label className="font-semibold">동 선택:</label>
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
            </div>

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
