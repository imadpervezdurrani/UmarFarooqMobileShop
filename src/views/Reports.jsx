'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  FileText,
  Printer,
  Calendar,
  PieChart,
  ShoppingBag,
  Receipt,
  Users,
  Truck,
  Smartphone,
} from 'lucide-react';

export const Reports = () => {
  const {
    storeSettings,
    sales = [],
    purchases = [],
    expenses = [],
    products = [],
    customers = [],
    suppliers = [],
    isAdmin,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState('pnl');

  // Overall Computations with Defensive Fallbacks
  const safeSales = Array.isArray(sales) ? sales : [];
  const safePurchases = Array.isArray(purchases) ? purchases : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const totalRevenue = safeSales.reduce((sum, s) => sum + (parseFloat(s.grandTotal) || 0), 0);

  const totalCOGS = safeSales.reduce((sum, s) => {
    const items = Array.isArray(s.items) ? s.items : [];
    return (
      sum +
      items.reduce(
        (itemSum, item) =>
          itemSum + (parseFloat(item.purchaseCost) || 0) * (parseInt(item.quantity, 10) || 1),
        0
      )
    );
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const netProfit = grossProfit - totalExpenses;

  const totalStockValue = safeProducts.reduce(
    (sum, p) => sum + (parseInt(p.stock, 10) || 0) * (parseFloat(p.purchasePrice) || 0),
    0
  );
  const totalCustomerDues = safeCustomers.reduce(
    (sum, c) => sum + (parseFloat(c.remainingCredit || c.amountDue) || 0),
    0
  );
  const totalSupplierPayables = safeSuppliers.reduce(
    (sum, s) => sum + (parseFloat(s.amountPayable || s.closingPayable) || 0),
    0
  );

  // Category-wise Expense calculation
  const expenseCategories = ['Rent', 'Electricity', 'Salaries', 'Internet', 'Transport', 'Maintenance', 'Other'];
  const expenseBreakdown = expenseCategories.map((cat) => {
    const amount = safeExpenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    return { category: cat, amount };
  });

  // Payment Method Breakdown
  const cashSales = safeSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + (parseFloat(s.grandTotal) || 0), 0);
  const onlineSales = safeSales
    .filter((s) => s.paymentMethod === 'Online')
    .reduce((sum, s) => sum + (parseFloat(s.grandTotal) || 0), 0);

  // Brand-wise Sales breakdown
  const brandSalesMap = {};
  safeSales.forEach((s) => {
    const items = Array.isArray(s.items) ? s.items : [];
    items.forEach((it) => {
      const b = it.brand || 'Mobile Device';
      brandSalesMap[b] = (brandSalesMap[b] || 0) + (parseFloat(it.total) || parseFloat(it.price) || 0);
    });
  });

  return (
    <div>
      {/* Printable Store Header (Only visible on printout) */}
      <div
        className="print-only-statement-header"
        style={{
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #0f172a',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {storeSettings.storeName}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>{storeSettings.tagline}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>{storeSettings.address}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>Phone: {storeSettings.phone}</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7' }}>
            FINANCIAL REPORT STATEMENT
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
            Printed Date: {new Date().toISOString().split('T')[0]}
          </div>
        </div>
      </div>

      {/* Screen Header */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Reports & Financial Intelligence</h1>
          <p className="page-subtitle">Profit & Loss statements, inventory valuation, dues analysis, and sales breakdowns</p>
        </div>
        <button onClick={() => window.print()} className="btn btn-secondary">
          <Printer size={16} />
          <span>Print Report Statement</span>
        </button>
      </div>

      {/* Report Tabs Selector */}
      <div
        className="glass-card no-print"
        style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'pnl', label: 'Profit & Loss Statement', icon: TrendingUp },
          { id: 'sales', label: 'Sales & Brands Report', icon: BarChart3 },
          { id: 'expenses', label: 'Expense Breakdown', icon: Receipt },
          { id: 'stock', label: 'Stock Valuation', icon: Smartphone },
          { id: 'dues', label: 'Customer & Supplier Dues', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`btn btn-sm ${activeReportTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.55rem 1rem' }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profit & Loss Statement */}
      {(activeReportTab === 'pnl' || typeof window !== 'undefined') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Financial Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                {storeSettings.currency} {totalRevenue.toLocaleString()}
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cost of Goods (COGS)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                - {storeSettings.currency} {totalCOGS.toLocaleString()}
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Gross Margin</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                {storeSettings.currency} {grossProfit.toLocaleString()}
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Expenses</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
                - {storeSettings.currency} {totalExpenses.toLocaleString()}
              </div>
            </div>

            <div className="glass-card" style={{ borderLeft: `4px solid ${netProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185'}`, background: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>NET STORE PROFIT</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: netProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185', marginTop: '0.25rem' }}>
                {storeSettings.currency} {netProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Detailed Income Statement Breakdown */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Income Statement Financial Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>Gross Revenue from Mobile Sales</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{storeSettings.currency} {totalRevenue.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>Less Cost of Goods Sold (Wholesale Purchase Cost)</span>
                <strong style={{ color: 'var(--text-muted)' }}>- {storeSettings.currency} {totalCOGS.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>
                <span>GROSS PROFIT MARGIN</span>
                <strong style={{ color: 'var(--accent-emerald)' }}>{storeSettings.currency} {grossProfit.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>Less Operational Expenses (Rent, Bills, Salaries, Maintenance)</span>
                <strong style={{ color: '#fbbf24' }}>- {storeSettings.currency} {totalExpenses.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>
                <span>NET PROFIT / LOSS</span>
                <span style={{ color: netProfit >= 0 ? 'var(--accent-emerald)' : '#fb7185' }}>
                  {storeSettings.currency} {netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sales & Brand Analysis */}
      {activeReportTab === 'sales' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* Brand Sales Distribution */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Sales Revenue by Brand</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(brandSalesMap).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No sales data recorded yet.</div>
              ) : (
                Object.entries(brandSalesMap).map(([brand, val], idx) => {
                  const percent = Math.round((val / (totalRevenue || 1)) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{brand}</span>
                        <span>
                          {storeSettings.currency} {val.toLocaleString()} ({percent}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Payment Method Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cash Sales Collected</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                  {storeSettings.currency} {cashSales.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Online / Card Transfers</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-violet)', marginTop: '0.2rem' }}>
                  {storeSettings.currency} {onlineSales.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Expense Breakdown */}
      {activeReportTab === 'expenses' && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Expense Category Distribution</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Logged Entries Count</th>
                  <th>Total Spent</th>
                  <th>Share of Expenses</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((eb, idx) => {
                  const percent = Math.round((eb.amount / (totalExpenses || 1)) * 100);
                  const count = safeExpenses.filter((e) => e.category === eb.category).length;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{eb.category}</td>
                      <td>{count} entry(ies)</td>
                      <td style={{ fontWeight: 700, color: '#fbbf24' }}>
                        {storeSettings.currency} {eb.amount.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-amber)', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', width: '40px' }}>{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Stock Valuation */}
      {activeReportTab === 'stock' && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inventory Valuation Report</h3>
            <Badge variant="cyan">Total Stock Value: {storeSettings.currency} {totalStockValue.toLocaleString()}</Badge>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Model</th>
                  <th>PTA Status</th>
                  <th>In Stock Qty</th>
                  <th>Unit Cost</th>
                  <th>Total Inventory Asset Value</th>
                </tr>
              </thead>
              <tbody>
                {safeProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No inventory items recorded yet.
                    </td>
                  </tr>
                ) : (
                  safeProducts.map((p) => {
                    const assetValue = (parseInt(p.stock, 10) || 0) * (parseFloat(p.purchasePrice) || 0);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.brand} {p.model}</td>
                        <td><Badge variant={p.ptaStatus}>{p.ptaStatus}</Badge></td>
                        <td style={{ fontWeight: 700 }}>{p.stock}</td>
                        <td>{storeSettings.currency} {(p.purchasePrice || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {storeSettings.currency} {assetValue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Dues & Payables */}
      {activeReportTab === 'dues' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* Customer Dues */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fb7185', marginBottom: '1.25rem' }}>
              Customer Outstanding Receivables ({storeSettings.currency} {totalCustomerDues.toLocaleString()})
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone</th>
                    <th>Remaining Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {safeCustomers.filter((c) => (c.remainingCredit || c.amountDue || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No customer dues.
                      </td>
                    </tr>
                  ) : (
                    safeCustomers
                      .filter((c) => (c.remainingCredit || c.amountDue || 0) > 0)
                      .map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{c.phone}</td>
                          <td style={{ fontWeight: 700, color: '#fb7185' }}>
                            {storeSettings.currency} {(c.remainingCredit || c.amountDue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Payables */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '1.25rem' }}>
              Supplier Account Payables ({storeSettings.currency} {totalSupplierPayables.toLocaleString()})
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Supplier Name</th>
                    <th>Phone</th>
                    <th>Amount Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {safeSuppliers.filter((s) => (s.amountPayable || s.closingPayable || 0) > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No supplier payables.
                      </td>
                    </tr>
                  ) : (
                    safeSuppliers
                      .filter((s) => (s.amountPayable || s.closingPayable || 0) > 0)
                      .map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.phone}</td>
                          <td style={{ fontWeight: 700, color: '#fbbf24' }}>
                            {storeSettings.currency} {(s.amountPayable || s.closingPayable || 0).toLocaleString()} Cr
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
