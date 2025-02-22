import { MongoClient } from 'mongodb';
import { XMLParser } from 'fast-xml-parser';

// MongoDB connection URI
const uri = 'mongodb+srv://forkballpitch:richtto42@cluster0.dwp0j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// MongoDB database and collection
const dbName = 'aptData';  // Example database name
const collectionName = 'aptTrades';  // Example collection name

export const fetchAptData = async (dealYmd) => {  // dealYmd를 매개변수로 추가
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to MongoDB
        await client.connect();
        console.log('MongoDB connected');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // MongoDB에서 데이터 조회
        const existingData = await collection.find({ dealYearMonth: dealYmd }).toArray();  // dealYmd 필터링

        if (existingData.length > 0) {
            console.log('데이터가 이미 존재합니다. MongoDB에서 데이터를 가져옵니다.');
            return existingData;
        }

        console.log('데이터가 존재하지 않아서 외부 API에서 데이터를 가져옵니다.');

        // API에서 데이터 가져오기
        const response = await fetch(
            `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=FlpYg6FrLyjGMOoASdmGjiJhOknAga5KWrOieY%2FTJYfXAxNJBzHvHskaQfSkmq05yI2noHvIr1Kh%2BnYrMZ4Afw%3D%3D&LAWD_CD=11680&DEAL_YMD=${dealYmd}&pageNo=1&numOfRows=1000`
        );
        const xmlString = await response.text();

        // XML 데이터를 JSON 형태로 변환
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlString);

        const items = jsonObj.response.body.items.item;

        // 데이터가 배열인지 확인하고, 아니라면 배열로 변환
        const itemArray = Array.isArray(items) ? items : [items];

        // MongoDB에 데이터 삽입
        const result = await collection.insertMany(itemArray.map((item) => ({
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
            dealYearMonth: dealYmd  // 데이터를 저장할 때 DEAL_YMD도 포함
        })));

        console.log(`${result.insertedCount} documents inserted into MongoDB`);

        return itemArray;
    } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
        return [];
    } finally {
        // MongoDB 연결 종료
        await client.close();
        console.log('MongoDB connection closed');
    }
};
