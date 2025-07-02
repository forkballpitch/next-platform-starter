'use client';

import { Container as MapDiv, NaverMap, useNavermaps, useMap } from 'react-naver-maps';
import { useState, useEffect, useRef } from 'react';
import guDongData from '@/data/apt/seoulGuDong.json';

interface AptDeal {
    apt: string;
    date: string;
    amount: string;
    latitude: number;
    longitude: number;
}

declare global {
    interface Window {
        naver: any;
    }
}

function MarkerCluster({
    setLoading,
    selectedYear,
    selectedMonth,
    selectedGu,
    selectedDong,
    guDongData
}: {
    setLoading: (loading: boolean) => void;
    selectedYear: string;
    selectedMonth: string;
    selectedGu: string;
    selectedDong: string;
    guDongData: Record<string, { code: string; dongs: { name: string; code: string }[] }>;
}) {
    const navermaps = useNavermaps();
    const map = useMap();
    const markersRef = useRef<any[]>([]);
    const infoWindowRef = useRef<any>(null);

    let allDeals: AptDeal[] = []; // useEffect 바깥

    useEffect(() => {
        if (!map || !window.naver) return;

        let allDeals: AptDeal[] = [];

        // 지도 클릭 시 InfoWindow 닫기
        navermaps.Event.addListener(map, 'click', () => {
            if (infoWindowRef.current) {
                infoWindowRef.current.close();
                infoWindowRef.current = null;
            }
        });

        async function fetchDeals() {
            setLoading(true);
            try {
                const res = await fetch(`/data/apt/seoul_${selectedYear}.json`);
                const data = await res.json();
                allDeals = data
                    .filter((row: any) => row.latitude && row.longitude)
                    .map((row: any) => ({
                        apt: row.aptNm,
                        date: `${row.dealYear}-${row.dealMonth}-${row.dealDay}`,
                        amount: row.dealAmount,
                        latitude: row.latitude,
                        longitude: row.longitude
                    }));

                // 처음 로딩 시 지도 bounds에 맞게 마커 표시
                updateMarkers();
            } catch (err) {
                console.error('❌ 데이터 로드 실패', err);
            } finally {
                setLoading(false);
            }
        }

        function updateMarkers() {
            if (!map) return;
            const bounds = map.getBounds();
            // console.log('🔍 현재 지도 범위:', bounds);

            const filtered = allDeals.filter((deal) => {
                return bounds.hasLatLng(new navermaps.LatLng(deal.latitude, deal.longitude));
            });

            const grouped = filtered.reduce((acc, deal) => {
                const key = `${deal.latitude},${deal.longitude}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(deal);
                return acc;
            }, {} as Record<string, AptDeal[]>);

            markersRef.current.forEach((m) => m.setMap(null));
            markersRef.current = [];

            Object.entries(grouped).forEach(([key, deals]) => {
                const [lat, lng] = key.split(',').map(Number);
                const pos = new navermaps.LatLng(lat, lng);

                const marker = new navermaps.Marker({
                    position: pos,
                    icon: {
                        content: `
            <div style="
              background: #FF8A00;
              padding: 6px 8px;
              border-radius: 12px;
              font-size: 11px;
              color: white;
              border: 1px solid white;
              text-align: center;
              line-height: 1.3;
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
              min-width: 100px;
            ">
              <div style="font-weight: bold;">${deals[0].apt}</div>
              <div>💰 ${deals.length}건</div>
            </div>
          `,
                        size: navermaps.Size(100, 60),
                        anchor: navermaps.Point(50, 60)
                    },
                    map
                });

                navermaps.Event.addListener(marker, 'click', () => {
                    if (infoWindowRef.current) infoWindowRef.current.close();
                    const html = deals.map((d) => `${d.date} 💰${d.amount}만원`).join('<hr/>');
                    const infoWindow = new navermaps.InfoWindow({
                        content: `<div style="padding:4px; max-height:200px; overflow:auto;">🏢 ${deals[0].apt}<br/>${html}</div>`
                    });
                    infoWindow.open(map, marker);
                    infoWindowRef.current = infoWindow;
                });

                markersRef.current.push(marker);
            });
        }

        fetchDeals();

        // 지도 드래그/확대/축소 시에도 마커 다시 표시
        navermaps.Event.addListener(map, 'bounds_changed', () => {
            updateMarkers();
        });
    }, [map, selectedYear]);

    return null;
}

function NaverMapsMarkerCluster() {
    const navermaps = useNavermaps();
    const [center, setCenter] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const now = new Date();
    const currentYear = String(now.getFullYear());
    const currentMonth = String(now.getMonth() + 1);

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedGu, setSelectedGu] = useState('강남구');
    const [selectedDong, setSelectedDong] = useState('');
    const [dongList, setDongList] = useState<{ name: string; code: string }[]>([]);

    const guList = Object.keys(guDongData);

    useEffect(() => {
        setDongList(guDongData[selectedGu]?.dongs ?? []);
        setSelectedDong('');
    }, [selectedGu]);

    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCenter(new navermaps.LatLng(pos.coords.latitude, pos.coords.longitude));
                },
                (err) => {
                    console.warn('위치 접근 실패:', err);
                    setCenter(new navermaps.LatLng(37.498095, 127.051572));
                }
            );
        } else {
            setCenter(new navermaps.LatLng(37.498095, 127.051572));
        }
    }, [navermaps]);

    if (!center) return null;

    return (
        <MapDiv style={{ width: '100%', height: '100%' }}>
            <NaverMap
                zoom={16}
                center={center}
                zoomControl
                zoomControlOptions={{
                    position: navermaps.Position.TOP_LEFT,
                    style: navermaps.ZoomControlStyle.SMALL
                }}
            >
                <MarkerCluster
                    setLoading={setLoading}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    selectedGu={selectedGu}
                    selectedDong={selectedDong}
                    guDongData={guDongData}
                />
            </NaverMap>

            <div className="absolute top-4 left-4 z-50 bg-white shadow p-2 rounded flex gap-2 text-sm flex-wrap">
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                </select>

                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border p-1 rounded"
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                            {i + 1}월
                        </option>
                    ))}
                </select>

                <select
                    value={selectedGu}
                    onChange={(e) => setSelectedGu(e.target.value)}
                    className="border p-1 rounded"
                >
                    {guList.map((gu) => (
                        <option key={gu} value={gu}>
                            {gu}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedDong}
                    onChange={(e) => setSelectedDong(e.target.value)}
                    disabled={!dongList.length}
                    className="border p-1 rounded"
                >
                    <option value="">동 선택</option>
                    {dongList.map((dong) => (
                        <option key={dong.code} value={dong.name}>
                            {dong.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded shadow text-sm font-medium text-gray-700">
                    ⏳ 지도에 마커를 표시 중입니다...
                </div>
            )}
        </MapDiv>
    );
}

export default NaverMapsMarkerCluster;
