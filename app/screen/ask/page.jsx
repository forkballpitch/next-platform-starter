'use client';

import { useState, useRef, useEffect } from 'react';
import useChatHistory from '../../hooks/useChatHistory';

export default function AcademyQA() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { history, addToHistory } = useChatHistory('academy-qa');
    const scrollRef = useRef(null);

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

    // ✅ 최신 질문으로 스크롤 이동
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="flex flex-col h-screen bg-white text-black">
            {/* Q&A 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
                {history.length === 0 ? (
                    <p className="text-gray-500">아직 질문이 없습니다.</p>
                ) : (
                    history.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded border bg-gray-50 whitespace-pre-wrap ${
                                msg.role === 'user' ? 'text-gray-700' : 'text-black'
                            }`}
                        >
                            <strong>{msg.role === 'user' ? 'Q:' : 'A:'}</strong> {msg.content}
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* 입력창 */}
            <div className="border-t p-4 bg-white fixed bottom-14 left-0 right-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-2 border rounded"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && askLLM()}
                        placeholder="질문을 입력하세요"
                    />
                    <button onClick={askLLM} disabled={loading} className="bg-[#4B2EFF] text-white px-4 py-2 rounded">
                        {loading ? '응답생성중...' : '전송'}
                    </button>
                </div>
            </div>
        </div>
    );
}
