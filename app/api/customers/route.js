import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.customers || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body.id || `cust-${Date.now()}`;
    const newCust = {
      ...body,
      id,
      balance: Number(body.balance) || 0,
      totalPurchases: Number(body.totalPurchases) || 0,
      ledger: body.ledger || [],
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (!store.customers) store.customers = [];
    store.customers.unshift(newCust);
    await saveDB();

    return NextResponse.json({ success: true, data: newCust, message: 'Customer created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, paymentAmount, notes } = body;
    if (!id) return NextResponse.json({ success: false, message: 'Customer ID required' }, { status: 400 });

    const cust = (store.customers || []).find((c) => c.id === id);
    if (!cust) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    // Handle Ledger Payment
    if (paymentAmount !== undefined && paymentAmount > 0) {
      const amt = Number(paymentAmount);
      cust.balance = Math.max(0, (Number(cust.balance) || 0) - amt);
      if (!cust.ledger) cust.ledger = [];
      cust.ledger.unshift({
        id: `pay-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Cash Received (Credit Payment)',
        description: notes || 'Customer Balance Cleared / Payment',
        amount: 0,
        paid: amt,
        balance: cust.balance,
      });

      if (!store.payments) store.payments = [];
      store.payments.unshift({
        id: `pm-${Date.now()}`,
        type: 'CustomerReceived',
        entityId: cust.id,
        entityName: cust.name,
        amount: amt,
        notes: notes || 'Ledger Payment',
        date: new Date().toISOString().split('T')[0],
      });
    } else {
      Object.assign(cust, body);
    }

    await saveDB();
    return NextResponse.json({ success: true, data: cust, message: 'Customer updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Customer ID required' }, { status: 400 });

    const index = (store.customers || []).findIndex((c) => c.id === id);
    if (index === -1) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    const deleted = store.customers.splice(index, 1)[0];
    await saveDB();
    return NextResponse.json({ success: true, data: deleted, message: 'Customer deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
