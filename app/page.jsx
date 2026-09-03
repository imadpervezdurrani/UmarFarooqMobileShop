'use client';

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/src/context/AppContext';
import { Navbar } from '@/src/components/layout/Navbar';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Toast } from '@/src/components/common/Toast';

import { Login } from '@/src/views/Login';
import { Dashboard } from '@/src/views/Dashboard';
import { Inventory } from '@/src/views/Inventory';
import { Sales } from '@/src/views/Sales';
import { Purchases } from '@/src/views/Purchases';
import { Invoices } from '@/src/views/Invoices';
import { Customers } from '@/src/views/Customers';
import { Suppliers } from '@/src/views/Suppliers';
import { Expenses } from '@/src/views/Expenses';
import { Reports } from '@/src/views/Reports';
import { Users } from '@/src/views/Users';

function MainLayout() {
  const { isAuthenticated, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f19',
        color: '#38bdf8',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Umar Farooq Mobile Zone
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading Shop Management System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <Login />
        <Toast />
      </>
    );
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && ['dashboard', 'reports', 'users', 'expenses'].includes(activeTab)) {
      setActiveTab('inventory');
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} setSelectedSale={setSelectedSale} />;
      case 'inventory':
        return <Inventory searchQuery={searchQuery} />;
      case 'sales':
        return <Sales searchQuery={searchQuery} setSelectedSale={setSelectedSale} setActiveTab={setActiveTab} />;
      case 'purchases':
        return <Purchases searchQuery={searchQuery} />;
      case 'invoices':
        return <Invoices searchQuery={searchQuery} selectedSale={selectedSale} setSelectedSale={setSelectedSale} />;
      case 'customers':
        return <Customers searchQuery={searchQuery} />;
      case 'suppliers':
        return <Suppliers searchQuery={searchQuery} />;
      case 'expenses':
        return <Expenses searchQuery={searchQuery} />;
      case 'reports':
        return <Reports searchQuery={searchQuery} />;
      case 'users':
        return <Users searchQuery={searchQuery} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} setSelectedSale={setSelectedSale} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-viewport">
        <Navbar searchQuery={searchQuery} onSearch={handleSearch} />
        <main className="content-body">{renderView()}</main>
      </div>
      <Toast />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
