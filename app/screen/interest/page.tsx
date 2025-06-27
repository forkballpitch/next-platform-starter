'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function SalePage() {
    const [tasks, setTasks] = useState([]);
    const [todoText, setTodoText] = useState('');
    const [loading, setLoading] = useState(false);

    // Firestore에서 할 일 목록 가져오기
    const fetchTasks = async () => {
        const q = query(collection(db, 'todo'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setTasks(list);
    };

    // 할 일 추가
    const handleAddTodo = async () => {
        const trimmed = todoText.trim();
        if (!trimmed) {
            alert('할 일을 입력해 주세요!');
            return;
        }

        try {
            setLoading(true);
            await addDoc(collection(db, 'todo'), {
                taskname: trimmed,
                completed: false,
                createdAt: serverTimestamp()
            });
            setTodoText('');
            await fetchTasks();
        } catch (e) {
            console.error('등록 실패:', e);
            alert('등록 실패: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        const confirmed = confirm('정말 모든 할 일을 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            setLoading(true);
            const q = query(collection(db, 'todo'));
            const querySnapshot = await getDocs(q);

            const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, 'todo', docSnap.id)));

            await Promise.all(deletePromises);
            await fetchTasks();
        } catch (e) {
            console.error('전체 삭제 실패:', e);
            alert('전체 삭제 실패: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    // 할 일 삭제
    const handleDeleteTodo = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'todo', id));
            await fetchTasks();
        } catch (e) {
            console.error('삭제 실패:', e);
            alert('삭제 실패: ' + e.message);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow space-y-6">
            <h1 className="text-xl font-bold text-gray-800">📋 학원문의를 남겨주세요</h1>

            {/* 할 일 목록 */}
            <ul className="space-y-2">
                {tasks.map((task) => (
                    <li key={task.id} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                        <span className="text-gray-800">{task.taskname}</span>
                        <button
                            onClick={() => handleDeleteTodo(task.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            삭제
                        </button>
                    </li>
                ))}
                {tasks.length === 0 && <p className="text-gray-500 text-sm">문의가 없습니다</p>}
            </ul>

            {/* 입력창 */}
            <div>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-4 py-2"
                    placeholder="문의를 입력하세요"
                    value={todoText}
                    onChange={(e) => setTodoText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleAddTodo()}
                />
                <button
                    onClick={handleAddTodo}
                    disabled={loading}
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '등록 중...' : '등록하기'}
                </button>

                {/* ✅ 전체 삭제 버튼 */}
                <button
                    onClick={handleDeleteAll}
                    disabled={loading || tasks.length === 0}
                    className="mt-2 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                    모두 삭제하기
                </button>
            </div>
        </div>
    );
}
