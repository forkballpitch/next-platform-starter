'use client';

import { Container as MapDiv, NaverMap, useNavermaps, useMap } from 'react-naver-maps';
import { useState, useEffect, useRef } from 'react';
import guDongData from '@/data/apt/seoulGuDong.json';
import { makeMarkerClustering } from './marker-cluster'; // ✅

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
    selectedDong
}: {
    setLoading: (loading: boolean) => void;
    selectedYear: string;
    selectedMonth: string;
    selectedGu: string;
    selectedDong: string;
}) {
    const navermaps = useNavermaps();
    const map = useMap();
    const clusterRef = useRef<any>(null);
    const currentInfoWindowRef = useRef<any>(null);

    useEffect(() => {
        if (!map || !window.naver) return;

        async function setup() {
            setLoading(true);

            try {
                const MarkerClustering = makeMarkerClustering(window.naver);

                const res = await fetch(`/data/apt/seoul_${selectedYear}.json`);
                const data = await res.json();

                const allDeals: AptDeal[] = data
                    .filter((row: any) => row.latitude && row.longitude)
                    .map((row: any) => ({
                        apt: row.aptNm,
                        date: `${row.dealYear}-${row.dealMonth}-${row.dealDay}`,
                        amount: row.dealAmount,
                        latitude: row.latitude,
                        longitude: row.longitude
                    }));

                const coordMap = new Map<string, AptDeal[]>();

                allDeals.forEach((deal) => {
                    const key = `${deal.latitude},${deal.longitude}`;
                    if (!coordMap.has(key)) coordMap.set(key, []);
                    coordMap.get(key)!.push(deal);
                });

                const markers = Array.from(coordMap.entries()).map(([key, deals]) => {
                    const [lat, lng] = key.split(',').map(Number);
                    const pos = new navermaps.LatLng(lat, lng);

                    const marker = new navermaps.Marker({ position: pos });

                    navermaps.Event.addListener(marker, 'click', () => {
                        if (currentInfoWindowRef.current) currentInfoWindowRef.current.close();
                        const html = deals
                            .map((d) => `${d.date} 💰${d.amount}만원`)
                            .join('<hr style="margin:4px 0;" />');

                        const infoWindow = new navermaps.InfoWindow({
                            content: `
                <div style="padding:4px; max-height:200px; overflow:auto;">
                  🏢 <b>${deals[0].apt}</b><br/>
                  ${html}
                </div>
              `
                        });
                        infoWindow.open(map, marker);
                        currentInfoWindowRef.current = infoWindow;
                    });

                    return marker;
                });

                if (clusterRef.current) {
                    clusterRef.current.clear();
                    clusterRef.current.setMap(null);
                    clusterRef.current = null;
                }

                clusterRef.current = new MarkerClustering({
                    minClusterSize: 2,
                    maxZoom: 17,
                    map,
                    markers: markers,
                    disableClickZoom: false,
                    gridSize: 100,
                    icons: [
                        {
                            content:
                                '<div style="cursor:pointer;width:40px;height:40px;line-height:40px;font-size:11px;color:white;text-align:center;font-weight:bold;background:#FF8A00;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);">{count}</div>',
                            size: navermaps.Size(40, 40),
                            anchor: navermaps.Point(20, 20)
                        }
                    ],
                    indexGenerator: [10, 50, 100, 300],
                    stylingFunction: (clusterMarker, count) => {
                        clusterMarker.getElement().querySelector('div')!.innerText = count;
                    },
                    onClusterClick: (cluster, event) => {
                        const pos = cluster.getCenter();
                        const nextZoom = Math.min(map.getZoom() + 2, 18);
                        map.setZoom(nextZoom, true);
                        map.panTo(pos);
                    }
                });
            } catch (e) {
                console.error('❌ 데이터 로드 실패', e);
            } finally {
                setLoading(false);
            }
        }

        setup();

        return () => {
            if (clusterRef.current) {
                clusterRef.current.clear();
                clusterRef.current.setMap(null);
                clusterRef.current = null;
            }
        };
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
                () => {
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
