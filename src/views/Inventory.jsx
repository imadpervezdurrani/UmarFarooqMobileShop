'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  History,
  Filter,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';

export const Inventory = ({ searchQuery }) => {
  const {
    storeSettings,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    stockHistory,
    isAdmin,
  } = useApp();

  // Filters
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPta, setSelectedPta] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    brand: 'Apple',
    model: '',
    ram: '8GB',
    storage: '256GB',
    color: 'Titanium Natural',
    imei1: '',
    imei2: '',
    purchasePrice: '',
    salePrice: '',
    stock: 1,
    ptaStatus: 'PTA Approved',
    minStockLimit: 2,
  });

  const ptaOptions = ['PTA Approved', 'Non-PTA', 'JV', 'CPID', 'OEM'];
  const brandOptions = ['Apple', 'Samsung', 'Xiaomi', 'Vivo', 'Oppo', 'OnePlus', 'Infinix', 'Tecno', 'Other'];

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      brand: 'Apple',
      model: '',
      ram: '8GB',
      storage: '256GB',
      color: '',
      imei1: '',
      imei2: '',
      purchasePrice: '',
      salePrice: '',
      stock: 1,
      ptaStatus: 'PTA Approved',
      minStockLimit: 2,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      brand: p.brand,
      model: p.model,
      ram: p.ram,
      storage: p.storage,
      color: p.color,
      imei1: p.imei1 || '',
      imei2: p.imei2 || '',
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      stock: p.stock,
      ptaStatus: p.ptaStatus,
      minStockLimit: p.minStockLimit || 2,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.model.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const openHistoryModal = (p) => {
    setHistoryProduct(p);
    setIsHistoryModalOpen(true);
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.imei1 && p.imei1.includes(searchQuery)) ||
      (p.imei2 && p.imei2.includes(searchQuery));

    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesPta = selectedPta === 'All' || p.ptaStatus === selectedPta;

    return matchesSearch && matchesBrand && matchesPta;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product & Inventory Management</h1>
          <p className="page-subtitle">Track mobile models, IMEIs, PTA status, stock levels, and cost margins</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Mobile Device</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Filter size={16} color="var(--accent-cyan)" />
          <span>Filters:</span>
        </div>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="form-select"
          style={{ width: '160px', height: '36px', fontSize: '0.85rem' }}
        >
          <option value="All">All Brands</option>
          {brandOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* PTA Status Filter */}
        <select
          value={selectedPta}
          onChange={(e) => setSelectedPta(e.target.value)}
          className="form-select"
          style={{ width: '180px', height: '36px', fontSize: '0.85rem' }}
        >
          <option value="All">All PTA Statuses</option>
          {ptaOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> devices
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Brand & Model</th>
                <th>RAM / Storage / Color</th>
                <th>Dual IMEI (IMEI 1 & 2)</th>
                <th>PTA Status</th>
                {isAdmin && <th>Purchase Cost</th>}
                <th>Selling Price</th>
                <th>Stock Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stock <= p.minStockLimit;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {p.brand} {p.model}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {p.id}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {p.ram} / {p.storage}
                        </div>
                        {p.color && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Color: {p.color}
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--accent-cyan)' }}>IMEI 1: {p.imei1 || 'N/A'}</div>
                        <div style={{ color: 'var(--text-muted)' }}>IMEI 2: {p.imei2 || 'N/A'}</div>
                      </td>
                      <td>
                        <Badge variant={p.ptaStatus}>{p.ptaStatus}</Badge>
                      </td>
                      {isAdmin && (
                        <td style={{ color: 'var(--text-muted)' }}>
                          {storeSettings.currency} {(p.purchasePrice || 0).toLocaleString()}
                        </td>
                      )}
                      <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {storeSettings.currency} {(p.salePrice || 0).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: isLowStock ? '#fb7185' : 'var(--text-main)' }}>
                            {p.stock}
                          </span>
                          {isLowStock && <Badge variant="rose">Low Stock Alert</Badge>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => openHistoryModal(p)}
                            className="btn btn-secondary btn-icon"
                            title="Stock Movement History"
                          >
                            <History size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="btn btn-secondary btn-icon"
                            title="Edit Device"
                          >
                            <Edit2 size={15} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="btn btn-danger btn-icon"
                              title="Delete Product"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.brand} ${editingProduct.model}` : 'Add New Mobile Product'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                className="form-select"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              >
                {brandOptions.filter((b) => b !== 'Other').map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Galaxy S24 Ultra 5G"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">RAM</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 8GB or 12GB"
                value={formData.ram}
                onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Storage</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 256GB / 512GB"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Titanium Natural"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Primary IMEI 1</label>
              <input
                type="text"
                className="form-input"
                placeholder="15-digit IMEI 1"
                value={formData.imei1}
                onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Secondary IMEI 2</label>
              <input
                type="text"
                className="form-input"
                placeholder="15-digit IMEI 2"
                value={formData.imei2}
                onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">PTA Registration Status</label>
              <select
                className="form-select"
                value={formData.ptaStatus}
                onChange={(e) => setFormData({ ...formData, ptaStatus: e.target.value })}
              >
                {ptaOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Alert Limit</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.minStockLimit}
                onChange={(e) => setFormData({ ...formData, minStockLimit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Purchase Price ({storeSettings.currency})</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="Cost price"
                disabled={!isAdmin}
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Retail Sale Price ({storeSettings.currency}) *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                placeholder="Sale price"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Save New Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={historyProduct ? `Stock History: ${historyProduct.brand} ${historyProduct.model}` : 'Stock History'}
      >
        {historyProduct && (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Current Stock: <strong style={{ color: 'var(--accent-cyan)' }}>{historyProduct.stock} units</strong>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Stock After</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHistory
                    .filter((sh) => sh.productName.includes(historyProduct.model))
                    .map((sh) => (
                      <tr key={sh.id}>
                        <td>{sh.date}</td>
                        <td>
                          <Badge variant={sh.quantity > 0 ? 'emerald' : 'rose'}>{sh.changeType}</Badge>
                        </td>
                        <td style={{ fontWeight: 700, color: sh.quantity > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          {sh.quantity > 0 ? `+${sh.quantity}` : sh.quantity}
                        </td>
                        <td>{sh.stockAfter}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sh.reference}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
