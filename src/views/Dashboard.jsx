'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Smartphone,
  AlertTriangle,
  Plus,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';

export const Dashboard = ({ setActiveTab, setSelectedSale }) => {
  const { storeSettings, products, sales, purchases, expenses, isAdmin } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper safe number getters
  const getSaleTotal = (s) => (s?.grandTotal ?? s?.netTotal ?? s?.totalAmount ?? 0);
  const getSalePaid = (s) => (s?.paidAmount ?? 0);
  const getSaleDue = (s) => (s?.remainingBalance ?? s?.dueAmount ?? 0);

  // 1. Today's Sales
  const todaySalesList = sales.filter((s) => s.date === todayStr);
  const todaySalesTotal = todaySalesList.reduce((sum, s) => sum + getSaleTotal(s), 0);

  // 2. Today's Purchases
  const todayPurchasesList = purchases.filter((p) => p.date === todayStr);
  const todayPurchasesTotal = todayPurchasesList.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  // 3. Expenses
  const todayExpensesTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // 4. Gross Profit Today (Revenue - Cost of Goods Sold)
  const todayCOGS = todaySalesList.reduce((sum, s) => {
    return (
      sum +
      (s.items || []).reduce((itemSum, item) => itemSum + (item.purchaseCost || 0) * (item.quantity || 1), 0)
    );
  }, 0);
  const todayNetProfit = todaySalesTotal - todayCOGS - todayExpensesTotal;

  // 5. Total Stock Value (Sum of Stock * Purchase Price)
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock || 0) * (p.purchasePrice || 0), 0);

  // 6. Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockLimit);

  // Chart Data Preparation (Last 7 Days Sales Trend)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map((dateStr) => {
    const daySales = sales.filter((s) => s.date === dateStr).reduce((sum, s) => sum + getSaleTotal(s), 0);
    const dayExp = expenses.filter((e) => e.date === dateStr).reduce((sum, e) => sum + (e.amount || 0), 0);
    const label = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    return { date: dateStr, label, sales: daySales, expenses: dayExp };
  });

  const maxChartVal = Math.max(...chartData.map((d) => d.sales), 100000);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time shop statistics, inventory alerts, and financial summary</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab && setActiveTab('sales')} className="btn btn-primary">
            <ShoppingCart size={16} />
            <span>New Sale POS</span>
          </button>
          <button onClick={() => setActiveTab && setActiveTab('purchases')} className="btn btn-emerald">
            <Plus size={16} />
            <span>New Purchase</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <StatCard
          title="Today's Sales"
          value={`${storeSettings.currency} ${todaySalesTotal.toLocaleString()}`}
          subtext={`${todaySalesList.length} transaction(s) today`}
          icon={DollarSign}
          accentColor="var(--accent-cyan)"
        />

        <StatCard
          title="Today's Purchases"
          value={`${storeSettings.currency} ${todayPurchasesTotal.toLocaleString()}`}
          subtext={`${todayPurchasesList.length} purchase order(s)`}
          icon={ShoppingBag}
          accentColor="var(--accent-emerald)"
        />

        <StatCard
          title="Today's Net Profit"
          value={`${storeSettings.currency} ${todayNetProfit.toLocaleString()}`}
          subtext={isAdmin ? 'Revenue - COGS - Expenses' : 'Restricted (Admin Only)'}
          icon={TrendingUp}
          accentColor={todayNetProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}
        />

        <StatCard
          title="Today's Expenses"
          value={`${storeSettings.currency} ${todayExpensesTotal.toLocaleString()}`}
          subtext="Operational expenses"
          icon={Receipt}
          accentColor="var(--accent-amber)"
        />

        <StatCard
          title="Total Stock Value"
          value={`${storeSettings.currency} ${totalStockValue.toLocaleString()}`}
          subtext={`${products.reduce((acc, p) => acc + (p.stock || 0), 0)} items in stock`}
          icon={Smartphone}
          accentColor="var(--accent-violet)"
        />

        <StatCard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          subtext="Requires reordering"
          icon={AlertTriangle}
          accentColor="var(--accent-rose)"
        />
      </div>

      {/* Main Charts & Visual Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Sales Trend Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Sales & Expense Trend</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily revenue comparison</p>
            </div>
            <div className="badge badge-cyan">
              <Calendar size={12} />
              <span>Last 7 Days</span>
            </div>
          </div>

          {/* Custom SVG Bar/Area Chart */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', padding: '1rem 0' }}>
            {chartData.map((d, i) => {
              const salesHeightPercent = Math.max(10, Math.min(100, (d.sales / maxChartVal) * 100));
              const expHeightPercent = Math.max(5, Math.min(100, (d.expenses / maxChartVal) * 100));

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', height: '80%', justifyContent: 'center' }}>
                    {/* Sales Bar */}
                    <div
                      title={`Sales: ${storeSettings.currency} ${d.sales.toLocaleString()}`}
                      style={{
                        width: '45%',
                        height: `${salesHeightPercent}%`,
                        background: 'linear-gradient(180deg, var(--accent-cyan) 0%, rgba(56, 189, 248, 0.2) 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.5s ease',
                      }}
                    />
                    {/* Expense Bar */}
                    <div
                      title={`Expense: ${storeSettings.currency} ${d.expenses.toLocaleString()}`}
                      style={{
                        width: '45%',
                        height: `${expHeightPercent}%`,
                        background: 'linear-gradient(180deg, var(--accent-amber) 0%, rgba(245, 158, 11, 0.2) 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.5s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-cyan)' }} />
              <span>Sales Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-amber)' }} />
              <span>Expenses</span>
            </div>
          </div>
        </div>

        {/* Low Stock Items Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} />
              <span>Low-Stock Products</span>
            </h3>
            <button onClick={() => setActiveTab && setActiveTab('inventory')} className="btn btn-secondary btn-sm">
              View All
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All products are sufficiently stocked!
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {p.brand} {p.model}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.ram} / {p.storage} • <span style={{ color: 'var(--accent-cyan)' }}>{p.ptaStatus}</span>
                    </div>
                  </div>
                  <Badge variant="rose">{p.stock} left</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Activity Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Store Sales</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest customer invoices generated</p>
          </div>
          <button onClick={() => setActiveTab && setActiveTab('invoices')} className="btn btn-secondary btn-sm">
            View All Invoices
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Product & IMEI</th>
                <th>Total</th>
                <th>Paid / Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {s.invoiceNo}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.customerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.date || 'N/A'} {s.time ? `(${s.time})` : ''}</div>
                  </td>
                  <td>
                    {(s.items || []).map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem' }}>
                        {it.brand || it.productName || 'Item'} {it.model || ''}{' '}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          [{it.imei || 'N/A'}]
                        </span>
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {storeSettings.currency} {getSaleTotal(s).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                      Paid: {storeSettings.currency} {getSalePaid(s).toLocaleString()}
                    </div>
                    {getSaleDue(s) > 0 && (
                      <div style={{ color: 'var(--accent-rose)', fontSize: '0.75rem' }}>
                        Due: {storeSettings.currency} {getSaleDue(s).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge variant={s.status || 'Paid'}>{s.status || 'Paid'}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        if (setSelectedSale) setSelectedSale(s);
                        if (setActiveTab) setActiveTab('invoices');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Invoice View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
