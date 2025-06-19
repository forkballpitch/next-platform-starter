// app/hooks/useChatHistory.js
'use client';
import { useState, useEffect } from 'react';

export default function useChatHistory(sessionId = 'default') {
    const key = `chat_history_${sessionId}`;
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = sessionStorage.getItem(key);
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, [key]);

    const addToHistory = (role, content) => {
        const updated = [...history, { role, content }];
        setHistory(updated);
        sessionStorage.setItem(key, JSON.stringify(updated));
    };

    // ✅ 대화 내역 초기화 함수 추가
    const clearHistory = () => {
        setHistory([]);
    };

    return { history, addToHistory, clearHistory };
}
