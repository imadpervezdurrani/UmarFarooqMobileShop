'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Users, Plus, DollarSign, BookOpen, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export const Customers = ({ searchQuery }) => {
  const { storeSettings, customers, addCustomer, recordCustomerPayment, sales } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    remainingCredit: 0,
  });

  // Ledger & Payment Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addCustomer(formData);
    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', address: '', remainingCredit: 0 });
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount) return;
    recordCustomerPayment(selectedCustomer.id, paymentAmount);
    setIsPaymentOpen(false);
    setPaymentAmount('');
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      !searchQuery ||
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && String(c.phone).includes(searchQuery)) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalOutstandingDues = customers.reduce((sum, c) => sum + (c.remainingCredit || c.dues || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Ledger & Credit Dues</h1>
          <p className="page-subtitle">Manage customer directory, track credit dues, and collect partial payments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div
            className="glass-card"
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Outstanding Dues:</div>
            <div style={{ fontWeight: 800, color: '#fb7185', fontSize: '1.1rem' }}>
              {storeSettings.currency} {(totalOutstandingDues || 0).toLocaleString()}
            </div>
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th>Total Purchases</th>
                <th>Total Paid</th>
                <th>Remaining Credit Dues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{c.phone || 'N/A'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.address || 'N/A'}</td>
                    <td>{storeSettings.currency} {(c.totalPurchases || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {storeSettings.currency} {(c.totalPaid || 0).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: (c.remainingCredit || c.dues || 0) > 0 ? '#fb7185' : 'var(--accent-emerald)' }}>
                      {storeSettings.currency} {(c.remainingCredit || c.dues || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsLedgerOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <BookOpen size={14} />
                          <span>Ledger</span>
                        </button>
                        {(c.remainingCredit || c.dues || 0) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsPaymentOpen(true);
                            }}
                            className="btn btn-emerald btn-sm"
                          >
                            <DollarSign size={14} />
                            <span>Collect Dues</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer Profile"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Muhammad Usman"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="03xx-xxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="City / Sector"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Credit Dues ({storeSettings.currency})</label>
            <input
              type="number"
              className="form-input"
              placeholder="0"
              value={formData.remainingCredit}
              onChange={(e) => setFormData({ ...formData, remainingCredit: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Ledger Modal */}
      <Modal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        title={selectedCustomer ? `Customer Account Ledger: ${selectedCustomer.name}` : 'Customer Ledger'}
      >
        {selectedCustomer && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div>Phone: <strong>{selectedCustomer.phone || 'N/A'}</strong></div>
              <div>Remaining Dues: <strong style={{ color: '#fb7185' }}>{storeSettings.currency} {(selectedCustomer.remainingCredit || selectedCustomer.dues || 0).toLocaleString()}</strong></div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice No</th>
                    <th>Grand Total</th>
                    <th>Paid</th>
                    <th>Remaining Dues</th>
                  </tr>
                </thead>
                <tbody>
                  {sales
                    .filter((s) => s.customerId === selectedCustomer.id)
                    .map((s) => (
                      <tr key={s.id}>
                        <td>{s.date || 'N/A'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{s.invoiceNo}</td>
                        <td>{storeSettings.currency} {(s.grandTotal || s.netTotal || s.totalAmount || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--accent-emerald)' }}>{storeSettings.currency} {(s.paidAmount || 0).toLocaleString()}</td>
                        <td style={{ color: '#fb7185', fontWeight: 600 }}>{storeSettings.currency} {(s.remainingBalance ?? s.dueAmount ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={selectedCustomer ? `Collect Dues Payment: ${selectedCustomer.name}` : 'Collect Payment'}
      >
        {selectedCustomer && (
          <form onSubmit={handleRecordPaymentSubmit}>
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Current Outstanding Balance: <strong style={{ color: '#fb7185' }}>{storeSettings.currency} {(selectedCustomer.remainingCredit || selectedCustomer.dues || 0).toLocaleString()}</strong>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Amount Received ({storeSettings.currency}) *</label>
              <input
                type="number"
                step="any"
                required
                max={selectedCustomer.remainingCredit || selectedCustomer.dues || 0}
                className="form-input"
                placeholder={`Max: ${selectedCustomer.remainingCredit || selectedCustomer.dues || 0}`}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setIsPaymentOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald">
                Confirm Payment Receipt
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
