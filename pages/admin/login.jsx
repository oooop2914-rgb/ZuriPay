// pages/admin/login.jsx
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLoginPage() {
  const router = useRouter()
  const [token, setToken] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    sessionStorage.setItem('zuripay_admin_token', token)
    router.push('/admin/dashboard')
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 16px' }}>
      <div className="zp-neu" style={{ padding: 28 }}>
        <h1 style={{ marginTop: 0 }}>Admin Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <input
            className="zp-input"
            type="password"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <button className="zp-button" type="submit">Masuk</button>
        </form>
        <p style={{ fontSize: 12, marginTop: 12 }}>
          Token diambil dari nilai <code>ADMIN_API_TOKEN</code> di config kamu (Gist).
        </p>
      </div>
    </div>
  )
}
