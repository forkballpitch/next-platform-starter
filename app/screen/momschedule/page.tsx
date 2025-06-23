'use client';
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';

export default function MomSchedulePage() {
    const [tasks, setTasks] = useState([]);
    const [todoText, setTodoText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [statusLoadingId, setStatusLoadingId] = useState(null); // 🔄 상태 변경 로딩용

    const fetchTasks = async () => {
        const res = await fetch('/api/momTodo');
        const data = await res.json();
        setTasks(data);
    };

    const handleAdd = async () => {
        if (!todoText.trim()) return;
        await fetch('/api/momTodo', {
            method: 'POST',
            body: JSON.stringify({ taskname: todoText }),
            headers: { 'Content-Type': 'application/json' }
        });
        setTodoText('');
        fetchTasks();
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setStatusLoadingId(id); // 🔄 시작
        await fetch('/api/momTodo/status', {
            method: 'PUT',
            body: JSON.stringify({ id, newStatus }),
            headers: { 'Content-Type': 'application/json' }
        });
        await fetchTasks();
        setStatusLoadingId(null); // ✅ 종료
    };

    const handleDelete = async (id: string) => {
        await fetch('/api/momTodo', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        });
        fetchTasks();
    };

    const handleEdit = async (id: string, newText: string) => {
        await fetch('/api/momTodo/edit', {
            method: 'PUT',
            body: JSON.stringify({ id, taskname: newText }),
            headers: { 'Content-Type': 'application/json' }
        });
        setEditingId(null);
        setEditText('');
        fetchTasks();
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const statusStyle = {
        pending: 'text-gray-600',
        doing: 'text-blue-600 font-semibold',
        done: 'text-green-600 line-through'
    };

    const statusLabel = {
        pending: '대기',
        doing: '진행중',
        done: '완료'
    };

    return (
        <div className="p-4 max-w-xl mx-auto space-y-4">
            <h1 className="text-xl font-bold">📝 엄마 할 일</h1>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border p-2 rounded"
                    placeholder="할 일을 입력하세요"
                    value={todoText}
                    onChange={(e) => setTodoText(e.target.value)}
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
                    추가
                </button>
            </div>

            <ul>
                {tasks.map((task) => (
                    <li key={task._id} className="flex justify-between items-center border-b py-2">
                        {editingId === task._id ? (
                            <input
                                className="flex-1 border p-1 mr-2"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEdit(task._id, editText);
                                    if (e.key === 'Escape') {
                                        setEditingId(null);
                                        setEditText('');
                                    }
                                }}
                            />
                        ) : (
                            <span className={`flex-1 ${statusStyle[task.status]}`}>{task.taskname}</span>
                        )}

                        <div className="flex gap-2 items-center ml-2">
                            {statusLoadingId === task._id ? (
                                <Loader2 className="animate-spin w-5 h-5 text-gray-400" />
                            ) : (
                                <select
                                    className="text-sm border rounded p-1"
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                >
                                    {Object.entries(statusLabel).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {editingId === task._id ? (
                                <button
                                    className="text-blue-600 text-xs px-2 py-1"
                                    onClick={() => handleEdit(task._id, editText)}
                                >
                                    저장
                                </button>
                            ) : (
                                <button
                                    className="text-gray-500 hover:text-yellow-500"
                                    onClick={() => {
                                        setEditingId(task._id);
                                        setEditText(task.taskname);
                                    }}
                                >
                                    <Pencil size={18} />
                                </button>
                            )}

                            <button className="text-gray-500 hover:text-red-500" onClick={() => handleDelete(task._id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
