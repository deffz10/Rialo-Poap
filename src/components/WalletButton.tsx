'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="group flex items-center gap-3 px-4 py-2 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-all duration-200 shadow-lg"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />

        <span className="text-white text-sm font-medium">
          {address?.slice(0,6)}...{address?.slice(-4)}
        </span>

        <span className="text-red-400 text-xs group-hover:text-red-300 transition font-medium">
  Disconnect
</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:scale-[1.02] transition-all text-white text-sm font-semibold shadow-lg shadow-purple-900/40"
    >
      Connect Wallet
    </button>
  )
}