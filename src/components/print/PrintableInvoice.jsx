'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Smartphone, ShieldCheck, Send, FileDown } from 'lucide-react';

export const PrintableInvoice = ({ sale, onClose }) => {
  const { storeSettings, sendInvoiceWhatsApp, showToast } = useApp();

  if (!sale) return null;

  const items = sale.items || [];
  const subtotal = sale.subtotal || 0;
  const grandTotal = sale.grandTotal || 0;
  const paidAmount = sale.paidAmount || 0;
  const remainingBalance = sale.remainingBalance || 0;
  const discount = sale.discount || 0;
  const tax = sale.tax || 0;

  const handleSendWhatsAppPDF = async () => {
    if (!sale.customerPhone) {
      showToast('Customer phone number is missing on this invoice!', 'error');
      return;
    }

    // Call WhatsApp invoice dispatch
    await sendInvoiceWhatsApp(sale.invoiceNo, sale.customerPhone);

    // Format WhatsApp direct Web link
    let cleanPhone = sale.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('92')) cleanPhone = '92' + cleanPhone;

    const waText = encodeURIComponent(
      `🧾 *INVOICE: ${sale.invoiceNo}*\n🏢 *${storeSettings.storeName}*\n\nDear *${sale.customerName || 'Customer'}*,\nThank you for choosing Umar Farooq Mobile Zone!\n💰 *Total Amount:* Rs. ${grandTotal.toLocaleString()}\n💰 *Amount Paid:* Rs. ${paidAmount.toLocaleString()}\n💳 *Remaining Balance:* Rs. ${remainingBalance.toLocaleString()}\n\nContact: ${storeSettings.phone}`
    );

    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}`, '_blank');
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handlePrint = async () => {
    if (sale.customerPhone) {
      sendInvoiceWhatsApp(sale.invoiceNo, sale.customerPhone);
    }
    window.print();
  };

  return (
    <div className="printable-area-wrapper">
      {/* Action Buttons Top Bar (Hidden when printed) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--accent-emerald)" />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>
            Invoice #{sale.invoiceNo || 'INV-0000'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleDownloadPDF} className="btn btn-secondary">
            <FileDown size={16} />
            <span>Download PDF</span>
          </button>
          <button onClick={handleSendWhatsAppPDF} className="btn btn-emerald">
            <Send size={16} />
            <span>Send PDF on WhatsApp</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            <span>Print & Dispatch PDF</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Actual Printable Invoice Container */}
      <div
        className="invoice-receipt"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '2.5rem',
          borderRadius: '16px',
          fontFamily: 'Inter, system-ui, sans-serif',
          maxWidth: '750px',
          margin: '0 auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Smartphone size={26} color="#0284c7" />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                {storeSettings.storeName}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{storeSettings.tagline}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              {storeSettings.address}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Phone: {storeSettings.phone} • Email: {storeSettings.email}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0284c7',
                letterSpacing: '-0.02em',
              }}
            >
              INVOICE
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
              {sale.invoiceNo || 'INV-0000'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Date: {sale.date || 'N/A'} ({sale.time || ''})
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Payment Method: <strong>{sale.paymentMethod || 'Cash'}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Salesperson Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            background: '#f8fafc',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              Billed To (Customer)
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginTop: '0.2rem' }}>
              {sale.customerName || 'Walk-in Customer'}
            </div>
            <div style={{ color: '#475569' }}>Phone: {sale.customerPhone || 'N/A'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              Sales Executive
            </div>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
              {sale.salesPerson || 'Staff'}
            </div>
            <div style={{ color: '#475569' }}>
              Status: <span style={{ fontWeight: 700, color: sale.status === 'Paid' ? '#16a34a' : '#d97706' }}>{sale.status || 'Paid'}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr style={{ background: '#0f172a', color: '#ffffff' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>#</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Product / Specification</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>IMEI Number</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Unit Price</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
                  No item details recorded on this invoice.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#64748b' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.brand || ''} {item.model || item.productName || 'Mobile Product'}
                    </div>
                    {item.color && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Color: {item.color}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#0284c7',
                      fontSize: '0.85rem',
                    }}
                  >
                    {item.imei || 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {storeSettings.currency} {(item.price || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                    {item.quantity || 1}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                    {storeSettings.currency} {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals & Financial Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Warranty & Return Policy:
            </div>
            <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.5' }}>
              <li>Official PTA approved warranty claims require original invoice.</li>
              <li>Software warranty 1 Year; Hardware warranty per brand guidelines.</li>
              <li>No refund or replacement without box, seal, and IMEI match.</li>
            </ul>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#475569' }}>
              <span>Subtotal:</span>
              <span>{storeSettings.currency} {(subtotal || 0).toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#dc2626' }}>
                <span>Discount:</span>
                <span>- {storeSettings.currency} {(discount || 0).toLocaleString()}</span>
              </div>
            )}

            {tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#475569' }}>
                <span>Tax:</span>
                <span>+ {storeSettings.currency} {(tax || 0).toLocaleString()}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderTop: '2px dashed #cbd5e1',
                borderBottom: '2px dashed #cbd5e1',
                margin: '0.5rem 0',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#0f172a',
              }}
            >
              <span>Grand Total:</span>
              <span style={{ color: '#0284c7' }}>
                {storeSettings.currency} {(grandTotal || 0).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#16a34a', fontWeight: 600 }}>
              <span>Paid Amount:</span>
              <span>{storeSettings.currency} {(paidAmount || 0).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: remainingBalance > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
              <span>Balance Dues:</span>
              <span>{storeSettings.currency} {(remainingBalance || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.5rem',
            fontSize: '0.8rem',
            color: '#94a3b8',
          }}
        >
          <div>Thank you for shopping at {storeSettings.storeName}!</div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #cbd5e1', width: '180px', paddingTop: '0.25rem', color: '#475569' }}>
            Authorized Signature
          </div>
        </div>
      </div>
    </div>
  );
};
