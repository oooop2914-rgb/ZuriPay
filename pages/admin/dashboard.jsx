// pages/admin/dashboard.jsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminDashboard() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [list, setList] = useState([])

  useEffect(() => {
    const t = sessionStorage.getItem('zuripay_admin_token')
    if (!t) return router.push('/admin/login')
    setToken(t)
    load(t)
  }, [router])

  async function load(t) {
    const res = await fetch('/api/admin/withdrawals', { headers: { 'x-admin-token': t } })
    if (!res.ok) return router.push('/admin/login')
    const data = await res.json()
    setList(data.withdrawals)
  }

  async function proses(id, status) {
    await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ id, status }),
    })
    load(token)
  }

  return (
    <div style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin — Withdrawal</h1>
        <a href="/admin/starindo" className="zp-button" style={{ textDecoration: 'none' }}>Akun Starindo</a>
      </div>
      <div className="zp-neu" style={{ padding: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Nominal</th>
              <th style={{ padding: 8 }}>Metode</th>
              <th style={{ padding: 8 }}>Tujuan</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.id}>
                <td style={{ padding: 8 }}>Rp{w.nominal.toLocaleString('id-ID')}</td>
                <td style={{ padding: 8 }}>{w.metode}</td>
                <td style={{ padding: 8 }}>{w.tujuan}</td>
                <td style={{ padding: 8 }}>
                  <span className={`zp-badge ${w.status === 'SELESAI' ? 'online' : w.status === 'DITOLAK' ? 'offline' : 'pending'}`}>
                    {w.status}
                  </span>
                </td>
                <td style={{ padding: 8, display: 'flex', gap: 6 }}>
                  {w.status === 'MENUNGGU' && (
                    <>
                      <button className="zp-button" onClick={() => proses(w.id, 'SELESAI')}>Tandai Selesai</button>
                      <button className="zp-button" onClick={() => proses(w.id, 'DITOLAK')}>Tolak</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
