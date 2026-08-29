// pages/register.jsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useBackendStatus } from '../lib/use-backend-status'

export default function RegisterPage() {
  const router = useRouter()
  const backendOnline = useBackendStatus()
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, nama, saldo: 0, role: 'user' })
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Gagal mendaftar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 16px' }}>
      {backendOnline === false && (
        <div className="zp-glass" style={{ padding: 16, marginBottom: 16 }}>
          <span className="zp-badge offline">BACKEND OFFLINE</span>
          <p style={{ fontSize: 13, marginBottom: 0 }}>
            Kamu tetap bisa daftar & login, tapi fitur pembayaran belum bisa dipakai
            sampai backend nyala lagi.
          </p>
        </div>
      )}

      <div className="zp-neu" style={{ padding: 28 }}>
        <h1 style={{ marginTop: 0 }}>Daftar ZuriPay</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <input className="zp-input" placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} required />
          <input className="zp-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="zp-input" type="password" placeholder="Password (min 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          {error && <div style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
          <button className="zp-button" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p style={{ marginTop: 16 }}>Sudah punya akun? <a href="/login">Login</a></p>
      </div>
    </div>
  )
}
