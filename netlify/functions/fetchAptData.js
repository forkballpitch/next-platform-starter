import { MongoClient } from 'mongodb';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
// MongoDB connection URI
const uri =
    'mongodb+srv://forkballpitch:richtto42@cluster0.dwp0j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB database and collection
const dbName = 'aptData';
const collectionName = 'aptTrades';

// 서버리스 함수로 구현
export async function handler(event) {
    const { queryStringParameters } = event;
    const type = queryStringParameters?.type;
    const zone = queryStringParameters?.zone;
    const dealYmd = queryStringParameters.dealYmd; // dealYmd를 쿼리 파라미터로 받음

    // ✅ 1. academy.json 요청 처리
    if (type === 'academy') {
        try {
            const filePath = path.resolve('data', 'seoulAcademy.json');
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(fileContent);

            // ✅ "강남구" 필터링
            const filteredData = zone ? jsonData.DATA.filter((item) => item.admst_zone_nm === zone) : jsonData.DATA;
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    DESCRIPTION: jsonData.DESCRIPTION,
                    DATA: filteredData
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'academy.json 파일을 불러오는 데 실패했습니다.', detail: error.message })
            };
        }
    }

    if (!dealYmd) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'dealYmd 쿼리 파라미터가 필요합니다.' })
        };
    }

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('MongoDB connected');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // MongoDB에서 데이터 조회
        const existingData = await collection.find({ dealYearMonth: dealYmd }).toArray();

        if (existingData.length > 0) {
            console.log('데이터가 이미 존재합니다. MongoDB에서 데이터를 가져옵니다.');
            return {
                statusCode: 200,
                body: JSON.stringify(existingData)
            };
        }

        console.log('데이터가 존재하지 않아서 외부 API에서 데이터를 가져옵니다.');

        // 외부 API에서 데이터 가져오기
        const response = await fetch(
            `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=FlpYg6FrLyjGMOoASdmGjiJhOknAga5KWrOieY%2FTJYfXAxNJBzHvHskaQfSkmq05yI2noHvIr1Kh%2BnYrMZ4Afw%3D%3D&LAWD_CD=11680&DEAL_YMD=${dealYmd}&pageNo=1&numOfRows=1000`
        );
        const xmlString = await response.text();

        // XML 데이터를 JSON으로 변환
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlString);

        const items = jsonObj.response.body.items.item;
        const itemArray = Array.isArray(items) ? items : [items];

        // MongoDB에 데이터 삽입
        const result = await collection.insertMany(
            itemArray.map((item) => ({
                aptDong: item.aptDong || '',
                aptNm: item.aptNm || '',
                buildYear: item.buildYear || '',
                dealAmount: item.dealAmount || '',
                dealDay: item.dealDay || '',
                dealMonth: item.dealMonth || '',
                dealYear: item.dealYear || '',
                floor: item.floor || '',
                excluUseAr: item.excluUseAr || '',
                umdNm: item.umdNm || '',
                jibun: item.jibun || '',
                sggCd: item.sggCd || '',
                cdealType: item.cdealType || '',
                rgstDate: item.rgstDate || '',
                estateAgentSggNm: item.estateAgentSggNm || '',
                dealYearMonth: dealYmd
            }))
        );

        console.log(`${result.insertedCount} documents inserted into MongoDB`);

        return {
            statusCode: 200,
            body: JSON.stringify(itemArray)
        };
    } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: '데이터를 가져오는데 실패했습니다.' })
        };
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}
