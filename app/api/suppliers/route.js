import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.suppliers || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const id = body.id || `supp-${Date.now()}`;
    const newSupp = {
      ...body,
      id,
      balance: Number(body.balance) || 0,
      totalPurchases: Number(body.totalPurchases) || 0,
      ledger: body.ledger || [],
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (!store.suppliers) store.suppliers = [];
    store.suppliers.unshift(newSupp);
    saveDB();

    return NextResponse.json({ success: true, data: newSupp, message: 'Supplier created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, payoutAmount, billAmount, paidAmount, notes } = body;
    if (!id) return NextResponse.json({ success: false, message: 'Supplier ID required' }, { status: 400 });

    const supp = (store.suppliers || []).find((s) => s.id === id);
    if (!supp) return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });

    if (!supp.ledger) supp.ledger = [];

    // Supplier Payout
    if (payoutAmount !== undefined && payoutAmount > 0) {
      const amt = Number(payoutAmount);
      supp.balance = Math.max(0, (Number(supp.balance) || 0) - amt);
      supp.ledger.unshift({
        id: `supp-pay-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Supplier Payout (Debit)',
        description: notes || 'Cash Payout / Ledger Cleared',
        amount: 0,
        paid: amt,
        balance: supp.balance,
      });

      if (!store.payments) store.payments = [];
      store.payments.unshift({
        id: `pm-${Date.now()}`,
        type: 'SupplierPayout',
        entityId: supp.id,
        entityName: supp.name,
        amount: amt,
        notes: notes || 'Supplier Payout',
        date: new Date().toISOString().split('T')[0],
      });
    } else if (billAmount !== undefined && billAmount > 0) {
      // Manual Stock Bill
      const total = Number(billAmount);
      const paid = Number(paidAmount) || 0;
      const rem = Math.max(0, total - paid);
      supp.totalPurchases = (Number(supp.totalPurchases) || 0) + total;
      supp.balance = (Number(supp.balance) || 0) + rem;
      supp.ledger.unshift({
        id: `supp-bill-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Stock Bill Entry',
        description: notes || 'Direct Stock Purchase Bill',
        amount: total,
        paid: paid,
        balance: supp.balance,
      });
    } else {
      Object.assign(supp, body);
    }

    saveDB();
    return NextResponse.json({ success: true, data: supp, message: 'Supplier updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Supplier ID required' }, { status: 400 });

    const index = (store.suppliers || []).findIndex((s) => s.id === id);
    if (index === -1) return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });

    const deleted = store.suppliers.splice(index, 1)[0];
    saveDB();
    return NextResponse.json({ success: true, data: deleted, message: 'Supplier deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
