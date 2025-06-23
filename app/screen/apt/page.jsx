'use client';
import { useEffect, useState } from 'react';

export default function AptDealsPage() {
    const [deals, setDeals] = useState([]);
    useEffect(() => {
        fetch('/api/fetchAptDeals')
            .then((res) => res.json())
            .then((data) => setDeals(data));
    }, []);

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">🏢 아파트 실거래 정보</h1>
            <ul className="space-y-2">
                {deals.map((deal, idx) => (
                    <li key={idx} className="border p-3 rounded shadow-sm">
                        <p className="font-semibold">🏠 {deal.apt}</p>
                        <p>📅 {deal.date}</p>
                        <p>💰 {deal.amount} 만원</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
