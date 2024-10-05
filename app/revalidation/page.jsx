// app/blobs/page.jsx
import React from 'react';
import AptTable from '../../components/AptTable';
import { fetchAptData } from '../lib/fetchAptData';

const Page = async () => {
    const data = await fetchAptData();

    return (
        <div>
            <h1>아파트 거래 정보</h1>
            <AptTable data={data} />
        </div>
    );
};

export default Page;
