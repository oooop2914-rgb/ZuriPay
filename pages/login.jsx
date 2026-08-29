// pages/login.jsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useBackendStatus } from '../lib/use-backend-status'

export default function LoginPage() {
  const router = useRouter()
  const backendOnline = useBackendStatus()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) return setError('Email atau password salah')
    router.push('/dashboard')
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 16px' }}>
      {backendOnline === false && (
        <div className="zp-glass" style={{ padding: 16, marginBottom: 16 }}>
          <span className="zp-badge offline">BACKEND OFFLINE</span>
        </div>
      )}
      <div className="zp-neu" style={{ padding: 28 }}>
        <h1 style={{ marginTop: 0 }}>Login ZuriPay</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <input className="zp-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="zp-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
          <button className="zp-button" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: 16 }}>Belum punya akun? <a href="/register">Daftar</a></p>
        <p><a href="/admin/login" style={{ fontSize: 13 }}>Login admin →</a></p>
      </div>
    </div>
  )
}
