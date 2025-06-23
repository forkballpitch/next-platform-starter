import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    const client = await clientPromise;
    const db = client.db('momnote');
    const tasks = await db.collection('todos').find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(tasks);
}

export async function POST(req: Request) {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('momnote');
    const newTask = {
        taskname: body.taskname,
        status: 'pending', // 기본값
        createdAt: new Date()
    };
    const result = await db.collection('todos').insertOne(newTask);
    return NextResponse.json({ ...newTask, _id: result.insertedId });
}

export async function PUT(req: Request) {
    const { id, currentStatus } = await req.json();
    const nextStatus = currentStatus === 'pending' ? 'doing' : currentStatus === 'doing' ? 'done' : 'pending';

    const client = await clientPromise;
    const db = client.db('momnote');
    await db.collection('todos').updateOne({ _id: new ObjectId(id) }, { $set: { status: nextStatus } });
    return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
    const { id } = await req.json();
    const client = await clientPromise;
    const db = client.db('momnote');
    await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
    try {
        const { id, newTaskname } = await req.json();

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: '잘못된 ID입니다.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('momnote');

        await db.collection('todos').updateOne({ _id: new ObjectId(id) }, { $set: { taskname: newTaskname } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH 에러:', error);
        return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
    }
}
