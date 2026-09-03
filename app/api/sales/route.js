import { NextResponse } from 'next/server';
import { store, saveDB, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  return NextResponse.json({ success: true, data: store.sales || [] });
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const items = body.items || [];
    const customerId = body.customerId;
    const grandTotal = Number(body.grandTotal) || 0;
    const paidAmount = Number(body.paidAmount) || 0;
    const remainingBalance = Math.max(0, grandTotal - paidAmount);

    // 1. Verify and deduct stock
    for (const item of items) {
      const prod = (store.products || []).find((p) => p.id === item.productId);
      if (prod && Number(prod.stock) < Number(item.quantity)) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${item.brand || ''} ${item.model || item.name || 'product'}` },
          { status: 400 }
        );
      }
    }

    // Deduct stock & log transaction
    items.forEach((item) => {
      const prod = (store.products || []).find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, Number(prod.stock) - Number(item.quantity));
        if (!store.stock_transactions) store.stock_transactions = [];
        store.stock_transactions.unshift({
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          productName: `${prod.brand || ''} ${prod.model || ''}`.trim() || prod.name,
          imei: item.imei || prod.imei1 || 'N/A',
          changeType: 'Deduction (Sale)',
          quantity: -Number(item.quantity),
          stockAfter: prod.stock,
          reference: `POS Sale #${body.invoiceNo || ''}`,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        });
      }
    });

    // 2. Create Sale Record
    const id = body.id || `sale-${Date.now()}`;
    const invoiceNo = body.invoiceNo || `INV-${String(Date.now()).slice(-6)}`;
    const newSale = {
      ...body,
      id,
      invoiceNo,
      remainingBalance,
      createdAt: body.createdAt || new Date().toISOString(),
      date: body.date || new Date().toISOString().split('T')[0],
    };

    if (!store.sales) store.sales = [];
    store.sales.unshift(newSale);

    // 3. Create Invoice Record
    if (!store.invoices) store.invoices = [];
    store.invoices.unshift({
      id: `inv-${Date.now()}`,
      invoiceNo: newSale.invoiceNo,
      saleId: newSale.id,
      customerName: newSale.customerName,
      customerPhone: newSale.customerPhone,
      items: newSale.items,
      grandTotal: newSale.grandTotal,
      paidAmount: newSale.paidAmount,
      balance: newSale.remainingBalance,
      paymentMethod: newSale.paymentMethod,
      date: newSale.date,
      status: newSale.remainingBalance > 0 ? (newSale.paidAmount > 0 ? 'partial' : 'unpaid') : 'paid',
      createdAt: newSale.createdAt,
    });

    // 4. Update Customer Ledger if registered
    if (customerId) {
      const cust = (store.customers || []).find((c) => c.id === customerId);
      if (cust) {
        cust.totalPurchases = (Number(cust.totalPurchases) || 0) + grandTotal;
        cust.balance = (Number(cust.balance) || 0) + remainingBalance;
        if (!cust.ledger) cust.ledger = [];
        cust.ledger.unshift({
          id: `led-${Date.now()}`,
          date: newSale.date,
          type: 'Invoice Debit',
          description: `Sale Invoice #${newSale.invoiceNo}`,
          amount: grandTotal,
          paid: paidAmount,
          balance: cust.balance,
        });
      }
    }

    await saveDB();
    return NextResponse.json({ success: true, data: newSale, message: `Invoice ${newSale.invoiceNo} created successfully` }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
