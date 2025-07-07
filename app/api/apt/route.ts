import { NextRequest } from 'next/server';
import { parseStringPromise } from 'xml2js';

const serviceKey = 'uPBe0WsM2NosSYcm0xFIdYOynTpXBeDm1fcH5ZYOevJT9MnKAdEZlooImBdPPb7dDNXLag903rfo4J2Cxw7v8w%3D%3D';
const clientId = 'batn8474jt';
const clientSecret = 'QLoR1GARl50zrQN3d9rPRfEiS1wG9LtBiaGWAAG4';

async function getTotalCount(lawdCd: string, dealYmd: string) {
    const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${serviceKey}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=10&pageNo=1`;
    const res = await fetch(url);
    const xml = await res.text();
    const parsed = await parseStringPromise(xml);
    const totalCount = parseInt(parsed.response.body[0].totalCount[0]);
    return totalCount;
}

async function getAptDeals(lawdCd: string, dealYmd: string, totalCount: number) {
    const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${serviceKey}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=${totalCount}&pageNo=1`;
    const res = await fetch(url);
    const xml = await res.text();
    const parsed = await parseStringPromise(xml);
    return parsed.response.body[0].items?.[0].item || [];
}

async function getCoordinates(address: string) {
    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
    try {
        const res = await fetch(url, {
            headers: {
                'X-NCP-APIGW-API-KEY-ID': clientId,
                'X-NCP-APIGW-API-KEY': clientSecret
            }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const addr = data.addresses?.[0];
        if (!addr) return null;
        return {
            latitude: parseFloat(addr.y),
            longitude: parseFloat(addr.x)
        };
    } catch {
        return null;
    }
}

function flatten(obj: any) {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key]) && obj[key].length === 1) {
            obj[key] = obj[key][0];
        } else if (typeof obj[key] === 'object') {
            flatten(obj[key]);
        }
    }
    return obj;
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const gu = searchParams.get('gu');

        if (!year || !month || !gu) {
            return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
        }

        // 구 코드 매핑
        const guList = {
            강남구: '11680',
            송파구: '11710',
            서초구: '11650'
            // 필요하다면 추가
        };

        const lawdCd = guList[gu];
        if (!lawdCd) {
            return new Response(JSON.stringify({ error: 'Invalid gu' }), { status: 400 });
        }

        const dealYmd = `${year}${month.padStart(2, '0')}`;

        const totalCount = await getTotalCount(lawdCd, dealYmd);
        if (totalCount === 0) {
            return new Response(JSON.stringify([]), { status: 200 });
        }

        const deals = await getAptDeals(lawdCd, dealYmd, totalCount);

        const results: any[] = [];
        for (const apt of deals) {
            const dong = apt.umdNm?.[0] || '';
            const jibun = apt.jibun?.[0] || '';
            const address = `${gu} ${dong} ${jibun}`;
            console.log(`⏳ 좌표 변환 중: ${address}`);
            const coords = await getCoordinates(address);

            const flattened = flatten(apt);
            results.push({
                ...flattened,
                latitude: coords?.latitude ?? null,
                longitude: coords?.longitude ?? null,
                address,
                gu
            });
        }

        return new Response(JSON.stringify(results), { status: 200 });
    } catch (e) {
        console.error('API route error', e);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
