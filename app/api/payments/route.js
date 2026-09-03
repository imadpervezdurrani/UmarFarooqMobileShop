import { NextResponse } from 'next/server';
import { store, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.payments || [] });
}
