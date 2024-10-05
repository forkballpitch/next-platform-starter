// app/lib/fetchAptData.js
import { XMLParser } from 'fast-xml-parser';

export const fetchAptData = async () => {
    try {

        const serviceKey = process.env.SERVICE_KEY;
        const response = await fetch(
            `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade?serviceKey=${serviceKey}&LAWD_CD=11680&DEAL_YMD=202409&pageNo=1&numOfRows=1000`
        );
        const xmlString = await response.text();

        // XML 데이터를 JSON 형태로 변환합니다.
        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlString);

        const items = jsonObj.response.body.items.item;

        // 데이터가 배열인지 확인하고, 아니라면 배열로 변환합니다.
        const itemArray = Array.isArray(items) ? items : [items];

        return itemArray.map((item) => ({
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
            estateAgentSggNm: item.estateAgentSggNm || ''
        }));
    } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
        return [];
    }
};
