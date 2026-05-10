'use client'

import { useEffect } from 'react'

export default function FaucetPage() {

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href =
        "https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-[#07070c] text-white flex items-center justify-center p-6">

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b13]/90 backdrop-blur-xl p-8 shadow-xl text-center">

        {/* TITLE */}
        <h1 className="text-2xl font-black mb-2">
          Redirecting...
        </h1>

        <p className="text-sm text-zinc-400 mb-6">
          Taking you to Sepolia Faucet
        </p>

        {/* LOADING */}
        <div className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 font-semibold animate-pulse">
          Connecting to Faucet...
        </div>

        {/* FALLBACK */}
        <p className="text-xs text-zinc-500 mt-4">
          If not redirected,
          <a
            href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
            className="text-purple-400 underline ml-1"
          >
            click here
          </a>
        </p>

      </div>

    </main>
  )
}