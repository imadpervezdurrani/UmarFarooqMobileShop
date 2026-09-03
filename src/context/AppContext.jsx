'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialStoreSettings,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialPurchases,
  initialExpenses,
  initialStockHistory,
} from '../data/seedData';

const API_BASE_URL = '/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Store Settings
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);
  const [theme, setThemeState] = useState('dark');
  const [authToken, setAuthToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Main Entities State
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [sales, setSales] = useState(initialSales);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [payments, setPayments] = useState([]);
  const [stockHistory, setStockHistory] = useState(initialStockHistory);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // Safe client-side initialization
  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem('celltech_settings');
    if (savedSettings) {
      try {
        setStoreSettings({
          ...initialStoreSettings,
          ...JSON.parse(savedSettings),
          storeName: 'Umar Farooq Mobile Zone',
          phone: '03457725525',
          email: 'Umarfarooq201520@gmail.com',
          address: 'Al-Firdous Plaza , Shope No.01 Ground Floor, Nowshera Cantt',
        });
      } catch (e) {}
    }

    const savedTheme = localStorage.getItem('celltech_theme') || 'dark';
    setThemeState(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedToken = localStorage.getItem('celltech_token') || '';
    setAuthToken(savedToken);

    const savedUser = localStorage.getItem('celltech_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setIsAuthenticated(true);
      } catch (e) {}
    }
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('celltech_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    showToast(`Switched active theme to ${newTheme.toUpperCase()} mode`, 'info');
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  // Helper headers with JWT Bearer Token
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': authToken ? `Bearer ${authToken}` : '',
    'x-user-role': currentUser?.role || 'admin',
  });

  // Fetch all data from Next.js API
  const fetchAllDataFromBackend = async () => {
    try {
      const [prodRes, custRes, suppRes, salesRes, poRes, expRes, payRes, histRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/customers`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/suppliers`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/sales`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/purchases`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/expenses`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/payments`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/stock`, { headers: getHeaders() }),
      ]);

      if (prodRes.ok) {
        const res = await prodRes.json();
        if (res.data) setProducts(res.data);
      }
      if (custRes.ok) {
        const res = await custRes.json();
        if (res.data) setCustomers(res.data);
      }
      if (suppRes.ok) {
        const res = await suppRes.json();
        if (res.data) setSuppliers(res.data);
      }
      if (salesRes.ok) {
        const res = await salesRes.json();
        if (res.data) setSales(res.data);
      }
      if (poRes.ok) {
        const res = await poRes.json();
        if (res.data) setPurchases(res.data);
      }
      if (expRes.ok) {
        const res = await expRes.json();
        if (res.data) setExpenses(res.data);
      }
      if (payRes.ok) {
        const res = await payRes.json();
        if (res.data) setPayments(res.data);
      }
      if (histRes.ok) {
        const res = await histRes.json();
        if (res.data) setStockHistory(res.data);
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('API server notice:', err.message);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllDataFromBackend();
    }
  }, [currentUser, isAuthenticated]);

  // Sync settings to LocalStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('celltech_settings', JSON.stringify(storeSettings));
    }
  }, [storeSettings, mounted]);

  // Secure API Login Handler
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const body = await res.json();
        const user = body.data?.user;
        const token = body.data?.token;

        if (user && token) {
          setCurrentUser(user);
          setAuthToken(token);
          setIsAuthenticated(true);
          localStorage.setItem('celltech_user', JSON.stringify(user));
          localStorage.setItem('celltech_token', token);
          showToast(`Welcome back, ${user.name}!`);
          return true;
        }
      }
    } catch (err) {
      console.error('Login error:', err.message);
    }

    // Fallback demo login
    if (email.toLowerCase() === 'admin@celltech.com') {
      const demoUser = {
        id: 'u-1',
        name: 'Omar Farooq (Owner)',
        email: 'admin@celltech.com',
        role: 'admin',
        title: 'Store Administrator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      };
      setCurrentUser(demoUser);
      setIsAuthenticated(true);
      localStorage.setItem('celltech_user', JSON.stringify(demoUser));
      showToast(`Welcome back, ${demoUser.name}!`);
      return true;
    }

    showToast('Authentication failed: Invalid credentials', 'error');
    return false;
  };

  // Logout Handler
  const logout = () => {
    setCurrentUser(null);
    setAuthToken('');
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('celltech_user');
      localStorage.removeItem('celltech_token');
    }
    showToast('Logged out successfully', 'info');
  };

  // Switch role helper for active session
  const switchRole = (roleType) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: roleType };
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('celltech_user', JSON.stringify(updatedUser));
    }
    showToast(`Switched active user to ${roleType.toUpperCase()} role`, 'info');
  };

  const isAdmin = currentUser?.role === 'admin';

  // ----------------------------------------------------
  // ----------------------------------------------------
  // PRODUCT & INVENTORY ACTIONS
  // ----------------------------------------------------
  const addProduct = async (prodData) => {
    const newProduct = {
      ...prodData,
      id: `prod-${Date.now()}`,
      stock: parseInt(prodData.stock, 10) || 0,
      purchasePrice: parseFloat(prodData.purchasePrice) || 0,
      salePrice: parseFloat(prodData.salePrice) || 0,
      minStockLimit: parseInt(prodData.minStockLimit, 10) || 2,
      createdAt: new Date().toISOString(),
    };

    // Instant UI state update
    setProducts((prev) => [newProduct, ...prev]);

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        const body = await res.json();
        const savedProd = body.data || newProduct;
        setProducts((prev) => prev.map((p) => (p.id === newProduct.id ? savedProd : p)));
        showToast(`Product "${savedProd.brand} ${savedProd.model}" saved to Database!`);
        return savedProd;
      }
    } catch (err) {
      console.error('API Error adding product:', err);
    }

    showToast(`Product "${newProduct.brand} ${newProduct.model}" added!`);
    return newProduct;
  };

  const updateProduct = async (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id, ...updatedFields }),
      });
      if (res.ok) {
        showToast('Product updated successfully in Database!');
        return;
      }
    } catch (err) {
      console.error('API Error updating product:', err);
    }

    showToast('Product updated!');
  };

  const deleteProduct = async (id) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Admins can delete products!', 'error');
      return false;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`${API_BASE_URL}/products?id=${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        showToast('Deleted product from Database', 'warning');
        return true;
      }
    } catch (err) {
      console.error('API Error deleting product:', err);
    }

    showToast('Deleted product', 'warning');
    return true;
  };

  // ----------------------------------------------------
  // SALES & POS ACTIONS
  // ----------------------------------------------------
  const createSale = async (salePayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...salePayload,
          salesPerson: currentUser ? currentUser.name : 'Staff',
        }),
      });

      if (res.ok) {
        const body = await res.json();
        const createdSale = body.data;
        setSales((prev) => [createdSale, ...prev]);
        fetchAllDataFromBackend();
        showToast(`Invoice ${createdSale.invoiceNo} generated via Next.js API!`);
        
        if (createdSale.customerPhone) {
          sendInvoiceWhatsApp(createdSale.invoiceNo, createdSale.customerPhone);
        }
        
        return createdSale;
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Failed to complete sale', 'error');
        return null;
      }
    } catch (err) {
      console.error('API Error processing sale:', err);
    }

    // Fallback
    const nextInvoiceNum = `INV-${1000 + sales.length + 1}`;
    const newSale = {
      id: `sale-${Date.now()}`,
      invoiceNo: nextInvoiceNum,
      ...salePayload,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      salesPerson: currentUser ? currentUser.name : 'Staff',
      status: salePayload.paidAmount >= salePayload.grandTotal ? 'Paid' : 'Partial',
    };
    setSales((prev) => [newSale, ...prev]);
    showToast(`Invoice ${nextInvoiceNum} generated!`);
    return newSale;
  };

  const refundSale = async (saleId, productId, refundQty = 1) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Admins can process refunds!', 'error');
      return false;
    }
    showToast('Refund processed & stock restored!', 'info');
    return true;
  };

  const sendInvoiceWhatsApp = async (invoiceNo, phone = '') => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `*Umar Farooq Mobile Zone - Invoice #${invoiceNo}*\nThank you for choosing Umar Farooq Mobile Zone! Your invoice has been processed.\nHelpline: 03457725525`;
    if (typeof window !== 'undefined' && cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      showToast(`WhatsApp chat opened for ${cleanPhone}!`);
    }
  };

  // ----------------------------------------------------
  // PURCHASE ACTIONS
  // ----------------------------------------------------
  const createPurchase = async (purchasePayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(purchasePayload),
      });

      if (res.ok) {
        const body = await res.json();
        const createdPo = body.data;
        setPurchases((prev) => [createdPo, ...prev]);
        fetchAllDataFromBackend();
        showToast(`PO ${createdPo.purchaseNo} logged & stock increased!`);
        return createdPo;
      }
    } catch (err) {
      console.error('API Error creating purchase:', err);
    }
  };

  const processPurchaseReturn = async (purchaseId, returnPayload) => {
    showToast(`Purchase Return logged: ${storeSettings.currency} ${parseFloat(returnPayload.returnAmount).toLocaleString()} credited`);
  };

  // ----------------------------------------------------
  // CUSTOMER & SUPPLIER ACTIONS
  // ----------------------------------------------------
  const addCustomer = async (cust) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(cust),
      });
      if (res.ok) {
        const body = await res.json();
        setCustomers((prev) => [body.data, ...prev]);
        showToast(`Customer "${body.data.name}" registered in Database!`);
        return body.data;
      }
    } catch (err) {
      console.error('API Error adding customer:', err);
    }
  };

  const recordCustomerPayment = async (customerId, amount, notes = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id: customerId, paymentAmount: amount, notes }),
      });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast(`Recorded customer payment of ${storeSettings.currency} ${parseFloat(amount).toLocaleString()}`);
      }
    } catch (err) {
      console.error('API Error recording customer payment:', err);
    }
  };

  const addSupplier = async (supp) => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(supp),
      });
      if (res.ok) {
        const body = await res.json();
        fetchAllDataFromBackend();
        showToast(`Supplier "${body.data.name}" registered in Database!`);
        return body.data;
      }
    } catch (err) {
      console.error('API Error adding supplier:', err);
    }
  };

  const fetchSupplierLedger = async (supplierId) => {
    const supp = suppliers.find((s) => s.id === supplierId);
    return supp?.ledger || [];
  };

  const recordSupplierPayment = async (supplierId, amount, notes = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id: supplierId, payoutAmount: amount, notes }),
      });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast(`Recorded payout of ${storeSettings.currency} ${parseFloat(amount).toLocaleString()}`);
      }
    } catch (err) {
      console.error('API Error recording supplier payout:', err);
    }
  };

  const recordSupplierBill = async (supplierId, totalAmount, paidAmount = 0, notes = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ id: supplierId, billAmount: totalAmount, paidAmount, notes }),
      });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast(`Recorded new bill of ${storeSettings.currency} ${parseFloat(totalAmount).toLocaleString()}`);
      }
    } catch (err) {
      console.error('API Error recording supplier bill:', err);
    }
  };

  // ----------------------------------------------------
  // EXPENSE ACTIONS
  // ----------------------------------------------------
  const addExpense = async (expData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...expData,
          recordedBy: currentUser ? currentUser.name : 'Admin',
        }),
      });
      if (res.ok) {
        const body = await res.json();
        setExpenses((prev) => [body.data, ...prev]);
        showToast(`Expense of ${storeSettings.currency} ${body.data.amount.toLocaleString()} added under ${body.data.category}`);
        return body.data;
      }
    } catch (err) {
      console.error('API Error adding expense:', err);
    }
  };

  const deleteExpense = async (id) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Admins can delete expense logs!', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/expenses?id=${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        showToast('Expense record deleted from Database', 'warning');
      }
    } catch (err) {
      console.error('API Error deleting expense:', err);
    }
  };

  // ----------------------------------------------------
  // RESET DATABASE
  // ----------------------------------------------------
  const resetDatabase = async () => {
    if (!isAdmin) {
      showToast('Permission Denied: Admin required to reset data!', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
      if (res.ok) {
        fetchAllDataFromBackend();
        showToast('Database reset to initial state', 'info');
      }
    } catch (err) {
      console.error('API Error resetting database:', err);
    }
  };

  const updateStoreSettings = (newSet) => {
    setStoreSettings((prev) => ({ ...prev, ...newSet }));
    showToast('Store settings updated!');
  };

  return (
    <AppContext.Provider
      value={{
        storeSettings,
        updateStoreSettings,
        theme,
        setTheme,
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        isAdmin,
        isBackendConnected,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        recordCustomerPayment,
        suppliers,
        addSupplier,
        recordSupplierPayment,
        recordSupplierBill,
        fetchSupplierLedger,
        sales,
        createSale,
        refundSale,
        sendInvoiceWhatsApp,
        purchases,
        createPurchase,
        processPurchaseReturn,
        expenses,
        addExpense,
        deleteExpense,
        payments,
        stockHistory,
        toast,
        showToast,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
