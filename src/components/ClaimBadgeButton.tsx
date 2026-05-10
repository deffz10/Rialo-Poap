'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  eventId: number
}

export default function ClaimBadgeButton({ eventId }: Props) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClaim = async () => {
    if (!code) {
      alert('Kode wajib diisi')
      return
    }

    setLoading(true)

    const inputCode = code.trim().toUpperCase()

    const { data, error } = await supabase
      .from('Events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !data) {
      alert('Event tidak ditemukan')
      setLoading(false)
      return
    }

    if (!data.claim_open) {
      alert('Code belum dibuka host')
      setLoading(false)
      return
    }

    if (data.claim_code !== inputCode) {
      alert('Code salah')
      setLoading(false)
      return
    }

    const now = new Date()
    const expire = new Date(data.claim_expired_at)

    if (now > expire) {
      alert('Code expired')
      setLoading(false)
      return
    }

    window.location.href = `/claim/${eventId}`
  }

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 font-semibold text-white shadow-lg hover:brightness-110 transition"
      >
        Claim Badge
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* CARD */}
          <div className="relative z-10 w-80 rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-purple-500/20 p-6 shadow-[0_20px_60px_rgba(124,92,255,0.25)]">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg"
            >
              ✕
            </button>

            {/* TITLE */}
            <h2 className="text-white text-lg font-semibold mb-4">
              Enter Event Code
            </h2>

            {/* INPUT */}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Xxx Xxx Xxx"
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white placeholder-zinc-500 outline-none mb-4 border border-zinc-700 focus:border-purple-500 transition"
            />

            {/* BUTTON */}
            <button
              onClick={handleClaim}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold shadow-md hover:brightness-110 transition"
            >
              {loading ? 'Checking...' : 'Claim'}
            </button>

          </div>
        </div>
      )}
    </>
  )
}