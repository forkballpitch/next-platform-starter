import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
    const { id, taskname } = await req.json();
    const client = await clientPromise;
    const db = client.db('momnote');
    await db.collection('todos').updateOne({ _id: new ObjectId(id) }, { $set: { taskname } });
    return NextResponse.json({ success: true });
}
