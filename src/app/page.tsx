'use client'

import { useEffect, useState } from 'react'
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import Stats from "@/components/Stats"
import EventCard from "@/components/EventCard"
import { supabase } from "@/lib/supabase"
import Footer from "@/components/Footer"

function getStatus(date: string, time: string) {
  if (!date || !time) return "UPCOMING"

  // FIX: Tambahkan "Z" agar di-parse sebagai UTC
  const start = new Date(`${date}T${time}Z`)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const now = new Date()

  if (now < start) return "UPCOMING"
  if (now >= start && now <= end) return "LIVE"
  return "ENDED"
}

function formatDate(date: string) {
  if (!date) return ""

  const d = new Date(date)

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatTime(time: string) {
  if (!time) return ""

  // Jika format time dari DB adalah "20:02:00", potong detik-nya opsional
  const shortTime = time.length > 5 ? time.substring(0, 5) : time
  return `${shortTime} UTC`
}

export default function Home() {
  const [events, setEvents] = useState<any[]>([])
  useEffect(() => {
  const alreadyRefreshed =
    sessionStorage.getItem('home_refreshed')

  if (!alreadyRefreshed) {
    sessionStorage.setItem(
      'home_refreshed',
      'true'
    )

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
}, [])

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("Events")
      .select("*")
      .order("id", { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setEvents(data || [])
  }

  useEffect(() => {
    loadEvents()

    const channel = supabase
      .channel("events-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Events",
        },
        () => {
          loadEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const sortedEvents = [...events].sort((a, b) => {
    const order: any = {
      LIVE: 1,
      UPCOMING: 2,
      ENDED: 3,
    }

    const aStatus = getStatus(
      a.event_date,
      a.event_time
    )

    const bStatus = getStatus(
      b.event_date,
      b.event_time
    )

    return order[aStatus] - order[bStatus]
  })

  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />
      <Hero />
      <Stats />

      <section className="max-w-7xl mx-auto px-6 pb-24">

        <div className="mb-12">

          <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-3">
            Community Events
          </p>

          <h2 className="text-4xl md:text-5xl font-bold">
            Explore Events
          </h2>

          <p className="text-zinc-500 mt-4 max-w-2xl">
            Join upcoming sessions, live communities, and collect attendance badges onchain.
          </p>

        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {sortedEvents.length > 0 ? (
            sortedEvents.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                id={Number(event.id)}
                title={event.title || "Untitled Event"}
                host={
                  event.host ||
                  event.creator_name ||
                  "Unknown Host"
                }
                status={getStatus(
                  event.event_date,
                  event.event_time
                )}
                date={formatDate(event.event_date)}
                time={formatTime(event.event_time)}
                image={event.image_url}
                region={event.region} 
              />
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-zinc-800 bg-zinc-950 p-14 text-center">

              <div className="text-5xl mb-5">
                🎟️
              </div>

              <p className="text-zinc-300 text-xl font-semibold">
                No Events Yet
              </p>

              <p className="text-zinc-500 mt-2">
                Be the first builder to launch a community event.
              </p>

            </div>
          )}

        </div>

<div className="mt-16 flex justify-center">

  <a
    href="/explore-event"
    className="
      w-[320px]
      py-5
      rounded-2xl
      flex items-center justify-center gap-3
      text-white
      font-bold
      text-lg
      bg-gradient-to-r
      from-[#8B2CF5]
      to-[#6D28FF]
      hover:from-[#9333EA]
      hover:to-[#7C3AED]
      transition-all duration-300
      shadow-[0_0_35px_rgba(139,44,245,0.35)]
      hover:scale-[1.02]
    "
  >

    <span>More Events</span>

    <span
      className="
        text-white
        text-xl
        transition-transform duration-300
        hover:translate-x-1
      "
    >
      →
    </span>

  </a>

</div>

</section>
	  
	  <Footer />

    </main>
  )
}
