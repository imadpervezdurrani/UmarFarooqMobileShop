import { NextResponse } from 'next/server';
import { resetDatabaseData, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  const res = resetDatabaseData();
  return NextResponse.json({ success: true, ...res });
}

export async function POST() {
  await connectDB();
  const res = resetDatabaseData();
  return NextResponse.json({ success: true, ...res });
}
