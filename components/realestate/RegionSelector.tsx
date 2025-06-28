'use client';

import { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { useRegion } from './RegionContext';

interface DongData {
    region_cd: string;
    locatadd_nm: string;
    locallow_nm: string;
}

export default function RegionSelector() {
    const [dongList, setDongList] = useState<DongData[]>([]);
    const [guList, setGuList] = useState<string[]>([]);
    const [dongOpen, setDongOpen] = useState(false);
    const [guOpen, setGuOpen] = useState(false);

    const {
        selectedGu,
        setSelectedGu,
        selectedDong,
        setSelectedDong,
        setAptDeals,
        setSelectedGuCd,
        setSelectedDongCd
    } = useRegion();

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                'https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList?serviceKey=uPBe0WsM2NosSYcm0xFIdYOynTpXBeDm1fcH5ZYOevJT9MnKAdEZlooImBdPPb7dDNXLag903rfo4J2Cxw7v8w%3D%3D&pageNo=1&numOfRows=1000&type=json&locatadd_nm=서울특별시'
            );
            const json = await res.json();
            const rows = json?.StanReginCd?.[1]?.row ?? [];
            setDongList(rows);

            const gus = Array.from(
                new Set(rows.map((r: DongData) => r.locatadd_nm.split(' ')[1]).filter(Boolean))
            ) as string[];
            console.log('✅ 구 목록:', gus);
            setGuList(gus);
        }

        fetchData();
    }, []);

    // string을 받는 새로운 핸들러
    const handleGuClick = (gu: string) => {
        setSelectedGu(gu);
        setSelectedDong('');
        setAptDeals([]);
    };

    const handleDongClick = (dongName: string) => {
        setSelectedDong(dongName);
        setAptDeals([]);
    };

    const handleGuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const gu = e.target.value; // ✅
        setSelectedGu(gu);
        setSelectedDong('');
        setAptDeals([]);
        setGuOpen(false);
    };

    const handleDongChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fullName = e.target.value; // ✅
        setSelectedDong(fullName);
        setDongOpen(false);

        const row = dongList.find((d) => d.locatadd_nm === fullName);
        if (!row) return;

        const regionCd = row.region_cd;
        const guCd = regionCd.substring(0, 5);
        const dongCd = regionCd.substring(5);

        setSelectedGuCd(guCd);
        setSelectedDongCd(dongCd);

        const url = `http://openapi.seoul.go.kr:8088/6c444d6e73646266383961584e4e41/xml/tbLnOpendataRtmsV/1/5/2025/${guCd}/${selectedGu}/${dongCd}`;
        console.log('🔗 API URL:', url);

        try {
            const res = await fetch(url);
            const text = await res.text();
            const parser = new XMLParser();
            const json = parser.parse(text);
            const rows = json?.tbLnOpendataRtmsV?.row || [];
            const deals = rows.map((row: any) => ({
                apt: row.BLDG_NM,
                date: row.CTRT_DAY,
                amount: row.THING_AMT,
                gu: row.OPBIZ_RESTAGNT_SGG_NM,
                dong: row.STDG_NM,
                jibeon: row.MNO
            }));
            console.log('✅ 실거래 건수:', deals.length);
            setAptDeals(deals);
        } catch (e) {
            console.error('❌ API 호출 실패:', e);
        }
    };

    const filteredDongs = dongList.filter((row) => row.locatadd_nm.includes(selectedGu));

    return (
        <div
            className="absolute top-20 left-4 z-50 bg-white shadow-md p-2 rounded flex gap-2"
            style={{ marginTop: '62px', marginLeft: '35px' }}
        >
            {/* GU DROPDOWN */}
            <div className="relative">
                <button onClick={() => setGuOpen((prev) => !prev)} className="border p-1 rounded w-28 text-left">
                    {selectedGu || '구 선택'}
                </button>
                {guOpen && (
                    <ul className="absolute bg-white border rounded shadow w-28 max-h-60 overflow-auto z-50">
                        {guList.map((gu) => (
                            <li
                                key={gu}
                                onClick={() => handleGuClick(gu)}
                                className="p-1 hover:bg-gray-100 cursor-pointer"
                            >
                                {gu}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* DONG DROPDOWN */}
            <div className="relative">
                <button
                    onClick={() => {
                        if (selectedGu) setDongOpen((prev) => !prev);
                    }}
                    className="border p-1 rounded w-28 text-left disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!selectedGu}
                >
                    {selectedDong || '동 선택'}
                </button>
                {dongOpen && selectedGu && (
                    <ul className="absolute bg-white border rounded shadow w-28 max-h-60 overflow-auto z-50">
                        {filteredDongs.map((dong) => (
                            <li
                                key={dong.region_cd}
                                onClick={() => handleDongClick(dong.locatadd_nm)}
                                className="p-1 hover:bg-gray-100 cursor-pointer"
                            >
                                {dong.locallow_nm}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
