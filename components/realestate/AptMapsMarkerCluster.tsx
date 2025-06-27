// components/NaverMapsMarkerCluster.tsx
'use client';

import { Container as MapDiv, NaverMap, useNavermaps, useMap } from 'react-naver-maps';
import { useState, useEffect, useRef } from 'react';
import { XMLParser } from 'fast-xml-parser';
import { getCoordinates } from '../../app/lib/getCoordinates';
import { useRegion } from './RegionContext'; // 🔹 추가

interface AptDeal {
    apt: string;
    date: string;
    amount: string;
    latitude?: number;
    longitude?: number;
}

declare global {
    interface Window {
        naver: any;
    }
}

function MarkerCluster({ setLoading }: { setLoading: (loading: boolean) => void }) {
    const navermaps = useNavermaps();
    const map = useMap();
    const aptMarkersRef = useRef<any[]>([]);
    const currentInfoWindowRef = useRef<any>(null);

    const { selectedGu, selectedDong, selectedGuCd, selectedDongCd, aptDeals, setAptDeals } = useRegion();

    useEffect(() => {
        if (!map || !window.naver || !selectedGuCd || !selectedDongCd || !selectedGu) return;

        async function fetchDeals() {
            setLoading(true); // ✅ 외부에서 전달받은 setLoading 호출
            console.log('🔍 아파트 거래 정보 조회:', selectedGu, selectedDong);
            const encodedGu = encodeURIComponent(selectedGu);
            const url = `http://openapi.seoul.go.kr:8088/6c444d6e73646266383961584e4e41/xml/tbLnOpendataRtmsV/1/50/2025/${selectedGuCd}/${encodedGu}/${selectedDongCd}`;
            console.log('🔗 API URL:', url);
            try {
                const res = await fetch(url);
                const xml = await res.text();
                const parser = new XMLParser();
                const parsed = parser.parse(xml);
                const rows = parsed?.tbLnOpendataRtmsV?.row || [];

                const enriched = [];

                for (const row of rows) {
                    const query = `${row.OPBIZ_RESTAGNT_SGG_NM} ${row.STDG_NM} ${row.MNO}`;
                    try {
                        const coord = await getCoordinates(query);
                        if (coord) {
                            enriched.push({
                                apt: row.BLDG_NM,
                                date: row.CTRT_DAY,
                                amount: row.THING_AMT,
                                latitude: coord.latitude,
                                longitude: coord.longitude
                            });
                        }
                    } catch {
                        console.warn('❌ 좌표 변환 실패:', query);
                    }
                }

                setAptDeals(enriched);

                aptMarkersRef.current.forEach((marker) => marker.setMap(null));
                aptMarkersRef.current = [];

                enriched.forEach((deal) => {
                    const pos = new navermaps.LatLng(deal.latitude!, deal.longitude!);

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
                                <div style="font-weight: bold;">${deal.apt}</div>
                                <div>💰 ${deal.amount}만</div>
                                <div style="font-size: 10px;">📅 ${deal.date}</div>
                            </div>
                        `,
                            size: navermaps.Size(100, 60),
                            anchor: navermaps.Point(50, 60)
                        },
                        map
                    });

                    navermaps.Event.addListener(marker, 'click', () => {
                        const infoWindow = new navermaps.InfoWindow({
                            content: `<div style="padding:6px;">🏢 ${deal.apt}<br/>💰 ${deal.amount}만원<br/>📅 ${deal.date}</div>`
                        });
                        infoWindow.open(map, marker);
                        currentInfoWindowRef.current = infoWindow;
                    });

                    aptMarkersRef.current.push(marker);
                });
            } catch (error) {
                console.error('❌ 데이터 처리 실패:', error);
            } finally {
                setLoading(false); // 🔹 로딩 종료
            }
        }

        fetchDeals();
    }, [map, selectedGuCd, selectedDongCd, selectedGu]);

    return null;
}

function NaverMapsMarkerCluster() {
    const navermaps = useNavermaps();
    const [center, setCenter] = useState<any>(null);
    const [loading, setLoading] = useState(false); // ✅ 여기에서 선언

    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter(new navermaps.LatLng(position.coords.latitude, position.coords.longitude));
                },
                (error) => {
                    console.warn('📍 위치 접근 실패:', error);
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
                zoomControl={true}
                zoomControlOptions={{
                    position: navermaps.Position.TOP_LEFT,
                    style: navermaps.ZoomControlStyle.SMALL
                }}
            >
                <MarkerCluster setLoading={setLoading} />
            </NaverMap>

            {/* 🔽 로딩 UI 표시 */}
            {loading && (
                <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded shadow text-sm font-medium text-gray-700">
                    ⏳ 지도에 마커를 표시 중입니다...
                </div>
            )}
        </MapDiv>
    );
}

export default NaverMapsMarkerCluster;
