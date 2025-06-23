'use client';
import { Container as MapDiv, NaverMap, useNavermaps, Overlay, useMap } from 'react-naver-maps';
import { useState, useEffect, useContext, useRef } from 'react';
import { makeMarkerClustering } from './marker-cluster';
import 학원DATA from '@/data/seoulAcademyWithCoords.json';
import { getCoordinates } from '../app/lib/getCoordinates';
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

    const currentInfoWindowRef = useRef(null); // ⬅️ 마커 말풍선 추적용

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

    // ✅ 마커 최초 생성
    useEffect(() => {
        if (!map || !window.naver || hasRun) return;

        async function setup() {
            const MarkerClustering = makeMarkerClustering(window.naver);
            const markers = [];

            // 좌표 → 해당 좌표의 학원 리스트를 보관
            const coordToInfoWindowMap = new Map();

            for (const item of 학원DATA.DATA) {
                const fullAddress = item.fa_rdnma;
                if (!fullAddress.startsWith('서울특별시 강남구')) continue;
                if (!item.latitude || !item.longitude) continue;

                const latlng = new navermaps.LatLng(item.latitude, item.longitude);
                const marker = new navermaps.Marker({
                    position: latlng,
                    title: item.aca_nm,
                    map: map
                });

                const coordKey = `${item.latitude},${item.longitude}`;
                const slug = encodeURIComponent(item.aca_nm);

                // 해당 좌표에 학원 목록 누적
                if (!coordToInfoWindowMap.has(coordKey)) {
                    coordToInfoWindowMap.set(coordKey, []);
                }
                coordToInfoWindowMap.get(coordKey).push({
                    name: item.aca_nm,
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
                markers.push({ marker, name: item.aca_nm });
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
                height: '100%',
                marginTop: '15px'
            }}
        >
            <NaverMap
                zoom={15}
                center={new navermaps.LatLng(37.494719, 127.063198)}
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
