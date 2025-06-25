'use client';

import { useState, useEffect, useRef } from 'react';
import useChatHistory from '../../hooks/useChatHistory';

// 상단에 추가
import { PlusIcon, Cog6ToothIcon, MicrophoneIcon, ArrowUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function AcademyQA() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { history, addToHistory, clearHistory } = useChatHistory('academy-qa');
    const endRef = useRef(null);

    const askLLM = async () => {
        if (!query.trim()) return;

        const currentQuery = query.trim();
        setQuery(''); // 입력 필드 먼저 초기화

        // ✅ 질문을 먼저 화면에 표시
        addToHistory('user', currentQuery);
        setLoading(true);

        try {
            // ✅ API 호출용 메시지 배열 구성 (현재 history + 새 질문)
            const messagesForAPI = [...history, { role: 'user', content: currentQuery }];

            const res = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: 'completion', data: messagesForAPI })
            });

            const json = await res.json();
            addToHistory('assistant', json.text || '❌ 응답 없음');
        } catch (e) {
            addToHistory('assistant', '❌ 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [history]);

    return (
        <div className="flex flex-col h-full" style={{ paddingBottom: '64px' }}>
            {/* Q&A 영역 - 컨텐츠가 넘칠 때만 스크롤 */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-8 pb-4 bg-[#3c3f4a]">
                {history.length === 0 ? (
                    <p className="text-gray-500">Claude LLM 에게 질문하세요</p>
                ) : (
                    (() => {
                        const qaGroups = [];
                        for (let i = 0; i < history.length; i += 2) {
                            const question = history[i];
                            const answer = history[i + 1];
                            if (question && question.role === 'user') {
                                qaGroups.push({ question, answer, index: i });
                            }
                        }

                        return qaGroups.map(({ question, answer, index }) => (
                            <div key={index} className="mb-4 p-4 rounded border border-gray-300 bg-gray-200">
                                {/* 질문 */}
                                <div className="mb-3">
                                    <span className="font-bold text-gray-800">Q:</span>
                                    <span className="ml-2 text-gray-800 whitespace-pre-wrap">{question.content}</span>
                                </div>

                                {/* 답변 */}
                                <div className="bg-[#3f414d] rounded p-3 mt-2">
                                    <span className="font-bold text-green-300">A:</span>
                                    <span className="ml-2 text-white whitespace-pre-wrap">
                                        {answer
                                            ? answer.content
                                            : loading && index === history.length - 1
                                            ? '답변을 생성중입니다...'
                                            : '답변 없음'}
                                    </span>
                                </div>
                            </div>
                        ));
                    })()
                )}

                <div ref={endRef} />
            </div>

            {/* 입력창 - 하단 고정 (스크롤 안됨) */}

            <div className="flex-shrink-0 bg-[#343541] px-4 py-3 border-t border-[#3f4045]">
                <div className="flex items-center rounded-2xl bg-[#40414f] px-4 py-2 gap-3 text-white">
                    {/* + 아이콘 (히스토리 초기화) */}
                    <button
                        onClick={() => {
                            clearHistory();
                            setQuery('');
                        }}
                        className="hover:text-gray-300"
                        title="새 채팅"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>

                    {/* 입력창 */}
                    <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                        placeholder="대치동 코딩학원 추천해줘"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !loading && askLLM()}
                        disabled={loading}
                    />

                    {/* 전송 버튼 */}
                    <button
                        onClick={askLLM}
                        disabled={loading || !query.trim()}
                        className="bg-white text-black rounded-full p-2 w-8 h-8 flex items-center justify-center disabled:opacity-50"
                        title="전송"
                    >
                        {loading ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                            <ArrowUpIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
