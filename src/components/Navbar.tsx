'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import WalletButton from './WalletButton'
import Link from 'next/link'

export default function Navbar() {
  const { isConnected } = useAccount()
  const [open, setOpen] = useState(false)

  const guestMenu = [
    { name: 'Home', href: '/' },
    { name: 'Event', href: '/explore-event' }, 
    { name: 'Faucet', href: '/faucet', external: true }
  ]

  const userMenu = [
    { name: 'Home', href: '/' },
    { name: 'Faucet', href: '/faucet', external: true },
    { name: 'Event', href: '/explore-event' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Profile', href: '/profile' },
  ]

  const menu = isConnected ? userMenu : guestMenu

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-300 group-hover:scale-105">
            <img 
              src="https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg" 
              alt="Rialo Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-white font-black text-xl tracking-tighter leading-none uppercase">
              Rialo <span className="text-purple-500">POAP</span>
            </h1>
            <p className="text-zinc-500 text-[9px] font-bold tracking-[0.3em] uppercase mt-1">
              Proof of Attendance Protocol
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {menu.map((item) =>
            item.external ? (
              <button
                key={item.name}
                onClick={() => window.open(item.href, '_blank')}
                className="text-sm font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        {/* Action Section */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="h-6 w-px bg-white/10" />
          <WalletButton />
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center"
        >
          <span className="text-white text-xl">
            {open ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div className="lg:hidden border-t border-white/5 bg-black/95 p-6 space-y-6 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            {menu.map((item) =>
              item.external ? (
                <button
                  key={item.name}
                  onClick={() => {
                    window.open(item.href, '_blank')
                    setOpen(false)
                  }}
                  className="text-left w-full text-lg font-black text-zinc-300 hover:text-purple-400 transition-colors uppercase tracking-tight"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-left w-full text-lg font-black text-zinc-300 hover:text-purple-400 transition-colors uppercase tracking-tight"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          <div className="pt-4 border-t border-white/5">
            <WalletButton />
          </div>
        </div>
      )}
    </nav>
  )
}