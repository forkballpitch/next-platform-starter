// app/api/download-apt/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import qs from 'qs';
import axios from 'axios';
import puppeteer from 'puppeteer';

const NAVER_CLIENT_ID = 'batn8474jt';
const NAVER_CLIENT_SECRET = 'QLoR1GARl50zrQN3d9rPRfEiS1wG9LtBiaGWAAG4';

const urlCheck = 'https://rt.molit.go.kr/pt/xls/ptXlsDownDataCheck.do';
const urlCsvDownload = 'https://rt.molit.go.kr/pt/xls/ptXlsCSVDown.do';

const postData = {
    srhThingNo: 'A',
    srhDelngSecd: '1',
    srhAddrGbn: '1',
    srhLfstsSecd: '1',
    sidoNm: '서울특별시',
    sggNm: '전체',
    emdNm: '전체',
    loadNm: '전체',
    areaNm: '전체',
    hsmpNm: '전체',
    srhFromDt: '2025-07-14',
    srhToDt: '2025-07-15',
    srhSidoCd: '11000'
};

async function getCoordinates(address: string) {
    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
    try {
        const res = await fetch(url, {
            headers: {
                'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
                'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET
            }
        });
        const data = await res.json();
        const addr = data.addresses?.[0];
        return addr ? { latitude: parseFloat(addr.y), longitude: parseFloat(addr.x) } : { latitude: '', longitude: '' };
    } catch (err) {
        console.warn(`❌ 주소 변환 실패: ${address}`);
        return { latitude: '', longitude: '' };
    }
}

async function getSessionCookie() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=', {
        waitUntil: 'networkidle2'
    });

    // ✅ 세션 활성화용 요청
    await page.evaluate(() => {
        const form = new URLSearchParams();
        form.append('srhThingNo', 'A');
        form.append('srhDelngSecd', '1');
        form.append('srhAddrGbn', '1');
        form.append('srhLfstsSecd', '1');
        form.append('sidoNm', '서울특별시');
        form.append('sggNm', '전체');
        form.append('emdNm', '전체');
        form.append('loadNm', '전체');
        form.append('areaNm', '전체');
        form.append('hsmpNm', '전체');
        form.append('srhFromDt', '2025-07-14');
        form.append('srhToDt', '2025-07-14');
        form.append('srhSidoCd', '11000');

        return fetch('/pt/xls/ptXlsDownDataCheck.do', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: form
        });
    });

    const cookies = await page.cookies();
    await browser.close();

    const sessionCookies = cookies
        .filter((c) => c.name === 'JSESSIONID' || c.name === 'WMONID')
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');

    console.log('✅ 세션 쿠키 추출 완료:', sessionCookies);
    return sessionCookies;
}

export async function GET() {
    try {
        const cookieHeader = await getSessionCookie();

        const headers = {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            Connection: 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Cookie: cookieHeader,
            Host: 'rt.molit.go.kr',
            Origin: 'https://rt.molit.go.kr',
            Referer: 'https://rt.molit.go.kr/pt/xls/xls.do?mobileAt=',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"'
        };

        await axios.post(urlCheck, qs.stringify(postData), { headers });

        const response = await axios.post(urlCsvDownload, qs.stringify(postData), {
            headers,
            responseType: 'arraybuffer'
        });

        const decoded = iconv.decode(response.data, 'euc-kr');
        const lines = decoded.split(/\r?\n/);
        const headerIndex = lines.findIndex((line) => line.startsWith('"NO"') || line.startsWith('NO'));
        const cleanCsv = lines.slice(headerIndex).join('\n');

        const records = parse(cleanCsv, { columns: true, skip_empty_lines: true });

        const enriched = await Promise.all(
            records.map(async (row: any) => {
                const road = row['도로명'];
                if (!road || road === '-') return { ...row, latitude: '', longitude: '' };

                const address = `서울특별시 ${road}`;
                const coords = await getCoordinates(address);
                return { ...row, latitude: coords.latitude, longitude: coords.longitude };
            })
        );

        const resultCsv = stringify(enriched, { header: true });
        console.log('✅ CSV 변환 완료, 크기:', resultCsv.length);
        const blob = await put('seoul_apt_2025_07.csv', resultCsv, { access: 'public', allowOverwrite: true });
        return NextResponse.json({ url: blob.url });
    } catch (err: any) {
        console.error('❌ 다운로드 실패:', err.message);
        return NextResponse.json({ error: '실거래가 다운로드 실패' }, { status: 500 });
    }
}
