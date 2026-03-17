'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, clearTokens, apiFetch } from '@/lib/api';

/* ───────────── Product Form Modal ───────────── */
function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    product_name: product?.product_name || '',
    description: product?.description || '',
    price: product?.price || '',
    quantity: product?.quantity ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.product_name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      setError('Please enter a valid price.');
      return;
    }
    if (form.quantity === '' || Number(form.quantity) < 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/products/${product.id}/` : '/products/';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          product_name: form.product_name,
          description: form.description,
          price: parseFloat(form.price).toFixed(2),
          quantity: parseInt(form.quantity, 10),
        }),
      });
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        const msg =
          Object.values(data).flat().join(' ') || 'Something went wrong.';
        setError(msg);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="prod-name">Product Name</label>
            <input
              id="prod-name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prod-desc">Description</label>
            <textarea
              id="prod-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your product…"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prod-price">Price ($)</label>
              <input
                id="prod-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prod-qty">Quantity</label>
              <input
                id="prod-qty"
                name="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
              style={{ width: 'auto' }}
            >
              {loading
                ? 'Saving…'
                : isEdit
                  ? 'Update Product'
                  : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ───────────── Dashboard Page ───────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalProduct, setModalProduct] = useState(null); // null=closed, {}=add, {id:..}=edit
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setError('');
    try {
      const res = await apiFetch('/products/');
      if (res.ok) {
        setProducts(await res.json());
      } else {
        setError('Failed to load products.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    fetchProducts();
  }, [router, fetchProducts]);

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  const openAdd = () => {
    setModalProduct(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setModalProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalProduct(null);
  };

  const handleSaved = () => {
    closeModal();
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleteId(id);
    try {
      const res = await apiFetch(`/products/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <nav className="navbar">
        <Link href="/dashboard" className="navbar-brand">VendorHub</Link>
        <div className="navbar-links">
          <button onClick={handleLogout} className="nav-btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Your Products</h1>
            <p className="product-count">
              {products.length} product{products.length !== 1 && 's'}
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAdd} style={{ width: 'auto' }}>
            + Add Product
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h2>No products yet</h2>
            <p>Add your first product to get started.</p>
            <button className="btn btn-primary" onClick={openAdd} style={{ width: 'auto' }}>
              + Add Product
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div className="product-card" key={p.id}>
                <p className="product-date">{formatDate(p.created_date)}</p>
                <h3>{p.product_name}</h3>
                <p className="description">
                  {p.description || 'No description provided.'}
                </p>

                <div className="product-meta">
                  <div className="meta-item">
                    <span className="meta-label">Price</span>
                    <span className="meta-value">
                      ${parseFloat(p.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Quantity</span>
                    <span className="meta-value qty">{p.quantity}</span>
                  </div>
                </div>

                <div className="product-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleteId === p.id}
                  >
                    {deleteId === p.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={modalProduct}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
