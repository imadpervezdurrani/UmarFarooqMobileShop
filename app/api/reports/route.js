import { NextResponse } from 'next/server';
import { store, connectDB } from '@/lib/db';

export async function GET() {
  await connectDB();
  const sales = store.sales || [];
  const expenses = store.expenses || [];
  const products = store.products || [];
  const customers = store.customers || [];
  const suppliers = store.suppliers || [];

  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);
  const totalReceived = sales.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Estimate total cost of items sold
  let totalCostOfGoodsSold = 0;
  sales.forEach((s) => {
    (s.items || []).forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const cost = Number(it.costPrice || prod?.costPrice || prod?.purchasePrice || 0);
      totalCostOfGoodsSold += cost * (Number(it.quantity) || 1);
    });
  });

  const grossProfit = totalRevenue - totalCostOfGoodsSold;
  const netProfit = grossProfit - totalExpenses;

  const totalInventoryValuation = products.reduce(
    (sum, p) => sum + (Number(p.costPrice || p.purchasePrice || 0) * Number(p.stock || 0)),
    0
  );

  const customerTotalDues = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);
  const supplierTotalPayable = suppliers.reduce((sum, s) => sum + (Number(s.balance) || 0), 0);

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      totalReceived,
      totalExpenses,
      totalCostOfGoodsSold,
      grossProfit,
      netProfit,
      totalInventoryValuation,
      customerTotalDues,
      supplierTotalPayable,
      salesCount: sales.length,
      productsCount: products.length,
      customersCount: customers.length,
      suppliersCount: suppliers.length,
    },
  });
}
