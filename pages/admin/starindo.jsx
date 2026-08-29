// pages/admin/starindo.jsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export default function StarindoAccountPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [status, setStatus] = useState(null) // { connected, nama, saldo, ... }
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [needOtp, setNeedOtp] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = sessionStorage.getItem('zuripay_admin_token')
    if (!t) return router.push('/admin/login')
    setToken(t)
    cekStatus(t)
  }, [router])

  async function cekStatus(t) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/starindo-status`, {
        headers: { 'x-admin-token': t },
      })
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ connected: false })
    }
  }

  async function handleRelogin(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/starindo-relogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.status === 'OTP_REQUIRED') {
        setNeedOtp(true)
        setMsg(data.message)
      } else if (data.status === 'SUCCESS') {
        setMsg('Berhasil terhubung ke akun Starindo.')
        cekStatus(token)
      } else {
        setMsg(data.error || 'Gagal login')
      }
    } catch (err) {
      setMsg('Gagal menghubungi backend')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtp(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/starindo-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ otpCode: otp }),
      })
      const data = await res.json()
      if (data.status === 'SUCCESS') {
        setMsg('Berhasil terhubung ke akun Starindo.')
        setNeedOtp(false)
        cekStatus(token)
      } else {
        setMsg(data.error || 'OTP salah')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '30px auto', padding: '0 16px' }}>
      <h1>Akun Starindo (Sumber Dana Gateway)</h1>

      <div className="zp-neu" style={{ padding: 20, marginBottom: 16 }}>
        {status === null && <p>Mengecek status...</p>}
        {status && (
          <>
            <span className={`zp-badge ${status.connected ? 'online' : 'offline'}`}>
              {status.connected ? 'TERHUBUNG' : 'TIDAK TERHUBUNG'}
            </span>
            {status.connected && (
              <div style={{ marginTop: 10, fontSize: 14 }}>
                <p>Nama: {status.nama}</p>
                <p>Saldo: {status.saldo}</p>
                <p>Status akun: {status.statusAkun}</p>
              </div>
            )}
          </>
        )}
      </div>

      {!needOtp ? (
        <div className="zp-neu" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Login / Relogin Akun Starindo</h3>
          <p style={{ fontSize: 13 }}>
            Dipakai kalau sesi expired atau ini pertama kali setup. Kredensial
            tidak disimpan di server — cuma dipakai sekali buat proses login,
            hasilnya (cookie sesi) yang disimpan.
          </p>
          <form onSubmit={handleRelogin} style={{ display: 'grid', gap: 12 }}>
            <input className="zp-input" placeholder="Username Starindo" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input className="zp-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {msg && <div style={{ fontSize: 13 }}>{msg}</div>}
            <button className="zp-button" type="submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div className="zp-neu" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Masukkan OTP</h3>
          <p style={{ fontSize: 13 }}>Cek email/WA akun Starindo untuk kode OTP.</p>
          <form onSubmit={handleOtp} style={{ display: 'grid', gap: 12 }}>
            <input className="zp-input" placeholder="Kode OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            {msg && <div style={{ fontSize: 13 }}>{msg}</div>}
            <button className="zp-button" type="submit" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
