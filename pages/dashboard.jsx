// pages/dashboard.jsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useBackendStatus } from '../lib/use-backend-status'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export default function DashboardPage() {
  const router = useRouter()
  const backendOnline = useBackendStatus()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('bayar')

  const [nominal, setNominal] = useState('')
  const [payment, setPayment] = useState(null)
  const [payStatus, setPayStatus] = useState('idle')

  const [wdNominal, setWdNominal] = useState('')
  const [wdMetode, setWdMetode] = useState('dana')
  const [wdTujuan, setWdTujuan] = useState('')
  const [wdMsg, setWdMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUser(data.user)
    })
  }, [router])

  async function buatPembayaran(e) {
    e.preventDefault()
    setPayStatus('loading')
    try {
      const res = await fetch(`${BACKEND_URL}/api/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.id, nominal: Number(nominal) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPayment(data)
      setPayStatus('waiting')
      pollStatus(data.depositId)
    } catch (err) {
      setPayStatus('idle')
    }
  }

  function pollStatus(depositId) {
    const interval = setInterval(async () => {
      const { data } = await supabase.from('transaksi').select('status').eq('deposit_id', depositId).single()
      if (data?.status === 'SUKSES') { setPayStatus('sukses'); clearInterval(interval) }
      else if (data?.status === 'GAGAL' || data?.status === 'EXPIRED') { setPayStatus('gagal'); clearInterval(interval) }
    }, 3000)
  }

  async function ajukanWithdraw(e) {
    e.preventDefault()
    setWdMsg('')
    const nominalNum = Number(wdNominal)
    if (nominalNum < 20000) {
      setWdMsg('Minimum withdraw Rp20.000')
      return
    }
    const { error } = await supabase.from('withdrawals').insert({
      uid: user.id,
      nominal: nominalNum,
      metode: wdMetode,
      tujuan: wdTujuan,
      status: 'MENUNGGU',
    })
    if (error) setWdMsg('Gagal mengajukan: ' + error.message)
    else {
      setWdMsg('Permintaan withdraw terkirim, menunggu diproses admin.')
      setWdNominal(''); setWdTujuan('')
    }
  }

  if (!user) return null

  return (
    <div style={{ maxWidth: 480, margin: '30px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>ZuriPay</h2>
        <span className={`zp-badge ${backendOnline ? 'online' : 'offline'}`}>
          {backendOnline === null ? 'Mengecek...' : backendOnline ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="zp-button" style={{ opacity: tab === 'bayar' ? 1 : 0.6 }} onClick={() => setTab('bayar')}>Bayar</button>
        <button className="zp-button" style={{ opacity: tab === 'withdraw' ? 1 : 0.6 }} onClick={() => setTab('withdraw')}>Withdraw</button>
      </div>

      {!backendOnline && (
        <div className="zp-glass" style={{ padding: 16, marginBottom: 16 }}>
          Backend sedang offline — fitur bayar & withdraw belum bisa dipakai. Coba lagi nanti.
        </div>
      )}

      {tab === 'bayar' && backendOnline && payStatus !== 'waiting' && payStatus !== 'sukses' && (
        <div className="zp-neu" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Buat Pembayaran</h3>
          <form onSubmit={buatPembayaran} style={{ display: 'grid', gap: 14 }}>
            <input className="zp-input" type="number" placeholder="Nominal (Rp)" value={nominal} onChange={(e) => setNominal(e.target.value)} min={1000} required />
            <button className="zp-button" type="submit" disabled={payStatus === 'loading'}>
              {payStatus === 'loading' ? 'Membuat QR...' : 'Buat QRIS'}
            </button>
          </form>
        </div>
      )}

      {payment && payStatus === 'waiting' && (
        <div className="zp-glass" style={{ padding: 24, textAlign: 'center' }}>
          <span className="zp-badge pending">MENUNGGU PEMBAYARAN</span>
          <p>Total: <b>Rp{payment.nominalTagihanUser.toLocaleString('id-ID')}</b></p>
          <img src={payment.qrisImage} alt="QRIS" style={{ width: '100%', borderRadius: 12 }} />
        </div>
      )}

      {payStatus === 'sukses' && (
        <div className="zp-neu" style={{ padding: 24, textAlign: 'center' }}>
          <h3>Pembayaran berhasil ✅</h3>
        </div>
      )}

      {tab === 'withdraw' && backendOnline && (
        <div className="zp-neu" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Ajukan Withdraw</h3>
          <p style={{ fontSize: 13 }}>Minimum Rp20.000. Diproses manual oleh admin.</p>
          <form onSubmit={ajukanWithdraw} style={{ display: 'grid', gap: 14 }}>
            <input className="zp-input" type="number" placeholder="Nominal (min 20000)" value={wdNominal} onChange={(e) => setWdNominal(e.target.value)} min={20000} required />
            <select className="zp-input" value={wdMetode} onChange={(e) => setWdMetode(e.target.value)}>
              <option value="dana">DANA</option>
              <option value="ovo">OVO</option>
              <option value="gopay">GoPay</option>
              <option value="bank">Transfer Bank</option>
            </select>
            <input className="zp-input" placeholder="Nomor/rekening tujuan" value={wdTujuan} onChange={(e) => setWdTujuan(e.target.value)} required />
            {wdMsg && <div style={{ fontSize: 13 }}>{wdMsg}</div>}
            <button className="zp-button" type="submit">Ajukan Withdraw</button>
          </form>
        </div>
      )}
    </div>
  )
}
