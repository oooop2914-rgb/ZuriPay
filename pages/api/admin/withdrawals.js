// pages/api/admin/withdrawals.js
import { supabaseAdmin } from '../../../lib/supabase-admin'

function isAdmin(req) {
  const token = req.headers['x-admin-token']
  return token && token === process.env.ADMIN_API_TOKEN
}

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Akses ditolak' })

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ withdrawals: data })
  }

  if (req.method === 'POST') {
    const { id, status, catatan } = req.body
    if (!['SELESAI', 'DITOLAK', 'DIPROSES'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' })
    }
    const { error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status, catatan_admin: catatan || null, processed_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
