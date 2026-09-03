import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    server: 'Umar Farooq Mobile Zone - Next.js Full Stack Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
