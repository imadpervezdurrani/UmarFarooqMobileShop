'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PrintableInvoice } from '../components/print/PrintableInvoice';
import { FileText, Search, Printer, Eye, Calendar, DollarSign } from 'lucide-react';

export const Invoices = ({ searchQuery, selectedSale, setSelectedSale }) => {
  const { storeSettings, sales } = useApp();

  const [statusFilter, setStatusFilter] = useState('All');
  const [activeInvoiceModal, setActiveInvoiceModal] = useState(null);

  useEffect(() => {
    if (selectedSale) {
      setActiveInvoiceModal(selectedSale);
    }
  }, [selectedSale]);

  const filteredSales = (sales || []).filter((s) => {
    const items = s.items || [];
    const matchesSearch =
      !searchQuery ||
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.customerPhone && s.customerPhone.includes(searchQuery)) ||
      items.some((it) => (it.imei && it.imei.includes(searchQuery)) || (it.model && it.model.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice Records & History</h1>
          <p className="page-subtitle">View, search, and re-print all generated customer sales invoices</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Filter:</div>
        {['All', 'Paid', 'Partial', 'Unpaid', 'Refunded'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
          >
            {st}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Total Invoices: <strong>{filteredSales.length}</strong>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date & Time</th>
                <th>Customer Details</th>
                <th>Purchased Items & IMEIs</th>
                <th>Grand Total</th>
                <th>Paid Amount</th>
                <th>Balance Dues</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No invoices match your search query.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {s.invoiceNo}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div>{s.date}</div>
                      <div style={{ fontSize: '0.75rem' }}>{s.time}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.customerPhone}</div>
                    </td>
                    <td>
                      {(s.items || []).map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          {it.brand} {it.model}{' '}
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                            [{it.imei || 'N/A'}]
                          </span>
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {storeSettings.currency} {(s.grandTotal || s.netTotal || s.totalAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {storeSettings.currency} {(s.paidAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ color: ((s.remainingBalance ?? s.dueAmount ?? 0) > 0) ? '#fb7185' : 'var(--text-muted)', fontWeight: 600 }}>
                      {storeSettings.currency} {(s.remainingBalance ?? s.dueAmount ?? 0).toLocaleString()}
                    </td>
                    <td>
                      <Badge variant={s.status || 'Paid'}>{s.status || 'Paid'}</Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setActiveInvoiceModal(s);
                          if (setSelectedSale) setSelectedSale(s);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Printer size={14} />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice View Modal */}
      <Modal
        isOpen={Boolean(activeInvoiceModal)}
        onClose={() => {
          setActiveInvoiceModal(null);
          if (setSelectedSale) setSelectedSale(null);
        }}
        title={`Invoice View: ${activeInvoiceModal?.invoiceNo}`}
      >
        <PrintableInvoice
          sale={activeInvoiceModal}
          onClose={() => {
            setActiveInvoiceModal(null);
            if (setSelectedSale) setSelectedSale(null);
          }}
        />
      </Modal>
    </div>
  );
};
