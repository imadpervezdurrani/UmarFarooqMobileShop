import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.products || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body.id || `prod-${Date.now()}`;
    const newProduct = { ...body, id, createdAt: body.createdAt || new Date().toISOString() };
    
    if (!store.products) store.products = [];
    store.products.unshift(newProduct);

    if (!store.stock_transactions) store.stock_transactions = [];
    store.stock_transactions.unshift({
      id: `st-${Date.now()}`,
      productId: newProduct.id,
      productName: `${newProduct.brand || ''} ${newProduct.model || ''}`.trim() || newProduct.name,
      imei: newProduct.imei1 || newProduct.imei || 'N/A',
      changeType: 'Initial Stock Add',
      quantity: Number(newProduct.stock) || 0,
      stockAfter: Number(newProduct.stock) || 0,
      reference: 'Product Creation',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });

    saveDB();
    return NextResponse.json({ success: true, data: newProduct, message: 'Product created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    store.products[index] = { ...store.products[index], ...body, updatedAt: new Date().toISOString() };
    saveDB();
    return NextResponse.json({ success: true, data: store.products[index], message: 'Product updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    const deleted = store.products.splice(index, 1)[0];
    saveDB();
    return NextResponse.json({ success: true, data: deleted, message: 'Product deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
