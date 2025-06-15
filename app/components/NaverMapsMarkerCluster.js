// src/components/NaverMapsMarkerCluster.js
'use client';
import { Container as MapDiv, NaverMap, useNavermaps, Overlay, useMap } from 'react-naver-maps';
import { useState } from 'react';
import { makeMarkerClustering } from './marker-cluster';
import { accidentDeath } from './data/accidentdeath.js';

function MarkerCluster() {
    const navermaps = useNavermaps();
    const map = useMap();

    // 아래 링크에서 marker-cluster.js를 다운로드한 후 이 컴포넌트와 동일 경로에 두고 import 하였다.
    // https://github.com/zeakd/react-naver-maps/blob/main/website/src/samples/marker-cluster.js
    const MarkerClustering = makeMarkerClustering(window.naver);

    const htmlMarker1 = {
        content:
            '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(https://navermaps.github.io/maps.js.ncp/docs/img/cluster-marker-1.png);background-size:contain;"></div>',
        size: navermaps.Size(40, 40),
        anchor: navermaps.Point(20, 20)
    };
    const htmlMarker2 = {
        content:
            '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(https://navermaps.github.io/maps.js.ncp/docs/img/cluster-marker-2.png);background-size:contain;"></div>',
        size: navermaps.Size(40, 40),
        anchor: navermaps.Point(20, 20)
    };
    const htmlMarker3 = {
        content:
            '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(https://navermaps.github.io/maps.js.ncp/docs/img/cluster-marker-3.png);background-size:contain;"></div>',
        size: navermaps.Size(40, 40),
        anchor: navermaps.Point(20, 20)
    };
    const htmlMarker4 = {
        content:
            '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(https://navermaps.github.io/maps.js.ncp/docs/img/cluster-marker-4.png);background-size:contain;"></div>',
        size: navermaps.Size(40, 40),
        anchor: navermaps.Point(20, 20)
    };
    const htmlMarker5 = {
        content:
            '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(https://navermaps.github.io/maps.js.ncp/docs/img/cluster-marker-5.png);background-size:contain;"></div>',
        size: navermaps.Size(40, 40), // naver.maps를 navermaps로 수정
        anchor: navermaps.Point(20, 20) // (상동)
    };

    // 아래 링크에서 데이터가 든 js 파일 다운로드
    // https://github.com/navermaps/marker-tools.js/blob/master/marker-clustering/data/accidentdeath.js
    const data = accidentDeath.searchResult.accidentDeath;

    const [cluster] = useState(() => {
        const markers = [];

        for (var i = 0, ii = data.length; i < ii; i++) {
            var spot = data[i],
                latlng = new navermaps.LatLng(spot.grd_la, spot.grd_lo),
                marker = new navermaps.Marker({
                    position: latlng,
                    draggable: true
                });

            markers.push(marker);
        }

        const cluster = new MarkerClustering({
            minClusterSize: 2,
            maxZoom: 8,
            map: map,
            markers: markers,
            disableClickZoom: false,
            gridSize: 120,
            icons: [htmlMarker1, htmlMarker2, htmlMarker3, htmlMarker4, htmlMarker5],
            indexGenerator: [10, 100, 200, 500, 1000],
            stylingFunction: function (clusterMarker, count) {
                clusterMarker.getElement().querySelector('div:first-child').innerText = count;
            }
        });

        return cluster;
    });

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
                zoom={6}
                center={new navermaps.LatLng(36.2253017, 127.6460516)}
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
