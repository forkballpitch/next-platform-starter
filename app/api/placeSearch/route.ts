// app/api/placeSearch/route.ts
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const clientId = process.env.NAVER_CLIENT_ID!;
const clientSecret = process.env.NAVER_CLIENT_SECRET!;

type NaverLocalSearchItem = {
    title: string;
    link: string;
    category: string;
    description: string;
    telephone: string;
    address: string;
    roadAddress: string;
    mapx: string;
    mapy: string;
};

type NaverLocalSearchResponse = {
    items: NaverLocalSearchItem[];
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
        query
    )}&display=10&start=1&sort=random`;

    const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'X-Naver-Client-Id': 'MTHfm6RuTOkngLD1zHzG',
            'X-Naver-Client-Secret': 'V2waJviW3S'
        }
    });

    if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch from Naver API' }, { status: res.status });
    }

    const json = (await res.json()) as NaverLocalSearchResponse;

    // ✅ 타입 안전 검사
    if (!('items' in json) || !Array.isArray(json.items)) {
        return NextResponse.json({ error: 'Unexpected API response format' }, { status: 500 });
    }

    const places = json.items.map((item: NaverLocalSearchItem) => ({
        name: item.title.replace(/<\/?b>/g, ''),
        address: item.roadAddress || item.address,
        description: item.description,
        latitude: parseFloat(item.mapy) / 10000000,
        longitude: parseFloat(item.mapx) / 10000000
    }));

    return NextResponse.json({ places });
}
