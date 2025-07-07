'use client';

import { Container as MapDiv, NaverMap, useNavermaps, useMap } from 'react-naver-maps';
import { useState, useEffect, useRef } from 'react';
import guDongData from '@/data/apt/seoulGuDong.json';
import { makeMarkerClustering } from './marker-cluster'; // ✅
import * as turf from '@turf/turf';
import regions from '@/data/apt/regions.json'; // 서울 경계 GeoJSON
import incheonjson from '@/data/apt/incheon.json';
import gyeonggijson from '@/data/apt/gyeonggi.json';

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
    selectedArea,
    setSelectedArea
}: {
    setLoading: (loading: boolean) => void;
    selectedYear: string;
    selectedMonth: string;
    selectedGu: string;
    selectedDong: string;
    selectedArea: string;
    setSelectedArea: (area: string) => void;
}) {
    const navermaps = useNavermaps();
    const map = useMap();
    const clusterRef = useRef<any>(null);
    const currentInfoWindowRef = useRef<any>(null);

    // ✅ 컴포넌트 내부에 그대로
    function isPointInBounds(lat: number, lng: number, sw: any, ne: any) {
        return lat >= sw.lat() && lat <= ne.lat() && lng >= sw.lng() && lng <= ne.lng();
    }

    useEffect(() => {
        if (!map) return;

        navermaps.Event.addListener(map, 'center_changed', () => {
            console.log('🗺️ 지도 중심 변경됨:', map.getCenter());
            const bounds = map.getBounds();
            const sw = bounds.getSW();
            const ne = bounds.getNE();

            const viewPortPolygon = turf.bboxPolygon([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);
            // console.log(`========================`);
            regions[0].features.forEach((region) => {
                const polygon = turf.polygon(region.geometry.coordinates);
                const intersects = turf.booleanIntersects(viewPortPolygon, polygon);
                //  console.log(`${region.properties.name} 교차? ${intersects}`);
                //   console.log(selectedArea);
                setSelectedArea('seoul'); // 임시로 인천으로 설정, 실제로는 선택된 지역에 따라 변경됨
            });
            // console.log(`========================`);

            //   const bounds = map.getBounds();
            //   const sw = bounds.getSW();
            //   const ne = bounds.getNE();

            //   const viewPortPolygon = turf.bboxPolygon([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);

            //   const areas = [
            //       { name: 'seoul', geojson: regions },
            //       { name: 'incheon', geojson: incheonjson },
            //       { name: 'gyeonggi', geojson: gyeonggijson }
            //   ];

            //   for (const area of areas) {
            //       const feature = area.geojson.features?.[0];
            //       if (!feature) continue;

            //       const polygon = turf.polygon(feature.geometry.coordinates);
            //       const intersects = turf.booleanIntersects(viewPortPolygon, polygon);

            //       console.log(`${area.name} 교차 여부: ${intersects}`);

            //       if (intersects) {
            //           setSelectedArea(area.name);
            //           break; // 첫번째 교차만 반영
            //       }
            //   }
        });
    }, [map, selectedArea]);

    useEffect(() => {
        console.log('📍 선택된 지역:', selectedArea);
        if (!map || !window.naver) return;

        async function setup() {
            setLoading(true);

            try {
                const MarkerClustering = makeMarkerClustering(window.naver);
                // selectedArea = 'incheon'; // 임시로 인천으로 설정, 실제로는 선택된 지역에 따라 변경됨
                // const res = await fetch(`/data/apt/seoul/seoul_${selectedYear}.json`);

                const now = new Date();
                const currentYear = String(now.getFullYear());
                const currentMonth = String(now.getMonth() + 1); // JS 월 +1

                let res;

                if (selectedYear === currentYear && selectedMonth === currentMonth) {
                    // if (true) {
                    // 현재 달은 API
                    // res = await fetch(`/api/apt?year=${selectedYear}&month=${selectedMonth}&gu=${selectedGu}`);
                    //임시
                    res = await fetch(`/data/apt/${selectedArea}/${selectedArea}_${selectedYear}.json`);
                } else {
                    // 과거 달은 기존 JSON
                    console.log(selectedArea, selectedYear);
                    res = await fetch(`/data/apt/${selectedArea}/${selectedArea}_${selectedYear}.json`);
                }

                // const res = await fetch(`/data/apt/${selectedArea}/${selectedArea}_${selectedYear}.json`);
                console.log('🔗 API URL:', res.url);
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
                clusterRef.current.setMap(null);
                clusterRef.current = null;
            }
        };
    }, [map, selectedYear, selectedMonth, selectedArea]);

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
    const [selectedArea, setSelectedArea] = useState('seoul');

    const guList = Object.keys(guDongData);

    const areaConfigs = [
        {
            name: 'seoul',
            center: { lat: 37.5665, lng: 126.978 },
            radiusKm: 20 // 더 좁게
        },
        {
            name: 'incheon',
            center: { lat: 37.4563, lng: 126.7052 },
            radiusKm: 20
        },
        {
            name: 'gyeonggi',
            center: { lat: 37.2752, lng: 127.0095 },
            radiusKm: 20
        }
    ];

    function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
        const R = 6371; // km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

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
                onCenterChanged={(map) => {
                    //console.log('🗺️ 지도 중심 변경됨:', map);
                    // console.log('🗺️ 지도 이동됨:', map.x);
                    // // 네이버 reverse geocoding API 호출
                    // fetch(`/api/geo?lat=${map._lat}&lng=${map._lng}`)
                    //     .then((res) => res.json())
                    //     .then((data) => {
                    //         // console.log('📍 역지오코딩 응답:', data);
                    //         const area1 = data.results?.[0]?.region?.area1?.name;
                    //         const area2 = data.results?.[0]?.region?.area2?.name;
                    //         const area3 = data.results?.[0]?.region?.area3?.name;
                    //         console.log(`➡️ 현재 위치는 ${area1 ?? ''} ${area2 ?? ''} ${area3 ?? ''}`);
                    //         // const area1 = data.results?.[0]?.region?.area1?.name;
                    //         // setSelectedArea('incheon');
                    //     })
                    //     .catch((err) => console.error('역지오코딩 오류', err));
                }}
                onZoomChanged={(map) => {
                    // console.log('🔍 줌 변경됨: zoom =', map.getZoom());
                }}
            >
                <MarkerCluster
                    setLoading={setLoading}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    selectedGu={selectedGu}
                    selectedDong={selectedDong}
                    selectedArea={selectedArea}
                    setSelectedArea={setSelectedArea}
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
