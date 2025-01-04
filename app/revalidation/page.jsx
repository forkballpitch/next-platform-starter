'use client'; // 이 라인이 클라이언트 컴포넌트임을 명시합니다.

import React, { useEffect, useState } from 'react';
import AptTable from '../../components/AptTable';

const Page = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);  // 로딩 상태를 관리
    const [dealYmd, setDealYmd] = useState('202410'); // 초기값 '202410'

    // dealYmd 값을 선택한 후 데이터 다시 가져오는 함수
    const handleDealYmdChange = (event) => {
        setDealYmd(event.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);  // 데이터 로딩 시작
            const response = await fetch(`/api/aptData?dealYmd=${dealYmd}`);
            const data = await response.json();
            setData(data);
            setLoading(false);  // 데이터 로딩 완료
        };

        fetchData();
    }, [dealYmd]); // dealYmd 값이 변경될 때마다 호출

    return (
        <div>
            <h1>아파트 거래 정보</h1>

            {/* 셀렉트 박스 */}
            <select onChange={handleDealYmdChange} value={dealYmd}>
                <option value="202410">2024년 10월</option>
                <option value="202411">2024년 11월</option>
                <option value="202412">2024년 12월</option>
            </select>

            {/* 테이블 위에 작은 로딩바 */}
            {loading && (
                <div style={styles.loadingBarContainer}>
                    <div style={styles.loader}></div>
                </div>
            )}

            {/* 테이블 */}
            <AptTable data={data} />
        </div>
    );
};

const styles = {
    loadingBarContainer: {
        width: '100%',
        height: '5px',
        marginBottom: '10px', // 테이블과 로딩 바 사이에 간격 추가
        backgroundColor: '#fcfcfc',
        position: 'relative'
    },
    loader: {
        width: '50px',
        height: '5px',
        backgroundColor: '#3498db',
        animation: 'load 2s infinite'
    },
    '@keyframes load': {
        '0%': {
            left: '-100%'
        },
        '100%': {
            left: '100%'
        }
    }
};

export default Page;
