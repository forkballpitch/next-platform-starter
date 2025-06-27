'use client';
import { Container as MapDiv, NaverMap, useNavermaps, Overlay, useMap } from 'react-naver-maps';
import { useState, useEffect, useContext, useRef } from 'react';
import { makeMarkerClustering } from './marker-cluster';
import academyData from '@/data/academy/seoulAcademyWithCoords.json';
import SearchContext from './SearchContext';
import { useRouter } from 'next/navigation'; // 맨 위에 추가

function MarkerCluster() {
    const { keyword, applyFilter, setApplyFilter } = useContext(SearchContext);
    const navermaps = useNavermaps();
    const map = useMap();
    const router = useRouter(); // ✅ 라우터 훅 사용

    const [cluster, setCluster] = useState(null);
    const markersRef = useRef([]); // ✅ 마커 보관용
    const [hasRun, setHasRun] = useState(false);
    const clusterRef = useRef(null);

    const { targetCoord, setTargetCoord } = useContext(SearchContext);

    const currentInfoWindowRef = useRef(null); // ⬅️ 마커 말풍선 추적용
    // ✅ 여기 위치에 getDistance 함수 선언!
    const HANTI_LAT = 37.498095;
    const HANTI_LNG = 127.051572;

    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in meters
    }

    useEffect(() => {
        if (targetCoord && map) {
            const pos = new navermaps.LatLng(targetCoord.latitude, targetCoord.longitude);

            // 동일 좌표의 학원 목록 가져오기
            const coordKey = `${targetCoord.latitude},${targetCoord.longitude}`;
            const matchedAcademies = academyData.filter((item) => `${item.latitude},${item.longitude}` === coordKey);

            const marker = new navermaps.Marker({ position: pos, map });

            // InfoWindow 내용 구성
            const content =
                matchedAcademies.length > 0
                    ? matchedAcademies
                          .map(
                              (item) => `
                <div style="margin-bottom:6px;">
                    🏫 ${item.ACA_NM}<br/>
                    <button onclick="window.dispatchEvent(new CustomEvent('marker-click', { detail: '${encodeURIComponent(
                        item.ACA_NM
                    )}' }))"
                        style="margin-top:4px;padding:4px 6px;border:none;background:#4B2EFF;color:white;border-radius:4px;cursor:pointer;">
                        ➡ 바로가기
                    </button>
                </div>
            `
                          )
                          .join('<hr style="margin:6px 0;" />')
                    : `<div>📍 검색된 위치입니다</div>`;

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
            setTargetCoord(null); // 한 번만 실행
        }
    }, [targetCoord, map]);

    useEffect(() => {
        const handleMarkerClick = (e) => {
            const slug = e.detail;
            router.push(`/screen/academy/${slug}`);
        };

        window.addEventListener('marker-click', handleMarkerClick);
        return () => {
            window.removeEventListener('marker-click', handleMarkerClick);
        };
    }, []);

    // ✅ 마커 최초 생성 (처음 화면 로딩시)
    useEffect(() => {
        if (!map || !window.naver || hasRun) return;

        // ✅ 지도 드래그 종료 시 현재 중심 좌표 출력
        navermaps.Event.addListener(map, 'dragend', () => {
            // const center = map.getCenter();
            // console.log(center);
            // renderAcademyMarkers(center.lat(), center.lng());
        });

        async function setup() {
            const MarkerClustering = makeMarkerClustering(window.naver);
            const markers = [];

            // 좌표 → 해당 좌표의 학원 리스트를 보관
            const coordToInfoWindowMap = new Map();

            // 🔍 학원 데이터에서 가까운 것만 필터링
            const sortedAcademies = academyData
                .filter((item) => item.latitude && item.longitude)

                .map((item) => {
                    const distance = getDistance(HANTI_LAT, HANTI_LNG, item.latitude, item.longitude);
                    return { ...item, distance };
                })
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 100);

            // for (const item of sortedAcademies) {
            for (const item of academyData) {
                const fullAddress = item.FA_RDNMA;
                if (!fullAddress.startsWith('서울특별시 강남구')) continue;
                if (!item.latitude || !item.longitude) continue;

                const distance = getDistance(HANTI_LAT, HANTI_LNG, item.latitude, item.longitude);
                if (distance > 1000) continue; // ✅ 반경 1km 이상은 제외

                const latlng = new navermaps.LatLng(item.latitude, item.longitude);
                const marker = new navermaps.Marker({
                    position: latlng,
                    title: item.ACA_NM,
                    map: map
                });

                const coordKey = `${item.latitude},${item.longitude}`;
                const slug = encodeURIComponent(item.ACA_NM);

                // 해당 좌표에 학원 목록 누적
                if (!coordToInfoWindowMap.has(coordKey)) {
                    coordToInfoWindowMap.set(coordKey, []);
                }
                coordToInfoWindowMap.get(coordKey).push({
                    name: item.ACA_NM,
                    slug
                });

                // 클릭 이벤트
                navermaps.Event.addListener(marker, 'click', () => {
                    if (currentInfoWindowRef.current) currentInfoWindowRef.current.close();

                    // 해당 좌표 학원 리스트 구성
                    const items = coordToInfoWindowMap
                        .get(coordKey)
                        .map(
                            ({ name, slug }) => `
        <div style="margin-bottom:6px;">
            🏫 ${name}<br/>
            <button onclick="window.dispatchEvent(new CustomEvent('marker-click', { detail: '${slug}' }))"
                style="margin-top:4px;padding:4px 6px;border:none;background:#4B2EFF;color:white;border-radius:4px;cursor:pointer;">
                ➡ 바로가기
            </button>
        </div>
    `
                        )
                        .join('<hr style="margin:6px 0;" />');

                    const infoWindow = new navermaps.InfoWindow({
                        content: `
        <div style="padding:8px;font-size:12px;max-width:220px;max-height:160px;overflow-y:auto;">
            ${items}
        </div>
    `
                    });

                    infoWindow.open(map, marker);
                    currentInfoWindowRef.current = infoWindow;
                });

                navermaps.Event.addListener(map, 'click', () => {
                    if (currentInfoWindowRef.current) {
                        currentInfoWindowRef.current.close();
                        currentInfoWindowRef.current = null;
                    }
                });

                // 마커는 무조건 모두 넣기 (중복 좌표라도)
                markers.push({ marker, name: item.ACA_NM });
            }

            markersRef.current = markers;

            const clusterInstance = new MarkerClustering({
                minClusterSize: 2,
                maxZoom: 18,
                map: map,
                markers: markers.map((m) => m.marker),
                disableClickZoom: false,
                gridSize: 80,
                icons: [
                    {
                        content:
                            '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(https://navermaps.github.io/maps.js.ncp/docs/img/cluster-marker-1.png);background-size:contain;"></div>',
                        size: navermaps.Size(40, 40),
                        anchor: navermaps.Point(20, 20)
                    }
                ],
                indexGenerator: [10, 100, 200, 500],
                stylingFunction: function (clusterMarker, count) {
                    clusterMarker.getElement().querySelector('div').innerText = count;
                },
                onClusterClick: (cluster, event) => {
                    const position = cluster.getCenter();
                    const currentZoom = map.getZoom();
                    const targetZoom = Math.min(currentZoom + 2, 18);

                    map.setZoom(targetZoom, true);
                    map.panTo(position);
                }
            });

            clusterRef.current = clusterInstance;

            setCluster(clusterInstance);
            setHasRun(true);
        }

        setup();
    }, [map, navermaps, hasRun]);

    // ✅ 검색 버튼 클릭 시 마커 스타일 업데이트
    useEffect(() => {
        if (!applyFilter || !markersRef.current.length) return;

        const matchedMarkers = markersRef.current.filter(({ name }) => keyword && name.includes(keyword));

        markersRef.current.forEach(({ marker, name }) => {
            const isMatch = keyword && name.includes(keyword);
            marker.setIcon(
                isMatch
                    ? {
                          content:
                              '<div style="width:20px;height:20px;border-radius:50%;background:red;border:2px solid white;"></div>',
                          size: navermaps.Size(20, 20),
                          anchor: navermaps.Point(10, 10)
                      }
                    : null
            );
        });

        // ✅ 첫 번째 매칭되는 마커 위치로 이동
        if (matchedMarkers.length > 0) {
            const firstMatched = matchedMarkers[0].marker;
            const position = firstMatched.getPosition();
            map.morph(position, 17); // 17은 확대 레벨
        }

        setApplyFilter(false); // ✅ 필터 완료 후 초기화
    }, [applyFilter, keyword]);

    if (!cluster) return null;
    return <Overlay element={cluster} />;
}

function NaverMapsMarkerCluster() {
    const navermaps = useNavermaps();

    return (
        <MapDiv
            style={{
                width: '100%',
                height: '100%'
            }}
        >
            <NaverMap
                zoom={16}
                center={new navermaps.LatLng(37.498095, 127.051572)} // ✅ 한티역 좌표
                zoomControl={true}
                zoomControlOptions={{
                    position: navermaps.Position.TOP_LEFT,
                    style: navermaps.ZoomControlStyle.SMALL
                }}
            >
                <MarkerCluster />
            </NaverMap>
        </MapDiv>
    );
}

export default NaverMapsMarkerCluster;
