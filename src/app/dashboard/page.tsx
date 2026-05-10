'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

/* ─── 14 REGIONS + GLOBAL ─── */
const REGIONS = [
  'Africa', 'Arab', 'Bangladesh', 'Brazil', 'China', 
  'India', 'Indonesia', 'Pakistan', 'Russia', 'South Korea', 
  'Thailand', 'Turkey', 'Ukraine', 'Vietnam', 'Global'
]

/* ─── helpers ─── */
function getStatus(date: string, time: string) {
  if (!date || !time) return 'UPCOMING'
  
  const start = new Date(`${date}T${time}:00Z`)
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
  return `${time} (UTC)`
}

function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'RIALO-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}


/* ─── status badge ─── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'LIVE')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        Live
      </span>
    )
  if (status === 'UPCOMING')
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Upcoming
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-800/80 text-zinc-400 border border-white/20 uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
      Ended
    </span>
  )
}

/* ─── main page ─── */
export default function DashboardPage() {
  const { address } = useAccount()
  
  // FIX: Anti-Hydration Mismatch state
  const [mounted, setMounted] = useState(false)

  /* ── create event state ── */
  const [title, setTitle] = useState('')
  const [host, setHost] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('Global') 
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
  const [editRegion, setEditRegion] = useState('Global') 

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

  /* ── Effects ── */
  useEffect(() => {
    setMounted(true) // Memastikan komponen sudah di client
    
    const now = new Date()
    const utcDate = now.toISOString().split('T')[0]
    const utcTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
    setDate(utcDate)
    setTime(utcTime)
  }, [])

  useEffect(() => { 
    if (address && mounted) loadEvents() 
  }, [address, mounted])

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
  }, [secondsLeft, openCodeId])

  /* ── Functions ── */
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
      const { error } = await supabase.from('Events').insert([
        {
          title,
          event_date: date,
          event_time: time,
          image_url: imageUrl,
          creator_wallet: address,
          creator_name: host,
          claim_code: secret,
          claim_open: false,
          claim_expired_at: null,
          region: selectedRegion
        },
      ])

      if (error) { alert(error.message); return }

      setTitle(''); setHost(''); setSelectedRegion('Global')
      setImage(null); setPreviewUrl(null)
      
      const now = new Date()
      setDate(now.toISOString().split('T')[0])
      setTime(`${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`)
      
      alert('Event Created Successfully!')
      loadEvents()
    } catch (err: any) {
      alert(err?.message || 'Failed create event')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(item: any) {
    setEditingId(item.id)
    setEditTitle(item.title || '')
    setEditHost(item.creator_name || '')
    setEditDate(item.event_date || '')
    setEditTime(item.event_time || '')
    setEditRegion(item.region || 'Global')
  }

  async function saveEdit(id: number) {
    const { error } = await supabase
      .from('Events')
      .update({
        title: editTitle,
        creator_name: editHost,
        event_date: editDate,
        event_time: editTime,
        region: editRegion
      })
      .eq('id', id)
    if (error) alert(error.message)
    else {
      setEditingId(null)
      loadEvents()
    }
  }

  async function deleteEvent(id: number) {
    if (!confirm('Delete event?')) return
    await supabase.from('Events').delete().eq('id', id)
    loadEvents()
  }

  async function openCode(item: any) {
    const newCode = generateSecret()
    const expire = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    await supabase
      .from('Events')
      .update({
        claim_open: true,
        claim_code: newCode,
        claim_expired_at: expire,
      })
      .eq('id', item.id)
    setOpenCodeId(item.id)
    setClaimCode(newCode)
    setSecondsLeft(900)
    loadEvents()
  }

  async function stopCode(id: number) {
    await supabase.from('Events').update({ claim_open: false }).eq('id', id)
    setOpenCodeId(null)
    setClaimCode('')
    setSecondsLeft(0)
    loadEvents()
  }

  async function copyCode() {
  await navigator.clipboard.writeText(claimCode)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

async function copyParticipants() {
  if (claims.length === 0) return

  const rows = claims.map((c) => {
    return [
      c.discord_name || '-',
      c.discord_username || '-'
    ].join('\t')
  })

  const header =
    'Discord Name\tDiscord Username'

  const finalText =
    [header, ...rows].join('\n')

  await navigator.clipboard.writeText(finalText)

  alert('Participant data copied!')
}

  async function toggleDetails(eventId: number) {
    if (openDetailId === eventId) {
      setOpenDetailId(null)
      return
    }
    setOpenDetailId(eventId)
    setLoadingClaims(true)
    
    const { data } = await supabase
      .from('ClaimHistory')
      .select('*')
      .eq('event_id', eventId)
      .order('claimed_at', { ascending: false })

    setClaims(data || [])
    setLoadingClaims(false)
  }

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

  // Mencegah render konten yang bergantung pada waktu sebelum mounted
  if (!mounted) return <div className="min-h-screen bg-[#06060a]" />

  return (
   <>	
	<Navbar />
	
    <main className="min-h-screen bg-[#06060a] text-white font-sans">
	
      <div className="flex flex-col md:flex-row md:h-[calc(100vh-80px)] max-w-[1400px] mx-auto px-14">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-full md:w-[320px] md:shrink-0 border border-white/10 rounded-3xl bg-[#0e0e18] shadow-[0_0_40px_rgba(139,92,246,0.05)] h-fit mt-4">
  <div className="p-7 pt-0">
            <div className="mb-6 mt-2">
              <h1 className="text-[22px] font-black text-white tracking-wide mb-8">Event Dashboard</h1>
              <p className="text-[9px] font-extrabold tracking-[0.25em] text-purple-400/80 uppercase mb-1.5">New Experience</p>
              <h2 className="text-2xl font-extrabold text-white leading-tight">Create Event</h2>
            </div>

            <div className="space-y-3">
              <label className="block cursor-pointer group">
                <div className={`w-full h-[120px] rounded-2xl border-2 border-dashed transition-all overflow-hidden ${previewUrl ? 'border-purple-500/60' : 'border-white/20 hover:border-white/30 bg-white/[0.02]'}`}>
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/25"><span className="text-xs font-semibold">Upload Banner</span></div>}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" className="w-full rounded-xl bg-white/[0.04] border border-white/20 focus:border-purple-500/60 focus:outline-none px-4 py-3 text-sm transition-all placeholder:text-white/20" />
              <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="Host Name" className="w-full rounded-xl bg-white/[0.04] border border-white/20 focus:border-purple-500/60 focus:outline-none px-4 py-3 text-sm transition-all placeholder:text-white/20" />
              
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full rounded-xl bg-[#0c0c14] border border-white/20 focus:border-purple-500/60 focus:outline-none px-4 py-3 text-sm transition-all text-white/60"
              >
                {REGIONS.map(r => (
                  <option key={r} value={r} className="bg-[#0c0c14]">{r}</option>
                ))}
              </select>

              <div className="flex flex-col sm:flex-row gap-2">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 rounded-xl bg-white/[0.04] border border-white/20 focus:border-purple-500/60 focus:outline-none px-4 py-3 text-[13px] transition-all [color-scheme:dark]" />
                
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/20 rounded-xl px-3 focus-within:border-purple-500/60 transition-all">
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    className="w-full bg-transparent focus:outline-none text-[13px] [color-scheme:dark] cursor-pointer py-3" 
                  />
                  <span className="text-[9px] font-bold text-white uppercase tracking-tighter shrink-0">UTC</span>
                </div>
              </div>

              <button onClick={handleCreate} disabled={creating} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 py-3 text-sm font-bold shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all mt-2 disabled:opacity-50">
                {creating ? 'Creating...' : '+ Create Event'}
              </button>
            </div>
          </div>
        </aside>

        {/* ── RIGHT SIDE ── */}
        <section className="flex-1 md:h-[calc(100vh-80px)]  md:overflow-y-auto px-6 md:px-10 py-4 md:pt-2">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">My Events</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {events.map((item) => {
                const status = getStatus(item.event_date, item.event_time)
                const isEditing = editingId === item.id
                const isCodeOpen = openCodeId === item.id && secondsLeft > 0
                const isDetailsOpen = openDetailId === item.id

                return (
                  <div key={item.id} className="group rounded-3xl overflow-hidden border border-white/20 bg-[#0e0e18] hover:border-white/40 transition-all shadow-xl shadow-black/40 flex flex-col">
                    {/* Event Banner */}
                    <div className="relative h-44 overflow-hidden bg-zinc-900">
                      {item.image_url ? (
                        <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="event banner" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🎪</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e18] to-transparent opacity-60" />
                      {!isEditing && (
                        <button onClick={() => startEdit(item)} className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-[10px] font-bold hover:bg-white/10 transition-colors uppercase tracking-widest">
                          Edit
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className="w-full bg-white/[0.04] border border-white/20 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                          <input value={editHost} onChange={(e) => setEditHost(e.target.value)} placeholder="Host" className="w-full bg-white/[0.04] border border-white/20 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                          
                          <select 
                            value={editRegion} 
                            onChange={(e) => setEditRegion(e.target.value)}
                            className="w-full bg-[#0c0c14] border border-white/20 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm outline-none transition-all text-white"
                          >
                            {REGIONS.map(r => (
                              <option key={r} value={r} className="bg-[#0c0c14]">{r}</option>
                            ))}
                          </select>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="flex-1 bg-white/[0.04] border border-white/20 focus:border-purple-500/60 rounded-xl px-3 py-2.5 text-[13px] [color-scheme:dark] outline-none transition-all" />
                            
                            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/20 rounded-xl px-3 focus-within:border-purple-500/60 transition-all">
                              <input 
                                type="time" 
                                value={editTime} 
                                onChange={(e) => setEditTime(e.target.value)} 
                                className="w-full bg-transparent focus:outline-none text-[13px] [color-scheme:dark] cursor-pointer py-2.5" 
                              />
                              <span className="text-[8px] font-bold text-white uppercase">UTC +0</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => saveEdit(item.id)} className="py-2.5 rounded-xl bg-violet-600 text-xs font-bold hover:bg-violet-500 transition-colors">Save</button>
                            <button onClick={() => setEditingId(null)} className="py-2.5 rounded-xl border border-white/20 text-xs font-bold hover:bg-white/5 transition-colors">Cancel</button>
                          </div>
                          <button onClick={() => deleteEvent(item.id)} className="w-full py-2.5 text-red-400 text-[10px] font-bold border border-red-500/40 rounded-xl hover:bg-red-500/10 transition-colors uppercase tracking-widest">Delete Event</button>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3 flex justify-between items-start">
                            <StatusBadge status={status} />
                            <span className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-bold text-purple-400 uppercase tracking-widest border border-white/20">📍 {item.region || 'Global'}</span>
                          </div>
                          <h2 className="text-[17px] font-extrabold mb-3 text-white line-clamp-1 tracking-tight">{item.title}</h2>
                          <div className="space-y-1.5 mb-5 text-[11px] font-medium text-white/50 uppercase tracking-wider">
                            <p className="flex items-center gap-2"><span className="text-sm">📅</span> {formatDate(item.event_date)}</p>
                            <p className="flex items-center gap-2"><span className="text-sm">⏰</span> {formatTime(item.event_time)}</p>
                            <p className="flex items-center gap-2"><span className="text-sm">👤</span> {item.creator_name}</p>
                          </div>

                          <div className="mt-auto space-y-2">
                            <button onClick={() => openCode(item)} className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/20 transition-all active:scale-[0.98] uppercase tracking-widest">
                              {isCodeOpen ? '↻ Regenerate Code' : 'Open Claim Code'}
                            </button>
                            <button onClick={() => toggleDetails(item.id)} className="w-full py-2.5 rounded-2xl border border-white/20 text-[10px] font-bold hover:bg-white/5 transition-colors uppercase tracking-widest text-white/40">
                              {isDetailsOpen ? 'Close Details' : 'View Participants'}
                            </button>
                          </div>

                          {/* Code Display Area */}
                          {isCodeOpen && (
                            <div className="mt-4 p-4 rounded-2xl border border-purple-500/40 bg-purple-500/5 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                              <p className="text-2xl font-black text-violet-300 tracking-[0.2em] font-mono">{claimCode}</p>
                              <p className="text-[9px] mt-2 text-white/40 uppercase font-bold tracking-[0.1em]">Expires in {minutes}:{seconds.toString().padStart(2, '0')}</p>
                              <div className="flex gap-2 mt-3">
                                <button onClick={copyCode} className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase transition-colors border border-white/10">{copied ? 'Copied!' : 'Copy Code'}</button>
                                <button onClick={() => stopCode(item.id)} className="flex-1 py-2 border border-red-500/30 rounded-xl text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-colors uppercase">Stop</button>
                              </div>
                            </div>
                          )}

                          {/* Participants Details */}
                          {isDetailsOpen && (
                            <div className="mt-4 p-4 rounded-2xl border border-white/20 bg-[#080810] animate-in fade-in duration-300">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-white/20 pb-2">
                                <span className="text-white/30">Total Claims</span>
                                <div className="flex items-center gap-2">
  <span className="text-purple-400">
    {claims.length}
  </span>

  {claims.length > 0 && (
    <button
      onClick={copyParticipants}
      className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[9px] text-white font-bold transition-all"
    >
      Copy Data
    </button>
  )}
</div>
                              </div>
                              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                {loadingClaims ? (
                                  <p className="text-center text-[10px] text-white/20 py-4 uppercase font-bold tracking-widest">Loading data...</p>
                                ) : claims.length === 0 ? (
                                  <p className="text-center text-[10px] text-white/20 py-4 uppercase font-bold tracking-widest">No claims yet</p>
                                ) : (
                                  claims.map((c) => (
                                    <div key={c.id} className="p-2.5 bg-white/[0.02] border border-white/20 rounded-xl flex justify-between items-center group/item hover:border-white/30 transition-all">
  <div className="flex flex-col">
  <p className="text-[10px] text-purple-300">
    {c.discord_name || '-'}
  </p>

  <p className="text-[9px] text-white/40 font-mono">
    @{c.discord_username || '-'}
  </p>
</div>
                                      <span className="text-[8px] text-white/20 uppercase font-bold">{new Date(c.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  ))
                                )}
                              </div>
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
	</>
  )
}