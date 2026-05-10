'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import {
  claimBadge,
  hasUserClaimed,
} from '@/lib/contract'
import { supabase } from '@/lib/supabase'

export default function ClaimPage({
  params,
}: any) {
  const { address, isConnected } =
    useAccount()

  const [loading, setLoading] =
    useState(false)

  const [checking, setChecking] =
    useState(true)

  const [claimed, setClaimed] =
    useState(false)

  const [event, setEvent] =
    useState<any>(null)
	
  const [profile, setProfile] =
    useState<any>(null)

  useEffect(() => {
    loadEvent()
  }, [])

  useEffect(() => {
    if (event && address) {
      checkClaimed()
    } else {
      setChecking(false)
    }
  }, [event, address])
  
  useEffect(() => {
  if (address) {
    loadProfile()
  }
 }, [address])

  async function loadEvent() {
  const { data } = await supabase
    .from('Events')
    .select('*')
    .eq('id', params.id)
    .single()

  setEvent(data)
}

async function loadProfile() {
  if (!address) return

  const { data } = await supabase
  .from('Profiles')
  .select(`
    name,
    discord_name,
    discord_username,
    x_username,
    telegram_username
  `)
  .eq('wallet', address?.toLowerCase())
  .single()
  console.log('PROFILE DATA:', data)
  console.log('ADDRESS:', address?.toLowerCase())

setProfile(data)
}

async function checkClaimed() {
    try {
      setChecking(true)

      const already =
  await hasUserClaimed(
    Number(params.id),
    address ?? ''
  )

      setClaimed(already)
    } catch (err) {
      console.log(err)
    } finally {
      setChecking(false)
    }
  }

async function handleClaim() {
  try {
    setLoading(true)

    /* Mint Onchain */
    const tx =
      await claimBadge(
        Number(event.id),
        event.image_url || '',
        0
      )

    /* Get latest profile */
    const { data: latestProfile } =
      await supabase
        .from('Profiles')
        .select(`
          name,
          discord_name,
          discord_username,
          x_username,
          telegram_username
        `)
        .eq('wallet', address?.toLowerCase())
        .single()

    /* Save Claim History */
    const { error } =
      await supabase
        .from('ClaimHistory')
        .insert([
          {
            wallet: address,

            event_id:
              event.id,

            title:
              event.title,

            image_url:
              event.image_url,

            event_date:
              event.event_date,

            event_time:
              event.event_time,

            tx_hash: tx,

            profile_name:
              latestProfile?.name || null,

            discord_name:
              latestProfile?.discord_name || null,

            discord_username:
              latestProfile?.discord_username || null,

            x_username:
              latestProfile?.x_username || null,

            telegram_username:
              latestProfile?.telegram_username || null,
          },
        ])

    if (error) {
      alert(
        'Onchain success, but profile save failed: ' +
          error.message
      )
      return
    }

    setClaimed(true)

    alert(
      'Success Claim!\nTX: ' +
        tx
    )
  } catch (err: any) {
    alert(
      'Failed: ' +
        (err?.reason ||
          err?.message ||
          'Transaction failed')
    )
  } finally {
    setLoading(false)
  }
}

  if (!event) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

      <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-8">

        <a
          href="/"
          className="text-sm text-zinc-500 hover:text-white transition"
        >
          ← Back Home
        </a>

        <p className="text-purple-400 text-sm mt-6 mb-3">
          EVENT BADGE
        </p>

        <h1 className="text-3xl font-bold mb-3">
          {event.title}
        </h1>

        <p className="text-zinc-400 mb-2">
          📅 {event.event_date}
        </p>

        <p className="text-zinc-400 mb-8">
          👤 {event.creator_name}
        </p>

        {/* Badge */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 via-purple-950 to-black h-56 mb-8 p-6">

          <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/20 blur-3xl rounded-full"></div>

          <div className="relative h-full flex flex-col justify-between">

            <div className="flex justify-between">

              <p className="text-xs tracking-[0.25em] uppercase text-purple-300">
                Proof of Attendance
              </p>

              <p className="text-xs text-zinc-400">
                #{event.id}
              </p>

            </div>

            <div>

              <h3 className="text-2xl font-bold text-white">
                {event.title}
              </h3>

              <p className="text-sm text-zinc-400 mt-2">
                {event.event_date}
              </p>

            </div>

            <div className="flex justify-between items-end">

              <p className="text-sm text-zinc-300">
                Hosted by {event.creator_name}
              </p>

              <div className="text-4xl">
                🛡️
              </div>

            </div>

          </div>

        </div>

        {/* Button */}
        {!isConnected ? (
          <button
            disabled
            className="w-full py-3 rounded-2xl bg-zinc-800 text-zinc-400 font-semibold"
          >
            Connect Wallet First
          </button>
        ) : checking ? (
          <button
            disabled
            className="w-full py-3 rounded-2xl bg-zinc-800 text-zinc-400 font-semibold"
          >
            Checking...
          </button>
        ) : claimed ? (
          <button
            disabled
            className="w-full py-3 rounded-2xl bg-green-600 font-semibold"
          >
            Already Claimed
          </button>
        ) : (
          <button
            onClick={
              handleClaim
            }
            disabled={
              loading
            }
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 font-semibold"
          >
            {loading
              ? 'Claiming...'
              : 'Claim Onchain'}
          </button>
        )}

      </div>

    </main>
  )
}
