import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.purchases || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const items = body.items || [];
    const supplierId = body.supplierId;
    const totalAmount = Number(body.totalAmount) || 0;
    const paidAmount = Number(body.paidAmount) || 0;
    const remainingBalance = Math.max(0, totalAmount - paidAmount);

    // 1. Stock Influx & Cost update
    items.forEach((it) => {
      const prod = (store.products || []).find((p) => p.id === it.productId);
      if (prod) {
        prod.stock = (Number(prod.stock) || 0) + (Number(it.quantity) || 1);
        if (it.purchasePrice) prod.purchasePrice = Number(it.purchasePrice);
        if (it.costPrice) prod.costPrice = Number(it.costPrice);

        if (!store.stock_transactions) store.stock_transactions = [];
        store.stock_transactions.unshift({
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          productName: it.productName || `${prod.brand || ''} ${prod.model || ''}`.trim() || prod.name,
          imei: it.imei || prod.imei1 || 'N/A',
          changeType: 'Stock Influx (Purchase)',
          quantity: Number(it.quantity) || 1,
          stockAfter: prod.stock,
          reference: `PO Influx #${body.purchaseNo || ''}`,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 2. Create Purchase Order
    const id = body.id || `po-${Date.now()}`;
    const purchaseNo = body.purchaseNo || `PO-${String(Date.now()).slice(-6)}`;
    const newPo = {
      ...body,
      id,
      purchaseNo,
      remainingBalance,
      createdAt: body.createdAt || new Date().toISOString(),
      date: body.date || new Date().toISOString().split('T')[0],
    };

    if (!store.purchases) store.purchases = [];
    store.purchases.unshift(newPo);

    // 3. Supplier Ledger
    if (supplierId) {
      const supp = (store.suppliers || []).find((s) => s.id === supplierId);
      if (supp) {
        supp.totalPurchases = (Number(supp.totalPurchases) || 0) + totalAmount;
        supp.balance = (Number(supp.balance) || 0) + remainingBalance;
        if (!supp.ledger) supp.ledger = [];
        supp.ledger.unshift({
          id: `supp-led-${Date.now()}`,
          date: newPo.date,
          type: 'Purchase Invoice Credit',
          reference: newPo.purchaseNo,
          amount: totalAmount,
          paid: paidAmount,
          balance: supp.balance,
        });
      }
    }

    saveDB();
    return NextResponse.json({ success: true, data: newPo, message: 'Purchase order recorded & stock increased' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
