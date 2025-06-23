import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET() {
    const serviceKey = process.env.APT_API_KEY;
    const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${serviceKey}&LAWD_CD=11110&DEAL_YMD=202505`;

    const response = await fetch(url);
    const xml = await response.text();
    const parser = new XMLParser();
    const json = parser.parse(xml);

    const items = json.response.body.items.item || [];
    const deals = items.map((item: any) => ({
        apt: item.aptNm,
        date: `${item.dealYear}-${String(item.dealMonth).padStart(2, '0')}-${String(item.dealDay).padStart(2, '0')}`,
        amount: item.dealAmount.trim()
    }));

    return NextResponse.json(deals);
}
