'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'

/* ─── helpers ─── */
function getStatus(date: string, time: string) {
  if (!date || !time) return 'UPCOMING'
  const start = new Date(`${date}T${time}Z`) // Treat as UTC
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const now = new Date()
  if (now < start) return 'UPCOMING'
  if (now >= start && now <= end) return 'LIVE'
  return 'ENDED'
}

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatTime(time: string) {
  if (!time) return ''
  return `${time} UTC`
}

function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'RIALO-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function maskAddress(address: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/* ─── status badge ─── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'LIVE')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        Live
      </span>
    )
  if (status === 'UPCOMING')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Upcoming
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
      Ended
    </span>
  )
}

/* ─── main page ─── */
export default function DashboardPage() {
  const { address } = useAccount()

  /* ── create event state ── */
  const [title, setTitle] = useState('')
  const [host, setHost] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  /* ── event list state ── */
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editHost, setEditHost] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')

  /* ── claim code state ── */
  const [openCodeId, setOpenCodeId] = useState<number | null>(null)
  const [claimCode, setClaimCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [copied, setCopied] = useState(false)

  /* ── detail event state ── */
  const [openDetailId, setOpenDetailId] = useState<number | null>(null)
  const [claims, setClaims] = useState<any[]>([])
  const [loadingClaims, setLoadingClaims] = useState(false)

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  /* ── load events ── */
  async function loadEvents() {
    if (!address) return
    const { data } = await supabase
      .from('Events')
      .select('*')
      .eq('creator_wallet', address)
      .order('id', { ascending: false })

    const rows = data || []
    setEvents(rows)
    setLoading(false)

    const active = rows.find(
      (item) =>
        item.claim_open &&
        item.claim_expired_at &&
        new Date(item.claim_expired_at) > new Date()
    )
    if (active) {
      const left = Math.floor(
        (new Date(active.claim_expired_at).getTime() - Date.now()) / 1000
      )
      setOpenCodeId(active.id)
      setClaimCode(active.claim_code)
      setSecondsLeft(left)
    }
  }

  useEffect(() => { loadEvents() }, [address])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  useEffect(() => {
    async function autoClose() {
      if (secondsLeft === 0 && openCodeId) {
        await supabase.from('Events').update({ claim_open: false }).eq('id', openCodeId)
        setOpenCodeId(null)
        setClaimCode('')
      }
    }
    autoClose()
  }, [secondsLeft])

  /* ── create handler ── */
  const handleCreate = async () => {
    try {
      if (!title || !host || !date || !time) {
        alert('Please complete all fields')
        return
      }
      if (!address) {
        alert('Please connect wallet first')
        return
      }
      setCreating(true)

      let imageUrl = ''
      if (image) {
        const fileName = `${address}/${Date.now()}-${image.name}`
        const { error: uploadError } = await supabase.storage
          .from('event')
          .upload(fileName, image)
        if (uploadError) {
          alert(uploadError.message)
          setCreating(false)
          return
        }
        const { data } = supabase.storage.from('event').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      const secret = generateSecret()
      const { error } = await supabase.from('Events').insert([{
        title, host, event_date: date, event_time: time,
        image_url: imageUrl, creator_wallet: address, creator_name: host,
        claim_code: secret, claim_open: false, claim_expired_at: null,
      }])

      if (error) { alert(error.message); return }

      setTitle(''); setHost(''); setDate(''); setTime('')
      setImage(null); setPreviewUrl(null)
      alert('Event Created Successfully!')
      loadEvents()
    } catch (err: any) {
      alert(err?.message || 'Failed create event')
    } finally {
      setCreating(false)
    }
  }

  /* ── edit / delete ── */
  function startEdit(item: any) {
    setEditingId(item.id)
    setEditTitle(item.title || '')
    setEditHost(item.creator_name || '')
    setEditDate(item.event_date || '')
    setEditTime(item.event_time || '')
  }

  async function saveEdit(id: number) {
    await supabase.from('Events').update({
      title: editTitle, creator_name: editHost,
      host: editHost, event_date: editDate, event_time: editTime,
    }).eq('id', id)
    setEditingId(null)
    loadEvents()
  }

  async function deleteEvent(id: number) {
    if (!confirm('Delete event?')) return
    await supabase.from('Events').delete().eq('id', id)
    loadEvents()
  }

  /* ── claim code actions ── */
  async function openCode(item: any) {
    const newCode = generateSecret()
    const expire = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    await supabase.from('Events').update({
      claim_open: true, claim_code: newCode, claim_expired_at: expire,
    }).eq('id', item.id)
    setOpenCodeId(item.id)
    setClaimCode(newCode)
    setSecondsLeft(900)
    loadEvents()
  }

  async function stopCode(id: number) {
    await supabase.from('Events').update({ claim_open: false }).eq('id', id)
    setOpenCodeId(null); setClaimCode(''); setSecondsLeft(0)
    loadEvents()
  }

  async function copyCode() {
    await navigator.clipboard.writeText(claimCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── load event claims ── */
  async function toggleDetails(eventId: number) {
    if (openDetailId === eventId) {
      setOpenDetailId(null)
      return
    }
    setOpenDetailId(eventId)
    setLoadingClaims(true)
    
    // Fetch data claims dari table EventClaims
    const { data } = await supabase
      .from('EventClaims')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      
    setClaims(data || [])
    setLoadingClaims(false)
  }

  /* ── image preview ── */
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setImage(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const progressPct = Math.round((secondsLeft / 900) * 100)

  /* ─────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-[#06060a] text-white font-sans">

      {/* ── floating Home button top-right ── */}
      <div className="fixed top-5 right-5 z-50">
        <a
          href="/"
          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl
            bg-purple-600 hover:bg-purple-500 border border-purple-500
            text-sm font-semibold text-white
            backdrop-blur-md transition-all duration-200 shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Home
        </a>
      </div>

      <div className="flex flex-col md:flex-row md:h-screen">

        {/* ── LEFT SIDEBAR: Create Event ── */}
        <aside className="w-full md:w-[320px] md:shrink-0 md:h-screen md:overflow-y-auto
          border-b md:border-b-0 md:border-r border-white/10
          bg-gradient-to-b from-[#0c0c14] to-[#080810]">

          <div className="p-7 pt-10">

            {/* section header */}
            <div className="mb-6 mt-4">
              <h1 className="text-[22px] font-black text-white tracking-wide mb-8">Event Dashboard</h1>
              <p className="text-[9px] font-extrabold tracking-[0.25em] text-purple-400/80 uppercase mb-1.5">New Experience</p>
              <h2 className="text-2xl font-extrabold text-white leading-tight">Create Event</h2>
              <p className="text-white/35 text-xs mt-1.5 font-medium">Zero gas fee · Instant launch</p>
            </div>

            <div className="space-y-3">

              {/* image upload */}
              <label className="block cursor-pointer group">
                <div className={`w-full h-[120px] rounded-2xl border-2 border-dashed transition-all overflow-hidden
                  ${previewUrl
                    ? 'border-purple-500/60'
                    : 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}>
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/25 group-hover:text-white/50 transition-colors">
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M4 16l4-4 4 4 4-6 4 6" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                      <span className="text-xs font-semibold">Upload Banner</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event Title"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500/60 focus:bg-white/[0.06] focus:outline-none px-4 py-3 text-sm text-white placeholder:text-white/25 transition-all"
              />

              <input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="Host Name"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500/60 focus:bg-white/[0.06] focus:outline-none px-4 py-3 text-sm text-white placeholder:text-white/25 transition-all"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-white/40 mb-1 ml-1">Date (UTC)</p>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500/60 focus:outline-none px-4 py-3 text-sm text-white/80 [color-scheme:dark] transition-all"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 mb-1 ml-1">Time (UTC)</p>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-500/60 focus:outline-none px-4 py-3 text-sm text-white/80 [color-scheme:dark] transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600
                  hover:from-violet-500 hover:to-purple-500
                  disabled:opacity-40 disabled:cursor-not-allowed
                  py-3 text-sm font-bold text-white tracking-wide transition-all duration-200
                  shadow-lg shadow-purple-900/30 active:scale-[0.98] mt-2"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating…
                  </span>
                ) : '+ Create Event'}
              </button>

            </div>

            {/* divider */}
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[9px] text-white/25 tracking-[0.25em] uppercase font-bold">My Events</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-300">
                {events.length}
              </span>
              <p className="text-xs text-white/40 font-medium">
                event{events.length !== 1 ? 's' : ''} created
              </p>
            </div>

          </div>
        </aside>

        {/* ── RIGHT: Event List ── */}
        <section className="flex-1 md:h-screen md:overflow-y-auto px-6 md:px-10 py-10 md:pt-12">

          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">My Events</h1>
            <p className="text-white/40 text-sm mt-2 font-medium">Manage and launch your event access codes</p>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-white/40">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm font-medium">Loading events…</span>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-3xl">
                🎪
              </div>
              <div>
                <p className="text-white/70 font-bold text-lg">No events yet</p>
                <p className="text-white/30 text-sm mt-1">Create your first event using the form</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {events.map((item) => {
                const status = getStatus(item.event_date, item.event_time)
                const isEditing = editingId === item.id
                const isCodeOpen = openCodeId === item.id && secondsLeft > 0
                const isDetailsOpen = openDetailId === item.id

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl overflow-hidden border border-white/10 bg-[#0e0e18]
                      hover:border-white/[0.15] transition-all duration-300
                      shadow-xl shadow-black/40"
                  >
                    {/* banner */}
                    <div className="relative h-44 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-zinc-900 flex items-center justify-center text-4xl">
                          🎪
                        </div>
                      )}

                      {/* overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e18] via-transparent to-transparent opacity-60" />

                      {/* Edit button — premium style */}
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(item)}
                          className="absolute top-3 right-3 group inline-flex items-center gap-1.5
                            px-3 py-1.5 rounded-xl
                            bg-black/50 hover:bg-violet-600/80
                            border border-white/10 hover:border-violet-400/40
                            backdrop-blur-md text-white/70 hover:text-white
                            text-xs font-semibold tracking-wide
                            transition-all duration-200 shadow-lg"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                      )}
                    </div>

                    {/* card body */}
                    <div className="p-5">
                      {isEditing ? (
                        /* ── edit mode ── */
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-3">Editing Event</p>
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Event Title"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-purple-500/60 focus:outline-none transition-all"
                          />
                          <input
                            value={editHost}
                            onChange={(e) => setEditHost(e.target.value)}
                            placeholder="Host Name"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-purple-500/60 focus:outline-none transition-all"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/80 [color-scheme:dark] focus:border-purple-500/60 focus:outline-none"
                            />
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/80 [color-scheme:dark] focus:border-purple-500/60 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="py-2.5 rounded-xl border border-white/10 hover:border-white/25 text-sm text-white/70 hover:text-white transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                          <button
                            onClick={() => deleteEvent(item.id)}
                            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400/80 text-sm hover:border-red-500/60 hover:bg-red-500/5 hover:text-red-300 transition-all"
                          >
                            Delete Event
                          </button>
                        </div>
                      ) : (
                        /* ── view mode ── */
                        <>
                          <div className="mb-3">
                            <StatusBadge status={status} />
                          </div>

                          <h2 className="text-[17px] font-extrabold mb-3.5 leading-snug text-white">
                            {item.title}
                          </h2>

                          <div className="space-y-1.5 mb-5">
                            <p className="text-sm text-white/60 flex items-center gap-2">
                              <span className="text-base">📅</span>
                              {formatDate(item.event_date)}
                            </p>
                            <p className="text-sm text-white/60 flex items-center gap-2">
                              <span className="text-base">⏰</span>
                              {formatTime(item.event_time)}
                            </p>
                            <p className="text-sm text-white/60 flex items-center gap-2">
                              <span className="text-base">👤</span>
                              {item.creator_name}
                            </p>
                          </div>

                          <button
                            onClick={() => openCode(item)}
                            className="w-full py-2.5 rounded-2xl font-bold text-sm tracking-wide
                              bg-gradient-to-r from-violet-600 to-purple-600
                              hover:from-violet-500 hover:to-purple-500
                              text-white shadow-lg shadow-purple-900/30
                              transition-all duration-200 active:scale-[0.98]"
                          >
                            {isCodeOpen ? '↻ Regenerate Code' : 'Open Code'}
                          </button>

                          {/* ── Detail Event Button ── */}
                          <button
                            onClick={() => toggleDetails(item.id)}
                            className="w-full mt-2 py-2.5 rounded-2xl font-bold text-sm tracking-wide
                              bg-white/[0.04] hover:bg-white/[0.08]
                              border border-white/10 text-white/80 hover:text-white
                              transition-all duration-200"
                          >
                            {isDetailsOpen ? 'Close Details' : 'Detail Event'}
                          </button>

                          {/* ── claim code panel ── */}
                          {isCodeOpen && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm p-4 overflow-hidden relative">

                              {/* subtle glow */}
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-12 bg-purple-500/20 rounded-full blur-2xl" />

                              <p className="text-[9px] font-extrabold tracking-[0.3em] text-white/30 uppercase mb-3">
                                Claim Code
                              </p>

                              <p className="text-2xl font-black text-violet-300 tracking-[0.2em] mb-1 font-mono">
                                {claimCode}
                              </p>

                              {/* countdown + progress */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-xs text-white/40">
                                    Expires in{' '}
                                    <span className="text-white font-mono font-bold">
                                      {minutes}:{seconds.toString().padStart(2, '0')}
                                    </span>
                                  </p>
                                  <span className="text-[10px] text-white/25 font-medium">{progressPct}%</span>
                                </div>
                                <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-1000"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={copyCode}
                                  className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border
                                    ${copied
                                      ? 'border-green-500/40 bg-green-500/10 text-green-300'
                                      : 'border-white/10 hover:border-white/20 text-white/70 hover:text-white'
                                    }`}
                                >
                                  {copied ? '✓ Copied!' : 'Copy Code'}
                                </button>
                                <button
                                  onClick={() => stopCode(item.id)}
                                  className="py-2.5 rounded-xl border border-red-500/30 text-red-400/80 text-xs font-bold hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-300 transition-all"
                                >
                                  Stop Code
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ── detail panel ── */}
                          {isDetailsOpen && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-[#080810] p-4">
                              {loadingClaims ? (
                                <p className="text-xs text-center text-white/40 py-4">Memuat data...</p>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                                    <span className="text-xs font-bold text-white/60">Total Claims:</span>
                                    <span className="text-sm font-black text-purple-400">{claims.length}</span>
                                  </div>
                                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {claims.length === 0 ? (
                                      <p className="text-xs text-center text-white/30 py-2">Belum ada yang claim.</p>
                                    ) : (
                                      claims.map((c) => (
                                        <div key={c.id} className="flex flex-col gap-1 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                          <p className="text-xs font-mono text-white/80">
                                            {maskAddress(c.wallet_address)}
                                          </p>
                                          <p className="text-[10px] text-white/40">
                                            {new Date(c.created_at).toLocaleDateString('en-GB')} • {new Date(c.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
