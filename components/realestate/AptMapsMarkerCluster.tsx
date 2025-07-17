'use client';

import { Container as MapDiv, NaverMap, useNavermaps, useMap } from 'react-naver-maps';
import { useState, useEffect, useRef } from 'react';
import guDongData from '@/data/apt/seoulGuDong.json';
import { makeMarkerClustering } from './marker-cluster'; // ✅
import * as turf from '@turf/turf';
import regions from '@/data/apt/regions.json'; // 서울 경계 GeoJSON
import { useRegion } from '@/components/realestate/RegionContext';

interface AptDeal {
    apt: string;
    date: string;
    amount: string;
    latitude: number;
    longitude: number;
    excluUseAr?: string; // 전용면적 (옵셔널)
    floor?: string; // 층수 (옵셔널)
    address?: string; // 주소도 같이 쓸 경우
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

    //경계 그리기
    //삼평동..
    // https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:900913&bbox=14140071.146077,4494339.6527027,14160071.146077,4496339.6527027&size=10&page=1&query=삼평동&type=district&category=L4&format=json&errorformat=json&key=0B12D424-596E-34C5-817C-0E7A3137D039
    //위 vworld API를 사용하여 경계 좌표를 가져올 수 있습니다.
    // 예시: 삼평동의 경계 좌표를 가져와서 지도에 그리기
    //district로 검색하면 경계 좌표를 가져올 수 있습니다.

    //대치동 https://api.vworld.kr/req/search?service=search&request=search&version=2.0&query=%EB%8C%80%EC%B9%98%EB%8F%99&type=district&category=L4&format=json&errorformat=json&key=0B12D424-596E-34C5-817C-0E7A3137D039
    useEffect(() => {
        if (!map || !window.naver) return;

        console.log('🗺️ 지도 경계 그리기 시작');

        async function drawBoundaries() {
            const res = await fetch('/data/apt/regions/regions_test.json');
            const geo = await res.json(); // FeatureCollection

            if (!geo || !geo.features) {
                console.error('❌ GeoJSON 구조 오류', geo);
                return;
            }

            geo.features.forEach((feature: any) => {
                const { geometry, properties } = feature;
                const { type, coordinates } = geometry;

                if (type === 'MultiLineString') {
                    coordinates.forEach((line: number[][]) => {
                        const path = line.map(([lng, lat]) => new navermaps.LatLng(lat, lng));
                        new navermaps.Polyline({
                            map,
                            path,
                            strokeColor: '#FF0000',
                            strokeOpacity: 0.8,
                            strokeWeight: 2
                        });
                    });
                }

                if (type === 'MultiPolygon') {
                    coordinates.forEach((polygon: number[][][]) => {
                        // polygon: [ [ [lng, lat], [lng, lat], ... ] ]
                        polygon.forEach((linearRing: number[][]) => {
                            const path = linearRing.map(([lng, lat]) => new navermaps.LatLng(lat, lng));
                            new navermaps.Polygon({
                                map,
                                paths: path,
                                strokeColor: '#0000FF',
                                strokeOpacity: 0.7,
                                strokeWeight: 2,
                                fillColor: '#0000FF',
                                fillOpacity: 0.1
                            });
                        });
                    });
                }
            });
        }

        drawBoundaries();
    }, [map]);

    const { targetCoord } = useRegion();

    useEffect(() => {
        if (!map || !navermaps) return;

        if (targetCoord && map) {
            const pos = new navermaps.LatLng(targetCoord.latitude, targetCoord.longitude);

            // 동일 좌표의 학원 목록 가져오기
            const coordKey = `${targetCoord.latitude},${targetCoord.longitude}`;
            // const matchedAcademies = academyData.filter((item) => `${item.latitude},${item.longitude}` === coordKey);

            const marker = new navermaps.Marker({ position: pos, map });

            // InfoWindow 내용 구성
            const content = `<div>📍 검색된 위치입니다</div>`;

            //학원 리스트 스크롤
            const infoWindow = new navermaps.InfoWindow({
                content: `
                                <div style="padding:8px;font-size:12px;max-width:220px;max-height:160px;overflow-y:auto;">
                                <style>
                                    div::-webkit-scrollbar {
                                    width: 6px;
                                    }
                                    div::-webkit-scrollbar-thumb {
                                    background-color: #888;
                                    border-radius: 4px;
                                    }
                                    div::-webkit-scrollbar-track {
                                    background-color: #f0f0f0;
                                    }
                                </style>
                                ${content}
                                </div>
                            `
            });

            navermaps.Event.addListener(marker, 'click', () => {
                if (currentInfoWindowRef.current) currentInfoWindowRef.current.close();
                infoWindow.open(map, marker);
                currentInfoWindowRef.current = infoWindow;
            });

            infoWindow.open(map, marker); // ✅ 자동으로 열리게

            map.setZoom(17);
            map.panTo(pos);
            //setTargetCoord(null); // 한 번만 실행
        }

        // if (targetCoord) {
        //     const latLng = new navermaps.LatLng(targetCoord.latitude, targetCoord.longitude);
        //     map.panTo(latLng); // ✅ 지도 중심 이동
        // }
    }, [targetCoord, map]);
    // 렌더링된 지역 추적
    const renderedAreasRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!map || !window.naver) return;

        const renderedAreas = renderedAreasRef.current;
        navermaps.Event.addListener(map, 'center_changed', () => {
            // console.log('🗺️ 지도 중심 변경됨:', map.getCenter());
            const bounds = map.getBounds();
            const sw = bounds.getSW();
            const ne = bounds.getNE();

            const viewPortPolygon = turf.bboxPolygon([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);
            // console.log(`========================`);
            regions[0].features.forEach((region) => {
                const polygon = turf.polygon(region.geometry.coordinates);
                const intersects = turf.booleanIntersects(viewPortPolygon, polygon);

                const areaName = region.properties.name; // '서울특별시' 이런 값
                console.log(`🔍 ${areaName} 영역 교차 확인: ${intersects}`);
                const areaKey = areaName.includes('Seoul')
                    ? 'seoul'
                    : areaName.includes('Incheon')
                    ? 'incheon'
                    : 'gyeonggi';
                const renderKey = `${areaKey}_${selectedYear}`;

                if (intersects) {
                    console.log(`✅ ${areaKey} 영역 교차 확인됨`);
                    if (!renderedAreas.has(renderKey)) {
                        console.log(`🆕 ${renderKey}는 아직 마커를 표시하지 않았습니다. setup 실행`);
                        renderedAreas.add(renderKey); // 표시한 것으로 등록

                        setTimeout(() => setup(areaKey), 0); // 마커 세팅 실행
                    } else {
                        console.log(`⏩ ${renderKey}는 이미 마커를 표시했습니다. 건너뜁니다`);
                    }
                }
            });
        });

        function parseCSV(csv: string): any[] {
            const lines = csv.trim().split('\n');
            const headers = lines[0].split(',').map((h) => h.trim());

            const rows = lines.slice(1).map((line) => {
                const values: string[] = [];
                let inQuotes = false;
                let value = '';

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];

                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(value.trim());
                        value = '';
                    } else {
                        value += char;
                    }
                }
                values.push(value.trim()); // 마지막 값

                const row: Record<string, string> = {};
                headers.forEach((h, i) => {
                    row[h] = values[i] || '';
                });

                return row;
            });

            return rows;
        }

        async function setup(area: string) {
            setLoading(true);
            console.log('📍 선택된 지역:', area);
            try {
                const MarkerClustering = makeMarkerClustering(window.naver);

                let data: any[] = [];

                // ✅ CSV 파일 경로 예시: `/data/apt/서울/apt_202507.csv`
                const csvRes = await fetch(
                    `https://ygmifhzjzruxsctk.public.blob.vercel-storage.com/seoul_apt_2025_07.csv`
                );
                if (!csvRes.ok) throw new Error('CSV 파일을 불러올 수 없습니다');
                const csvText = await csvRes.text();

                // ✅ CSV 파싱: 헤더를 기준으로 행 나누기
                const rows = parseCSV(csvText);

                data = rows;

                const allDeals: AptDeal[] = data
                    .filter((row: any) => row.latitude && row.longitude)
                    .map((row: any) => ({
                        apt: row['단지명'],
                        date: `${row['계약년월'].slice(0, 4)}-${row['계약년월'].slice(4, 6)}-${row['계약일'].padStart(
                            2,
                            '0'
                        )}`,
                        amount: row['거래금액(만원)'],
                        latitude: parseFloat(row['latitude']),
                        longitude: parseFloat(row['longitude']),
                        excluUseAr: row['전용면적(㎡)'],
                        floor: row['층'],
                        address: `${row['시군구']} ${row['번지']}`,
                        cancelDate: row['해제사유발생일'] // ✅ 이 부분 추가!
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

                    const marker = new navermaps.Marker({
                        position: pos,
                        icon: {
                            content: `
                        <div style="
                            position: relative;
                            background: #FF8A00;
                            color: white;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            white-space: nowrap;
                            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                        ">
                            ${deals[0].apt}
                            <div style="
                                position: absolute;
                                bottom: -16px;
                                left: 50%;
                                transform: translateX(-50%);
                                width: 0;
                                height: 0;
                                border-left: 5px solid transparent;
                                border-right: 5px solid transparent;
                                border-top: 16px solid #FF8A00;
                            "></div>
                        </div>`,
                            size: navermaps.Size(100, 40),
                            anchor: navermaps.Point(50, 20)
                        }
                    });

                    navermaps.Event.addListener(marker, 'click', () => {
                        if (currentInfoWindowRef.current) currentInfoWindowRef.current.close();

                        const sortedDeals = [...deals].sort(
                            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                        );

                        const html = sortedDeals
                            .map((d) => {
                                const amount = Number(d.amount.replace(/,/g, ''));
                                const eok = Math.floor(amount / 10000);
                                const man = amount % 10000;
                                const amountStr =
                                    eok > 0
                                        ? `${eok}억${man > 0 ? ' ' + man.toLocaleString() + '만원' : ''}`
                                        : `${man.toLocaleString()}만원`;

                                const cancelInfo =
                                    d['cancelDate'] && d['cancelDate'] !== '-'
                                        ? `<br/><span style="color:red;">❌ 해제사유발생일: ${d['cancelDate']}</span>`
                                        : '';

                                return `
                                            ${d.date} 💰${amountStr}<br/>
                                            전용면적: ${d.excluUseAr ?? '미상'}㎡<br/>
                                            층수: ${d.floor ?? '미상'}층
                                            ${cancelInfo}
                                        `;
                            })
                            .join('<hr style="margin:4px 0;" />');

                        const infoWindow = new navermaps.InfoWindow({
                            content: `
                        <div style="padding:4px; max-height:200px; overflow:auto;">
                            🏢 <b>${deals[0].apt}</b><br/>
                            📍 ${deals[0].address}<br/>
                            ${html}
                        </div>`
                        });
                        infoWindow.open(map, marker);
                        currentInfoWindowRef.current = infoWindow;
                    });

                    return marker;
                });

                navermaps.Event.addListener(map, 'click', () => {
                    if (currentInfoWindowRef.current) {
                        currentInfoWindowRef.current.close();
                        currentInfoWindowRef.current = null;
                    }
                });

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
                    onClusterClick: (cluster) => {
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

        // async function setup(area: string) {
        //     //  if (forceJson) return; // forceJson이 false면 실행하지 않음

        //     setLoading(true);
        //     console.log('📍 선택된 지역:', area);
        //     try {
        //         const MarkerClustering = makeMarkerClustering(window.naver);

        //         let data: any[] = [];

        //         const now = new Date();
        //         const currentYear = String(now.getFullYear());
        //         const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

        //         // 1. API (현재 월)
        //         // 해당 월의 거래 데이터가 있는 경우에만 API 호출 (실제 호출하여 가져오는 정보)
        //         // if (selectedYear === currentYear && selectedMonth === currentMonth) {
        //         //     const apiRes = await fetch(`/api/apt?year=${selectedYear}&month=${selectedMonth}&gu=${selectedGu}`);
        //         //     const apiData = await apiRes.json();
        //         //     data = [...data, ...apiData];
        //         // }

        //         // 2. JSON (과거 월)
        //         if (!(selectedYear === currentYear && selectedMonth === currentMonth)) {
        //             for (let m = 1; m <= 12; m++) {
        //                 const monthStr = m.toString().padStart(2, '0'); // "01", "02", ..., "12"

        //                 if (area !== null) {
        //                     console.log(`📂 ${area} 지역의 JSON 데이터 로드 (${selectedYear}_${monthStr})`);
        //                     try {
        //                         const jsonRes = await fetch(
        //                             `/data/apt/${area}/${area}_${selectedYear}_${monthStr}.json`
        //                         );
        //                         if (!jsonRes.ok) throw new Error('파일 없음');
        //                         const jsonData = await jsonRes.json();
        //                         data = [...data, ...jsonData];
        //                     } catch (e) {
        //                         console.warn(`⚠️ ${area}_${selectedYear}_${monthStr}.json 파일을 불러오지 못했습니다`);
        //                     }
        //                 } else {
        //                     console.log(`📂 ${selectedArea} 지역의 JSON 데이터 로드 (${selectedYear}_${monthStr})`);
        //                     try {
        //                         const jsonRes = await fetch(
        //                             `/data/apt/${selectedArea}/${selectedArea}_${selectedYear}_${monthStr}.json`
        //                         );
        //                         if (!jsonRes.ok) throw new Error('파일 없음');
        //                         const jsonData = await jsonRes.json();
        //                         data = [...data, ...jsonData];
        //                     } catch (e) {
        //                         console.warn(
        //                             `⚠️ ${selectedArea}_${selectedYear}_${monthStr}.json 파일을 불러오지 못했습니다`
        //                         );
        //                     }
        //                 }
        //             }

        //             // if (area !== null) {
        //             //     console.log(`📂 ${area} 지역의 JSON 데이터 로드 시작 1`);
        //             //     const jsonRes = await fetch(`/data/apt/${area}/${area}_${selectedYear}.json`);
        //             //     const jsonData = await jsonRes.json();
        //             //     data = [...data, ...jsonData];

        //             //     const jsonRes2 = await fetch(
        //             //         `/data/apt/${selectedArea}/${selectedArea}_${selectedYear}_7.json`
        //             //     );
        //             //     const jsonData2 = await jsonRes2.json();
        //             //     data = [...data, ...jsonData2];
        //             // } else {
        //             //     console.log(`📂 ${selectedArea} 지역의 JSON 데이터 로드 시작 2`);
        //             //     // 서울, 인천, 경기 외 지역은 JSON 데이터가 없으므로 빈 배열로 처리
        //             //     const jsonRes = await fetch(`/data/apt/${selectedArea}/${selectedArea}_${selectedYear}.json`);
        //             //     const jsonData = await jsonRes.json();
        //             //     data = [...data, ...jsonData];

        //             //     const jsonRes2 = await fetch(
        //             //         `/data/apt/${selectedArea}/${selectedArea}_${selectedYear}_7.json`
        //             //     );
        //             //     const jsonData2 = await jsonRes2.json();
        //             //     data = [...data, ...jsonData2];
        //             // }
        //         }

        //         // ✅ 이제 data = API + JSON 합쳐진 데이터
        //         const allDeals: AptDeal[] = data
        //             .filter((row: any) => row.latitude && row.longitude)
        //             .map((row: any) => ({
        //                 apt: row.aptNm,
        //                 date: `${row.dealYear}-${row.dealMonth}-${row.dealDay}`,
        //                 amount: row.dealAmount,
        //                 latitude: row.latitude,
        //                 longitude: row.longitude,
        //                 excluUseAr: row.excluUseAr,
        //                 floor: row.floor,
        //                 address: row.address
        //             }));

        //         const coordMap = new Map<string, AptDeal[]>();

        //         allDeals.forEach((deal) => {
        //             const key = `${deal.latitude},${deal.longitude}`;
        //             if (!coordMap.has(key)) coordMap.set(key, []);
        //             coordMap.get(key)!.push(deal);
        //         });

        //         //마커를 지도에 표시
        //         const markers = Array.from(coordMap.entries()).map(([key, deals]) => {
        //             const [lat, lng] = key.split(',').map(Number);
        //             const pos = new navermaps.LatLng(lat, lng);

        //             const marker = new navermaps.Marker({
        //                 position: pos,
        //                 icon: {
        //                     content: `
        //                                 <div style="
        //                                     position: relative;
        //                                     background: #FF8A00;
        //                                     color: white;
        //                                     padding: 4px 8px;
        //                                     border-radius: 4px;
        //                                     font-size: 11px;
        //                                     white-space: nowrap;
        //                                     box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        //                                 ">
        //                                     ${deals[0].apt}
        //                                     <div style="
        //                                         position: absolute;
        //                                         bottom: -16px;    /* 꼬리 위치 */
        //                                         left: 50%;
        //                                         transform: translateX(-50%);
        //                                         width: 0;
        //                                         height: 0;
        //                                         border-left: 5px solid transparent;
        //                                         border-right: 5px solid transparent;
        //                                         border-top: 16px solid #FF8A00;  /* 꼬리 길이 */
        //                                     "></div>
        //                                 </div>
        //                             `,
        //                     size: navermaps.Size(100, 40),
        //                     anchor: navermaps.Point(50, 20)
        //                 }
        //             });

        //             navermaps.Event.addListener(marker, 'click', () => {
        //                 if (currentInfoWindowRef.current) currentInfoWindowRef.current.close();

        //                 // 날짜 내림차순 정렬
        //                 const sortedDeals = [...deals].sort((a, b) => {
        //                     const aDate = new Date(a.date);
        //                     const bDate = new Date(b.date);
        //                     return bDate.getTime() - aDate.getTime();
        //                 });

        //                 const html = sortedDeals
        //                     .map((d) => {
        //                         const amount = Number(d.amount.replace(/,/g, ''));
        //                         const eok = Math.floor(amount / 10000);
        //                         const man = amount % 10000;

        //                         const amountStr =
        //                             eok > 0
        //                                 ? `${eok}억${man > 0 ? ' ' + man.toLocaleString() + '만원' : ''}`
        //                                 : `${man.toLocaleString()}만원`;

        //                         return `
        //                                     ${d.date} 💰${amountStr}<br/>
        //                                     전용면적: ${d.excluUseAr ?? '미상'}㎡<br/>
        //                                     층수: ${d.floor ?? '미상'}층
        //                                 `;
        //                     })
        //                     .join('<hr style="margin:4px 0;" />');

        //                 const infoWindow = new navermaps.InfoWindow({
        //                     content: `
        //                                 <div style="padding:4px; max-height:200px; overflow:auto;">
        //                                     🏢 <b>${deals[0].apt}</b><br/>
        //                                     📍 ${deals[0].address}<br/>
        //                                     ${html}
        //                                 </div>
        //                             `
        //                 });
        //                 infoWindow.open(map, marker);
        //                 currentInfoWindowRef.current = infoWindow;
        //             });

        //             return marker;
        //         });

        //         // ✅ 지도 클릭 시 InfoWindow 닫기
        //         navermaps.Event.addListener(map, 'click', () => {
        //             if (currentInfoWindowRef.current) {
        //                 currentInfoWindowRef.current.close();
        //                 currentInfoWindowRef.current = null;
        //             }
        //         });

        //         //클러스터를 지우는것
        //         // if (clusterRef.current) {
        //         //     //   clusterRef.current.clear();
        //         //     clusterRef.current.setMap(null);
        //         //     clusterRef.current = null;
        //         // }

        //         clusterRef.current = new MarkerClustering({
        //             minClusterSize: 2,
        //             maxZoom: 17,
        //             map,
        //             markers: markers,
        //             disableClickZoom: false,
        //             gridSize: 100,
        //             icons: [
        //                 {
        //                     content:
        //                         '<div style="cursor:pointer;width:40px;height:40px;line-height:40px;font-size:11px;color:white;text-align:center;font-weight:bold;background:#FF8A00;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);">{count}</div>',
        //                     size: navermaps.Size(40, 40),
        //                     anchor: navermaps.Point(20, 20)
        //                 }
        //             ],
        //             indexGenerator: [10, 50, 100, 300],
        //             stylingFunction: (clusterMarker, count) => {
        //                 clusterMarker.getElement().querySelector('div')!.innerText = count;
        //             },
        //             onClusterClick: (cluster, event) => {
        //                 const pos = cluster.getCenter();
        //                 const nextZoom = Math.min(map.getZoom() + 2, 18);
        //                 map.setZoom(nextZoom, true);
        //                 map.panTo(pos);
        //             }
        //         });
        //     } catch (e) {
        //         console.error('❌ 데이터 로드 실패', e);
        //     } finally {
        //         setLoading(false);
        //     }
        // }

        setup(null);

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

            <div
                className="absolute top-4 left-4 z-50 bg-white shadow p-2 rounded flex gap-2 text-sm flex-wrap"
                style={{ marginLeft: '30px', borderRadius: '8px', backgroundColor: 'rgb(214 167 255)' }}
            >
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="2024">2015</option>
                    <option value="2024">2016</option>
                    <option value="2024">2017</option>
                    <option value="2024">2018</option>
                    <option value="2024">2019</option>
                    <option value="2024">2020</option>
                    <option value="2024">2021</option>
                    <option value="2024">2022</option>
                    <option value="2024">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                </select>

                {/* <select
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
                </select> */}
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
