'use client'

import { useEffect, useState, useRef } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const { address } = useAccount()

  const [joinedEvents, setJoinedEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* PROFILE */
  const [profileName, setProfileName] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const [discordNameInput, setDiscordNameInput] = useState('')
  const [discordInput, setDiscordInput] = useState('')
  const [xInput, setXInput] = useState('')
  const [telegramInput, setTelegramInput] = useState('')

  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [nameInput, setNameInput] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '0x000...0000'

  /* =========================
     POINT & LEVEL
  ========================= */

  const pointsPerBadge = 20
  const totalPoints = joinedEvents.length * pointsPerBadge

  const currentLevel = Math.floor(totalPoints / 100) + 1
  const nextLevelPoints = 100 - (totalPoints % 100)
  const progressPercent = totalPoints % 100

  /* =========================
     LOAD PROFILE
  ========================= */

  useEffect(() => {
    async function fetchProfile() {
      if (!address) return

      const wallet = address.toLowerCase()

      const { data } = await supabase
        .from('Profiles')
        .select('*')
        .eq('wallet', wallet)
        .single()

      if (data) {
        setProfileName(data.name || '')
        setProfileImage(data.image_url || null)

        setDiscordNameInput(data.discord_name || '')
        setDiscordInput(data.discord_username || '')
        setXInput(data.x_username || '')
        setTelegramInput(data.telegram_username || '')
      } else {
        const saved = localStorage.getItem(`rialo_profile_${wallet}`)

        if (saved) {
          const parsed = JSON.parse(saved)

          setProfileName(parsed.name || '')
          setProfileImage(parsed.image || null)
        }
      }
    }

    fetchProfile()
  }, [address])

  /* =========================
     LOAD BADGES
  ========================= */

  useEffect(() => {
    if (address) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [address])

  async function loadProfile() {
    setLoading(true)

    if (!address) {
      setLoading(false)
      return
    }

    const wallet = address.toLowerCase()

    const { data: joined } = await supabase
      .from('ClaimHistory')
      .select('*')
      .ilike('wallet', wallet)
      .order('id', { ascending: false })

    setJoinedEvents(joined || [])

    setLoading(false)
  }

  /* =========================
     SAVE PROFILE
  ========================= */

  async function handleSaveProfile() {
    try {
      setSavingProfile(true)

      if (!address) return

      const wallet = address.toLowerCase()

      localStorage.setItem(
        `rialo_profile_${wallet}`,
        JSON.stringify({
          name: nameInput,
          image: profileImage
        })
      )

      const { error } = await supabase
        .from('Profiles')
        .upsert(
          {
            wallet,

            name: nameInput,

            image_url: profileImage,

            discord_name: discordNameInput,

            discord_username: discordInput,

            x_username: xInput,

            telegram_username: telegramInput,

            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'wallet'
          }
        )

      if (error) throw error

      setProfileName(nameInput)

      setEditingProfile(false)
    } catch (err) {
      console.log(err)
      alert('Failed save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  /* =========================
     IMAGE UPLOAD
  ========================= */

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]

    if (!file || !address) return

    try {
      setSavingProfile(true)

      const wallet = address.toLowerCase()

      const ext = file.name.split('.').pop()

      const fileName = `${wallet}-${Date.now()}.${ext}`

      const filePath = `avatars/${fileName}`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (error) throw error

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfileImage(data.publicUrl)
    } catch (err) {
      console.log(err)
      alert('Upload failed')
    } finally {
      setSavingProfile(false)
    }
  }

  function handleRemovePhoto() {
    setProfileImage(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayName = profileName || shortAddress

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            #fff 0%,
            #c084fc 30%,
            #ffffff 60%,
            #a855f7 100%
          );

          background-size: 200% auto;

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          animation: shimmer 6s linear infinite;
        }

        .floating-avatar {
          animation: float 5s ease-in-out infinite;
        }

        .card-hover {
          transition: 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 0 40px rgba(168,85,247,0.2);
        }
      `}</style>

      <main className="min-h-screen bg-[#05050a] text-white overflow-hidden">
        <Navbar />

        {/* BACKGROUND */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px]" />

          <div className="absolute bottom-[-10%] right-[0%] w-[500px] h-[500px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 py-8 space-y-8">

{/* HERO */}
<section className="max-w-[1240px] mx-auto rounded-[32px] border border-[#5b3df5]/20 bg-[#05050b]/95 backdrop-blur-2xl overflow-hidden shadow-[0_0_80px_rgba(91,61,245,0.08)]">

  <div className="relative p-7 md:p-10">

    {/* glow */}
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="absolute top-[-120px] left-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="absolute bottom-[-120px] right-[0%] w-[350px] h-[350px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
    </div>

    <div className="relative z-10 flex flex-col xl:flex-row items-start justify-between gap-10">

      {/* LEFT */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

        {/* AVATAR */}
        <div className="relative floating-avatar">

          {/* hex border */}
          <div className="relative w-[150px] h-[170px] flex items-center justify-center">

            <div
              className="absolute inset-0 bg-gradient-to-b from-purple-400 to-[#4f46e5]"
              style={{
                clipPath:
                  'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0% 50%)'
              }}
            />

            <div
              className="absolute inset-[3px] bg-[#0b0b12]"
              style={{
                clipPath:
                  'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0% 50%)'
              }}
            />

            <div
              className="absolute inset-[6px] overflow-hidden"
              style={{
                clipPath:
                  'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0% 50%)'
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a25] to-[#111] flex items-center justify-center">
                  <span className="text-6xl font-black text-white/30">
                    {displayName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* level */}
            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 px-4 h-7 rounded-full border border-purple-400/50 bg-black flex items-center justify-center text-[11px] font-black shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              LVL {currentLevel}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="pt-2 space-y-5">

          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-purple-400 font-bold mb-2">
              Rialo Verified Identity
            </p>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none">
              <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>

            <div className="flex items-center gap-2 mt-3">
              <span className="font-mono text-white/50 text-sm">
                {shortAddress}
              </span>

              <div className="w-5 h-5 rounded-full border border-purple-500/40 bg-purple-500/20 flex items-center justify-center text-[10px]">
                ✓
              </div>
            </div>
          </div>

          {/* BADGES */}
          <div className="flex items-center flex-wrap gap-3">

            <div className="h-10 px-4 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Verified Attendee
            </div>

            <div className="h-10 px-4 rounded-full border border-yellow-500/20 bg-yellow-500/10 flex items-center gap-2 text-sm font-bold text-yellow-300">
              ★ Early Supporter
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingProfile(true)
                setNameInput(profileName)
              }}
              className="h-10 px-5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all text-sm font-bold"
            >
              Edit Profile
            </button>
          </div>

          {/* SOCIAL */}
          <div className="flex items-center gap-4 pt-1">

            {discordInput && (
              <a
                href={`https://discord.com/users/${discordInput}`}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-all"
              >
                <img
                  src="https://cdn.simpleicons.org/discord/ffffff"
                  className="w-7 h-7"
                />
              </a>
            )}

            {xInput && (
              <a
                href={`https://x.com/${xInput.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 fill-current"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.473l8.6-9.83L0 1.154h7.594l5.243 6.932L18.9 1.153Z"/>
                </svg>
              </a>
            )}

            {telegramInput && (
              <a
                href={`https://t.me/${telegramInput.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-all"
              >
                <img
                  src="https://cdn.simpleicons.org/telegram/ffffff"
                  className="w-5 h-5"
                />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="w-full max-w-[360px] rounded-[28px] border border-purple-500/10 bg-gradient-to-br from-[#0d0d16] to-[#11111d] p-6 shadow-[0_0_50px_rgba(124,58,237,0.12)]">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/40 font-bold">
              Total Points
            </p>

            <div className="flex items-end gap-2 mt-3">
              <h2 className="text-7xl font-black leading-none">
                {totalPoints}
              </h2>

              <span className="text-purple-300 font-black mb-2">
                PTS
              </span>
            </div>
          </div>

          <div className="relative w-20 h-24 flex items-center justify-center">

            <div
              className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-indigo-500/20"
              style={{
                clipPath:
                  'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0% 50%)'
              }}
            />

            <div
              className="absolute inset-[2px] bg-[#151525]"
              style={{
                clipPath:
                  'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0% 50%)'
              }}
            />

            <span className="relative z-10 text-yellow-300 text-2xl">
              ★
            </span>
          </div>
        </div>

        <div className="mt-7">
          <div className="w-full h-[6px] rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-400"
              style={{
                width: `${progressPercent}%`
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold">
              Next Level: {nextLevelPoints} pts
            </span>

            <span className="text-[11px] font-black text-purple-300">
              LVL {currentLevel}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* BOTTOM INFO */}
    <div className="mt-10 pt-8 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-5">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
          ⭐
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-bold">
            Reputation Rank
          </p>

          <h3 className="font-black text-white">
            Explorer
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-black">
          ID
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-bold">
            On-chain ID
          </p>

          <h3 className="font-black text-white">
            {shortAddress}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
          🌐
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-bold">
            Network
          </p>

          <h3 className="font-black text-white">
            Base Sepolia
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          ✓
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-bold">
            Status
          </p>

          <h3 className="font-black text-emerald-400">
            Active
          </h3>
        </div>
      </div>

    </div>
  </div>
</section>

          {/* CONTENT */}
          <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">

            {/* BADGES */}
            <div className="rounded-[28px] border border-white/10 bg-[#0b0b12]/90 p-6">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black">
                    Badge Collection
                  </h2>

                  <p className="text-white/50 mt-1">
                    On-chain Proof
                  </p>
                </div>

                <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-black">
                  {joinedEvents.length} BADGES
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">

                {!loading &&
                  joinedEvents.map((item, index) => (
                    <div
                      key={item.id}
                      className="card-hover rounded-[24px] overflow-hidden border border-white/10 bg-[#09090f]"
                    >
                      <div className="relative aspect-[16/10]">

                        <img
                          src={item.image_url}
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute top-3 left-3 bg-black/80 border border-white px-2 py-1 rounded-lg text-[10px] font-black">
                          #{index + 1}
                        </div>

                        <div className="absolute top-3 right-3 bg-emerald-500 text-black px-3 py-1 rounded-lg text-[10px] font-black">
                          ✓ VERIFIED
                        </div>
                      </div>

                      <div className="p-5 space-y-4">

                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-black">
                            {item.title}
                          </h3>

                          <div className="bg-purple-500 px-3 py-1 rounded-lg text-xs font-black">
                            +20 PTS
                          </div>
                        </div>

                        <div className="flex gap-4 text-sm text-white/60">
                          <span>📅 {item.event_date}</span>
                          <span>⏰ {item.event_time}</span>
                        </div>

                        <div className="pt-4 border-t border-white/10">

                          <div className="inline-flex px-3 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
                            Proof of Attendance
                          </div>

                          {item.tx_hash && (
                            <a
                              href={`https://sepolia.basescan.org/tx/${item.tx_hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 block text-xs font-mono text-white/60 hover:text-white transition-all"
                            >
                              TX: {item.tx_hash.slice(0, 10)}...
                              {item.tx_hash.slice(-8)} ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              {/* STATS */}
              <div className="rounded-[28px] border border-white/10 bg-[#0b0b12]/90 p-6">

                <h3 className="text-2xl font-black mb-6">
                  Stats Overview
                </h3>

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                    <h4 className="text-4xl font-black">
                      {joinedEvents.length}
                    </h4>

                    <p className="text-xs uppercase tracking-widest text-white/50 mt-2">
                      Badges
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                    <h4 className="text-4xl font-black">
                      {totalPoints}
                    </h4>

                    <p className="text-xs uppercase tracking-widest text-white/50 mt-2">
                      Total Points
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                    <h4 className="text-4xl font-black">
                      {joinedEvents.length}
                    </h4>

                    <p className="text-xs uppercase tracking-widest text-white/50 mt-2">
                      Events
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                    <h4 className="text-4xl font-black">
                      {currentLevel}
                    </h4>

                    <p className="text-xs uppercase tracking-widest text-white/50 mt-2">
                      Level
                    </p>
                  </div>

                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="rounded-[28px] border border-white/10 bg-[#0b0b12]/90 p-6">

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black">
                    Recent Activity
                  </h3>

                  <button className="text-sm text-white/50 hover:text-white transition-all">
                    View All
                  </button>
                </div>

                <div className="space-y-4">

                  {joinedEvents.length > 0 ? (
                    joinedEvents.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-all"
                      >
                        <div className="flex items-center gap-4">

                          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">
                            🏅
                          </div>

                          <div>
                            <p className="font-bold text-sm text-white">
                              Earned badge "{item.title}"
                            </p>

                            <p className="text-xs text-white/40 mt-1">
                              {item.event_date} · {item.event_time}
                            </p>
                          </div>

                        </div>

                        <div className="text-purple-300 font-black text-sm">
                          +20 PTS
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                      <p className="text-white/40 text-sm">
                        No recent activity yet
                      </p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </section>

          {/* EDIT MODAL */}
          {editingProfile && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-5">

              <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0c0c14] p-8">

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">
                    Edit Profile
                  </h2>

                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="text-3xl text-white/40 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">

                  {/* IMAGE */}
                  <div className="flex flex-col items-center gap-4">

                    <div className="w-28 h-28 rounded-[24px] overflow-hidden border border-white/10 bg-white/5">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/20">
                          ?
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 w-full">

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 h-11 rounded-xl bg-white text-black font-black hover:bg-purple-300 transition-all"
                      >
                        Upload
                      </button>

                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="flex-1 h-11 rounded-xl border border-red-500 text-red-400 font-black hover:bg-red-500 hover:text-white transition-all"
                        >
                          Remove
                        </button>
                      )}

                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* INPUT */}
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Profile Name"
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-purple-500"
                  />

                  <input
                    value={discordNameInput}
                    onChange={(e) =>
                      setDiscordNameInput(e.target.value)
                    }
                    placeholder="Discord Profile Name"
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-purple-500"
                  />

                  <input
                    value={discordInput}
                    onChange={(e) =>
                      setDiscordInput(e.target.value)
                    }
                    placeholder="Discord Username"
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-purple-500"
                  />

                  <input
                    value={xInput}
                    onChange={(e) => setXInput(e.target.value)}
                    placeholder="X Username"
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-purple-500"
                  />

                  <input
                    value={telegramInput}
                    onChange={(e) =>
                      setTelegramInput(e.target.value)
                    }
                    placeholder="Telegram Username"
                    className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-purple-500"
                  />

                  {/* SAVE */}
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all font-black mt-4"
                  >
                    {savingProfile
                      ? 'Saving...'
                      : 'Save Profile'}
                  </button>

                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}