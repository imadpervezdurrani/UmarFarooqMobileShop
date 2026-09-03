import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.expenses || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body.id || `exp-${Date.now()}`;
    const newExp = {
      ...body,
      id,
      amount: Number(body.amount) || 0,
      date: body.date || new Date().toISOString().split('T')[0],
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (!store.expenses) store.expenses = [];
    store.expenses.unshift(newExp);
    await saveDB();

    return NextResponse.json({ success: true, data: newExp, message: 'Expense recorded' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const index = (store.expenses || []).findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 });

    const deleted = store.expenses.splice(index, 1)[0];
    await saveDB();
    return NextResponse.json({ success: true, data: deleted, message: 'Expense deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
