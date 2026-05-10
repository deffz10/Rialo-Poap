'use client'

import ClaimBadgeButton from "./ClaimBadgeButton"

type EventCardProps = {
  id: number
  title: string
  host: string
  status: string 
  date: string
  time: string
  region?: string 
  image?: string
  claim_open?: boolean
  claim_expired_at?: string | null
}

export default function EventCard({
  id,
  title,
  host,
  status,
  date,
  time,
  region,
  image,
}: EventCardProps) {
  
  const isLiveNow = status === "LIVE" || status === "LIVE NOW"
  const isClosedEvent = status === "ENDED" || status === "CLOSED"

  return (
    <div className={`
      relative flex flex-col w-full max-w-md bg-[#0b0b13]/90 backdrop-blur-xl border transition-all duration-500 hover:-translate-y-1 group
      ${isClosedEvent ? 'opacity-80' : 'shadow-[0_10px_30px_rgba(0,0,0,0.4)]'}
      border-white/20 hover:border-purple-500/40 rounded-[24px] overflow-hidden
    `}>
      
      {/* BADGE STATUS */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        {isLiveNow ? (
          <span className="flex items-center gap-2 px-3 py-1 text-[9px] font-black bg-red-500/10 text-red-500 border border-red-500/20 rounded-full uppercase tracking-widest">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span> Live Now
          </span>
        ) : isClosedEvent ? (
          <span className="px-3 py-1 text-[9px] font-black bg-zinc-900 text-zinc-400 border border-white/20 rounded-full uppercase tracking-widest">
            Closed
          </span>
        ) : (
          <span className="flex items-center gap-2 px-3 py-1 text-[9px] font-black bg-amber-500/10 text-amber-500 border border-white/20 rounded-full uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Upcoming
          </span>
        )}
      </div>

      {/* IMAGE SECTION */}
      <div className="px-5 py-2">
        <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-white/10">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black">RIALO</div>
          )}
        </div>
      </div>

      {/* CONTENT SECTION DENGAN ICON BERWARNA */}
      <div className="flex flex-col p-5 pt-2 flex-grow">
        <h3 className="text-lg font-black text-white mb-4 line-clamp-1 uppercase">{title}</h3>

        <div className="grid grid-cols-2 gap-y-5 gap-x-2 mb-6">
          {/* DATE */}
          <div className="flex items-start gap-3">
            <span className="text-lg">📅</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Date</span>
              <span className="text-xs text-zinc-200 font-medium">{date}</span>
            </div>
          </div>

          {/* REGION */}
          <div className="flex items-start gap-3">
            <span className="text-lg">📍</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Region</span>
              <span className="text-xs text-zinc-200 font-medium">{region || "Global"}</span>
            </div>
          </div>

          {/* TIME */}
          <div className="flex items-start gap-3">
            <span className="text-lg">⏰</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Time</span>
              <span className="text-xs text-zinc-200 font-medium">{time}</span>
            </div>
          </div>

          {/* HOSTED */}
          <div className="flex items-start gap-3">
            <span className="text-lg">👤</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Hosted</span>
              {/* Class 'truncate' dan 'w-24' dihapus di bawah ini */}
              <span className="text-xs text-zinc-200 font-medium break-words pr-2">{host}</span>
            </div>
          </div>
        </div>

        <div className="w-full mt-auto">
          {isClosedEvent ? (
            <button disabled className="w-full py-3 bg-zinc-900/50 text-zinc-600 text-[10px] font-bold rounded-xl border border-white/5 cursor-not-allowed uppercase tracking-wider">
              The event has ended
            </button>
          ) : (
            <ClaimBadgeButton eventId={id} />
          )}
        </div>
      </div>
    </div>
  )
}