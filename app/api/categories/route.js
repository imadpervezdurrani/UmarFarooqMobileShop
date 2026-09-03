import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.categories || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body.id || `cat-${Date.now()}`;
    const newCat = { ...body, id };

    if (!store.categories) store.categories = [];
    store.categories.push(newCat);
    await saveDB();

    return NextResponse.json({ success: true, data: newCat, message: 'Category added' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
