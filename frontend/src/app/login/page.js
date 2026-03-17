'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await loginUser(username, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setError(data.detail || 'Invalid credentials.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">VendorHub</Link>
        <div className="navbar-links">
          <Link href="/register">Register</Link>
        </div>
      </nav>

      <div className="auth-wrapper">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to manage your products.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account? <Link href="/register">Create one</Link>
          </div>
        </div>
      </div>
    </>
  );
}
