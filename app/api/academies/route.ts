import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
    const uri = 'mongodb+srv://admin:admin@cluster0.p3isnmw.mongodb.net'; //process.env.MONGODB_URI!;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('academy');
        const collection = db.collection('seoul');
        const data = await collection.find({}).toArray();

        return NextResponse.json(data);
    } catch (e) {
        console.error('❌ MongoDB 연결 오류', e);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
    } finally {
        await client.close();
    }
}
