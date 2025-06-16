'use client';
import { Container as MapDiv, NaverMap, useNavermaps, Overlay, useMap } from 'react-naver-maps';
import { useState, useEffect, useContext, useRef } from 'react';
import { makeMarkerClustering } from './marker-cluster';
import 학원DATA from '../../data/seoulAcademy.json';
import { getCoordinates } from '../lib/getCoordinates';
import SearchContext from './SearchContext';

function MarkerCluster() {
    const { keyword, applyFilter, setApplyFilter } = useContext(SearchContext);
    const navermaps = useNavermaps();
    const map = useMap();

    const [cluster, setCluster] = useState(null);
    const markersRef = useRef([]); // ✅ 마커 보관용
    const [hasRun, setHasRun] = useState(false);

    // ✅ 마커 최초 생성
    useEffect(() => {
        if (!map || !window.naver || hasRun) return;

        async function setup() {
            const MarkerClustering = makeMarkerClustering(window.naver);
            const markers = [];

            for (const item of 학원DATA.DATA) {
                const fullAddress = item.fa_rdnma;
                if (!fullAddress.startsWith('서울특별시 강남구')) continue;

                const coord = await getCoordinates(fullAddress);
                if (!coord) continue;

                const latlng = new navermaps.LatLng(coord.latitude, coord.longitude);

                const marker = new navermaps.Marker({
                    position: latlng,
                    title: item.aca_nm,
                    map: map
                });

                const infoWindow = new navermaps.InfoWindow({
                    content: `<div style="padding:8px;font-size:12px;">🏫 ${item.aca_nm}</div>`,
                    backgroundColor: '#fff',
                    borderColor: '#333',
                    borderWidth: 1,
                    anchorSize: new navermaps.Size(10, 10),
                    anchorSkew: true
                });

                navermaps.Event.addListener(marker, 'click', () => {
                    if (infoWindow.getMap()) {
                        infoWindow.close();
                    } else {
                        infoWindow.open(map, marker);
                    }
                });

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

            setCluster(clusterInstance);
            setHasRun(true);
        }

        setup();
    }, [map, navermaps, hasRun]);

    // ✅ 검색 버튼 클릭 시 마커 스타일 업데이트
    useEffect(() => {
        if (!applyFilter || !markersRef.current.length) return;

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
