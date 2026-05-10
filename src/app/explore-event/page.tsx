'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // Tambahkan ini
import Navbar from "@/components/Navbar"

/* ── MODAL CLAIM CODE ── */
function ClaimModal({ 
  isOpen, 
  onClose, 
  eventTitle, 
  eventId 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  eventTitle: string,
  eventId: number | null 
}) {
  const [code, setCode] = useState('')
  const router = useRouter()

  if (!isOpen) return null

 const handleClaim = async () => {
  if (!code.trim()) {
    alert("Please enter the event code")
    return
  }

  const inputCode = code.trim().toUpperCase()

  const { data, error } = await supabase
    .from('Events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !data) {
    alert('Event not found')
    return
  }

  if (!data.claim_open) {
    alert('Claim code not opened yet')
    return
  }

  if (data.claim_code !== inputCode) {
    alert('Invalid code')
    return
  }

  const now = new Date()
  const expire = new Date(data.claim_expired_at)

  if (now > expire) {
    alert('Code expired')
    return
  }

  onClose()

  router.push(`/claim/${eventId}`)
}

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[24px] pointer-events-none">
      <div className="relative z-10 pointer-events-auto w-full max-w-[400px] bg-[#0b0b13] border border-zinc-700 rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        <h2 className="text-2xl font-black text-white mb-2 italic uppercase tracking-tight">Enter Event Code</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">For {eventTitle}</p>
        
        <input 
          type="text" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Xxx Xxx Xxx" 
          className="w-full bg-[#16161e] border border-zinc-700 rounded-2xl py-5 px-6 text-white text-center text-lg font-black tracking-[0.2em] focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-800 mb-8 uppercase"
        />

        <button 
          onClick={handleClaim}
          className="w-full py-5 bg-[#8b3dff] hover:bg-[#7a2df2] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-purple-600/20 active:scale-95"
        >
          Claim Now
        </button>
      </div>
    </div>
  )
}

export default function ExploreEventPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All Regions')
  // Update state modal untuk menyimpan ID event juga
  const [modal, setModal] = useState({ open: false, title: '', id: null as number | null })

  const staticRegions = [
    'All Regions', 'Global', 'Africa', 'Arab', 'Bangladesh', 'Brazil', 
    'China', 'India', 'Indonesia', 'Pakistan', 'Russia', 
    'South Korea', 'Thailand', 'Turkey', 'Ukraine', 'Vietnam'
  ]

  useEffect(() => {
    async function getEvents() {
      const { data } = await supabase
        .from('Events')
        .select('*')
        .order('event_date', { ascending: false })
      if (data) setEvents(data)
      setLoading(false)
    }
    getEvents()
  }, [])

  const filtered = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase())
    const matchesRegion = selectedRegion === 'All Regions' || e.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
	
	<Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-black italic tracking-[-0.05em] uppercase leading-[0.85] whitespace-nowrap">
                Explore <span className="text-purple-500">Event</span>
              </h1>
              <p className="text-zinc-400 text-sm font-bold mt-6 tracking-wide max-w-sm uppercase">
                Find exclusive on-chain experiences and claim your reputation badges.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 w-full md:w-[400px]">
            <div className="flex justify-end w-full">
              <div className="relative">
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="appearance-none bg-[#0b0b13] border border-zinc-700 rounded-xl px-6 py-3.5 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-purple-500 transition-all cursor-pointer pr-10"
                >
                  {staticRegions.map(reg => (
                    <option key={reg} value={reg} className="bg-[#0b0b13]">{reg}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>


            </div>

            <div className="relative w-full">
              <input 
                type="text"
                placeholder="SEARCH EVENT OR HOST..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0b0b13] border border-zinc-700 rounded-2xl px-8 py-5 text-xs font-bold tracking-widest focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-800"
              />
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-[550px] rounded-[24px] bg-[#0b0b13] border border-zinc-700 animate-pulse" />)
          ) : filtered.length > 0 ? (
            filtered.map((event) => {
              const start = new Date(`${event.event_date}T${event.event_time}Z`)
              const isEnded = new Date() > new Date(start.getTime() + 2 * 60 * 60 * 1000)
              const isLive = new Date() >= start && !isEnded

              return (
                <div key={event.id} className="relative flex flex-col w-full bg-[#0b0b13] border border-zinc-700 rounded-[24px] overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-purple-500 group shadow-2xl shadow-black/50">
                  
                  <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                    {!isEnded ? (
                      <span className={`flex items-center gap-2 px-3 py-1 text-[9px] font-black border rounded-full uppercase tracking-widest ${isLive ? 'bg-red-500/10 text-red-500 border-red-500/40' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40'}`}>
                        <span className="relative flex h-1.5 w-1.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isLive ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                        </span>
                        {isLive ? 'Live Now' : 'Upcoming'}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-[9px] font-black bg-zinc-900/50 text-zinc-500 border border-zinc-700 rounded-full uppercase tracking-widest">
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="px-5 py-2">
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-700">
                      <img src={event.image_url} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20" />
                      <img src={event.image_url} alt={event.title} className="relative z-10 w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  </div>

                  <div className="flex flex-col p-5 pt-2 flex-grow">
                    <h3 className="text-lg font-black text-white tracking-tight mb-4 group-hover:text-purple-400 transition-colors duration-300 line-clamp-1 uppercase">
                      {event.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-5">
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5">📅</span>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-tighter font-bold text-zinc-500">Date</span>
                          <span className="text-xs font-bold text-zinc-200">{new Date(event.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5">📍</span>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-tighter font-bold text-zinc-500">Region</span>
                          <span className="text-xs font-bold text-zinc-200">{event.region || 'Global'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5">⏰</span>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-tighter font-bold text-zinc-500">Time</span>
                          <span className="text-xs font-bold text-zinc-200">{event.event_time} UTC</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5">👤</span>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-tighter font-bold text-zinc-500">Hosted</span>
                          <span className="text-xs font-bold text-zinc-200 line-clamp-1">{event.creator_name || 'Rialo Host'}</span>
                        </div>
                      </div>
                    </div>

<ClaimModal 
  isOpen={modal.open && modal.id === event.id}
  onClose={() => setModal({ open: false, title: '', id: null })}
  eventTitle={modal.title}
  eventId={modal.id}
/>

                    <div className="w-full mt-auto">
                      {isEnded ? (
                        <button disabled className="w-full py-4 bg-zinc-900/40 text-zinc-600 text-[10px] font-black rounded-xl border border-zinc-700 cursor-not-allowed uppercase tracking-widest">
                          The event has ended
                        </button>
                      ) : (
                        <button 
                          onClick={() => setModal({ open: true, title: event.title, id: event.id })}
                          className="w-full py-4 bg-[#8b3dff] hover:bg-[#7a2df2] text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-purple-600/30 active:scale-95"
                        >
                          Claim Badge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-[24px]">
              <p className="text-zinc-600 font-black uppercase tracking-widest text-xs italic">No events found for this region</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}