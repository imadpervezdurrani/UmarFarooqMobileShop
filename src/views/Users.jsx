'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { ShieldCheck, UserCheck, ShieldAlert, CheckCircle2, XCircle, Lock } from 'lucide-react';

export const Users = () => {
  const { currentUser, switchRole, isAdmin } = useApp();

  const permissionsList = [
    { action: 'Create Sales POS & Invoices', admin: true, staff: true, note: 'Allowed for daily counter sales' },
    { action: 'Add / Edit Mobile Devices', admin: true, staff: true, note: 'Can enter new devices & specs' },
    { action: 'Delete Mobile Inventory', admin: true, staff: false, note: 'Restricted to prevent accidental data loss' },
    { action: 'View Wholesale Purchase Cost Prices', admin: true, staff: false, note: 'Kept confidential from sales staff' },
    { action: 'Process Item Return / Refund', admin: true, staff: false, note: 'Requires owner authorization' },
    { action: 'View Profit & Loss Reports', admin: true, staff: false, note: 'Financial statements owner-only' },
    { action: 'Log Store Expenses', admin: true, staff: true, note: 'Staff can log utility & daily expenses' },
    { action: 'Delete Expense Log Entries', admin: true, staff: false, note: 'Owner audit control' },
    { action: 'Database Reset & System Config', admin: true, staff: false, note: 'System administrator action' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Roles & Permission Control</h1>
          <p className="page-subtitle">Test and enforce role-based access controls for Store Admin vs Sales Staff</p>
        </div>
      </div>

      {/* Role Switcher Banner */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: `1px solid ${isAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: isAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Current User: {currentUser.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Role: <span style={{ color: isAdmin ? 'var(--accent-emerald)' : 'var(--accent-cyan)', fontWeight: 700 }}>{currentUser.role.toUpperCase()}</span> ({currentUser.title})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => switchRole('admin')}
            className={`btn ${isAdmin ? 'btn-emerald' : 'btn-secondary'}`}
          >
            <ShieldCheck size={16} />
            <span>Switch to Admin Mode</span>
          </button>
          <button
            onClick={() => switchRole('staff')}
            className={`btn ${!isAdmin ? 'btn-primary' : 'btn-secondary'}`}
          >
            <UserCheck size={16} />
            <span>Switch to Sales Staff Mode</span>
          </button>
        </div>
      </div>

      {/* Permission Comparison Matrix Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} color="var(--accent-cyan)" />
          <span>Role Permission Matrix</span>
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>System Action / Feature</th>
                <th style={{ textAlign: 'center' }}>Admin (Owner)</th>
                <th style={{ textAlign: 'center' }}>Sales Staff</th>
                <th>Security Rationale</th>
              </tr>
            </thead>
            <tbody>
              {permissionsList.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{p.action}</td>
                  <td style={{ textAlign: 'center' }}>
                    {p.admin ? (
                      <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Allowed
                      </span>
                    ) : (
                      <span style={{ color: '#fb7185', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <XCircle size={16} /> Denied
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {p.staff ? (
                      <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Allowed
                      </span>
                    ) : (
                      <span style={{ color: '#fb7185', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <XCircle size={16} /> Denied
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
