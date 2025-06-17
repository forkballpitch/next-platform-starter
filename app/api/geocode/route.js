// app/api/geocode/route.js
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    const res = await fetch(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`, {
        headers: {
            'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
            'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET
        }
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
