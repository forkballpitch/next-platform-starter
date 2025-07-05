// app/api/geo/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
        return new Response(JSON.stringify({ error: 'lat,lng required' }), {
            status: 400
        });
    }

    try {
        const url = `https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lng},${lat}&output=json&orders=legalcode,admcode,addr,roadaddr`;

        const res = await fetch(url, {
            headers: {
                'X-NCP-APIGW-API-KEY-ID': 'batn8474jt',
                'X-NCP-APIGW-API-KEY': 'QLoR1GARl50zrQN3d9rPRfEiS1wG9LtBiaGWAAG4'
            }
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), {
            status: 200
        });
    } catch (e) {
        console.error('API error', e);
        return new Response(JSON.stringify({ error: 'server error' }), {
            status: 500
        });
    }
}
