'use client';

import { useState, useEffect, useRef } from 'react';
import useChatHistory from '../../hooks/useChatHistory';

export default function AcademyQA() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { history, addToHistory } = useChatHistory('academy-qa');
    const endRef = useRef(null);

    const askLLM = async () => {
        if (!query.trim()) return;
        setLoading(true);

        try {
            const messages = [...history, { role: 'user', content: query }];
            const res = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: 'completion', data: messages })
            });

            const json = await res.json();
            addToHistory('user', query);
            addToHistory('assistant', json.text || '❌ 응답 없음');
            setQuery('');
        } catch (e) {
            addToHistory('user', query);
            addToHistory('assistant', '❌ 오류가 발생했습니다.');
            setQuery('');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [history]);

    return (
        <div className="flex flex-col h-[calc(100vh-56px-64px)] relative">
            {' '}
            {/* 헤더+네비 높이 제외 */}
            {/* Q&A 영역 */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36">
                {history.length === 0 ? (
                    <p className="text-gray-500">아직 질문이 없습니다.</p>
                ) : (
                    history.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`mb-3 p-3 rounded border bg-gray-50 whitespace-pre-wrap ${
                                msg.role === 'user' ? 'text-gray-700' : 'text-black'
                            }`}
                        >
                            <strong>{msg.role === 'user' ? 'Q:' : 'A:'}</strong> {msg.content}
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>
            {/* 입력창 (고정) */}
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t z-50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 border rounded"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && askLLM()}
                        placeholder="대치동 유치부 학원 추천해줘"
                    />
                    <button
                        onClick={askLLM}
                        disabled={loading}
                        className="bg-[#4B2EFF] text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? '생성중...' : '전송'}
                    </button>
                </div>
            </div>
        </div>
    );
}
