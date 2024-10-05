// app/components/AptTable.jsx
const AptTable = ({ data }) => {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px' }}>아파트 이름</th>
                <th style={{ padding: '10px' }}>법정동</th>
                <th style={{ padding: '10px' }}>지번</th>
                <th style={{ padding: '10px' }}>지역코드</th>
                <th style={{ padding: '10px' }}>전용 면적 (㎡)</th>
                <th style={{ padding: '10px' }}>거래 금액 (만원)</th>
                <th style={{ padding: '10px' }}>계약 년도</th>
                <th style={{ padding: '10px' }}>계약 월</th>
                <th style={{ padding: '10px' }}>계약 일</th>
                <th style={{ padding: '10px' }}>층</th>
                <th style={{ padding: '10px' }}>건축 년도</th>
                <th style={{ padding: '10px' }}>중개사소재지</th>
                <th style={{ padding: '10px' }}>해제 여부</th>
                <th style={{ padding: '10px' }}>등록일자</th>
            </tr>
            </thead>
            <tbody>
            {data.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{item.aptNm}</td>
                    <td style={{ padding: '10px' }}>{item.umdNm}</td>
                    <td style={{ padding: '10px' }}>{item.jibun}</td>
                    <td style={{ padding: '10px' }}>{item.sggCd}</td>
                    <td style={{ padding: '10px' }}>{item.excluUseAr}</td>
                    <td style={{ padding: '10px' }}>{item.dealAmount}</td>
                    <td style={{ padding: '10px' }}>{item.dealYear}</td>
                    <td style={{ padding: '10px' }}>{item.dealMonth}</td>
                    <td style={{ padding: '10px' }}>{item.dealDay}</td>
                    <td style={{ padding: '10px' }}>{item.floor}</td>
                    <td style={{ padding: '10px' }}>{item.buildYear}</td>
                    <td style={{ padding: '10px' }}>{item.estateAgentSggNm}</td>
                    <td style={{ padding: '10px' }}>{item.cdealType}</td>
                    <td style={{ padding: '10px' }}>{item.rgstDate}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default AptTable;
