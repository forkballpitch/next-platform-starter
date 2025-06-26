'use client';
import { Container as MapDiv, NaverMap, useNavermaps, Overlay, useMap } from 'react-naver-maps';
import { useState, useEffect, useContext, useRef } from 'react';
import { makeMarkerClustering } from './marker-cluster';
import { fetchPlaceByName } from '../app/lib/fetchPlaceByName';
import SearchContext from './SearchContext';
import { useRouter } from 'next/navigation';
import { getCoordinates } from '../app/lib/getCoordinates';

declare global {
    interface Window {
        naver: any;
    }
}

interface AptDeal {
    apt: string;
    date: string;
    amount: string;
    latitude?: number;
    longitude?: number;
}

function MarkerCluster() {
    const { keyword, applyFilter, setApplyFilter, targetCoord, setTargetCoord } = useContext(SearchContext);
    const navermaps = useNavermaps();
    const map = useMap();
    const router = useRouter();

    const [aptDeals, setAptDeals] = useState<AptDeal[]>([]);
    const aptMarkersRef = useRef<any[]>([]);
    const currentInfoWindowRef = useRef<any>(null);

    useEffect(() => {
        if (!map || !window.naver) return;

        async function setup() {
            const res = await fetch('/api/fetchAptDeals');
            const rawDeals: AptDeal[] = await res.json();

            const enriched: AptDeal[] = [];
            for (const deal of rawDeals) {
                try {
                    const placeList = await fetchPlaceByName(deal.apt);
                    const top = placeList.places[0];
                    const coord = await getCoordinates(top.address);
                    //console.log(coord);
                    if (top?.latitude && top?.longitude) {
                        enriched.push({ ...deal, latitude: top.latitude, longitude: top.longitude });
                    }
                } catch (err) {
                    console.warn('❌ 좌표 변환 실패:', deal.apt);
                }
            }

            setAptDeals(enriched);

            aptMarkersRef.current.forEach((marker) => marker.setMap(null));
            aptMarkersRef.current = [];

            enriched.forEach((deal) => {
                console.log(deal);
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
                                        <div style="font-weight: bold; font-size: 12px; color: #fff;">${deal.apt}</div>
                                        <div style="margin-top: 2px;">💰 ${deal.amount}만</div>
                                        <div style="font-size: 10px; color: #ffe;">📅 ${deal.date}</div>
                                    </div>
                                `,
                        size: navermaps.Size(100, 60),
                        anchor: navermaps.Point(50, 60)
                    },

                    map
                });

                navermaps.Event.addListener(marker, 'click', () => {
                    const infoWindow = new navermaps.InfoWindow({
                        content: `<div style="padding:6px;font-size:12px;">🏢 ${deal.apt}<br/>💰 ${deal.amount}만원<br/>📅 ${deal.date}</div>`
                    });
                    infoWindow.open(map, marker);
                    currentInfoWindowRef.current = infoWindow;
                });

                aptMarkersRef.current.push(marker);
            });
        }

        setup();
    }, [map, navermaps]);

    return null;
}

function NaverMapsMarkerCluster() {
    const navermaps = useNavermaps();
    const [center, setCenter] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter(new navermaps.LatLng(position.coords.latitude, position.coords.longitude));
                },
                (error) => {
                    console.warn('📍 위치 접근 실패:', error);
                    setCenter(new navermaps.LatLng(37.498095, 127.051572)); // fallback: 한티역
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
                <MarkerCluster />
            </NaverMap>
        </MapDiv>
    );
}

export default NaverMapsMarkerCluster;
