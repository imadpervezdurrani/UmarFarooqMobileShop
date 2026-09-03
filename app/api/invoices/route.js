import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.invoices || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body.id || `inv-${Date.now()}`;
    const newInv = { ...body, id, createdAt: body.createdAt || new Date().toISOString() };

    if (!store.invoices) store.invoices = [];
    store.invoices.unshift(newInv);
    await saveDB();

    return NextResponse.json({ success: true, data: newInv, message: 'Invoice saved' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
