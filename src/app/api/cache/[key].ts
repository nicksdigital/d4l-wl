import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  },
  password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

await redisClient.connect();

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const data = await redisClient.get(params.key);
    if (data === null) {
      return NextResponse.json({ error: 'Key not found in cache' }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json({ error: 'Failed to get data from cache' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const deleted = await redisClient.del(params.key);
    if (deleted === 0) {
      return NextResponse.json({ error: 'Key not found in cache' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete from cache' }, { status: 500 });
  }
}
