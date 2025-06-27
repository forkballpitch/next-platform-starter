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

            const gus = Array.from(new Set(rows.map((r: DongData) => r.locatadd_nm.split(' ')[1]).filter(Boolean)));
            setGuList(gus);
        }

        fetchData();
    }, []);

    const handleGuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const gu = e.target.value;
        setSelectedGu(gu);
        setSelectedDong('');
        setAptDeals([]);
    };

    const handleDongChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const fullName = e.target.value;
        setSelectedDong(fullName);

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
            <select value={selectedGu} onChange={handleGuChange} className="border p-1 rounded">
                <option value="">구 선택</option>
                {guList.map((gu) => (
                    <option key={gu} value={gu}>
                        {gu}
                    </option>
                ))}
            </select>

            <select
                value={selectedDong}
                onChange={handleDongChange}
                className="border p-1 rounded"
                disabled={!selectedGu}
            >
                <option value="">동 선택</option>
                {filteredDongs.map((dong) => (
                    <option key={dong.region_cd} value={dong.locatadd_nm}>
                        {dong.locallow_nm}
                    </option>
                ))}
            </select>
        </div>
    );
}
