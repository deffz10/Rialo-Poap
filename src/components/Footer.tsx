export default function Footer() {
  const creators = [
    { 
      name: "!0xJuniorr", 
      twitter: "https://x.com/Juniorr1945", 
      discord: "https://discord.com/invite/RialoProtocol" 
    },
    { 
      name: "!0xSzaJoestar", 
      twitter: "https://x.com/Szaonly666", 
      discord: "https://discord.com/invite/RialoProtocol" 
    },
	{ 
      name: "!0xRialoHq", 
      twitter: "https://x.com/RialoHQ", 
      discord: "https://discord.com/invite/RialoProtocol" 
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-black text-white relative overflow-hidden">

      {/* glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_60%)]" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* LEFT */}
          <div>

            <div className="flex items-center gap-3 mb-5">

             <div className="w-14 h-14 rounded-2xl bg-[#F5F1E8] border border-white/10 flex items-center justify-center overflow-hidden">
  <img
    src="https://pbs.twimg.com/profile_images/1950265537784926208/qbjSWMDP_400x400.jpg"
    alt="logo"
    className="w-12 h-12 object-contain mix-blend-darken"
  />
</div>

              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  RIALO <span className="text-violet-500">POAP</span>
                </h2>
                <p className="text-[10px] tracking-[4px] text-white/40 uppercase">
                  Proof Of Attendance Protocol
                </p>
              </div>

            </div>

            <p className="text-white/50 leading-8 max-w-sm">
              A decentralized attendance protocol for onchain communities.
              Join events, collect badges, and build your reputation across
              the ecosystem.
            </p>

          </div>

          {/* CENTER */}
          <div className="flex gap-20">

            {/* PROTOCOL */}
            <div>
              <h3 className="text-violet-400 font-bold tracking-[5px] text-sm mb-8 uppercase">
                Quick Links
              </h3>
              <div className="flex flex-col gap-5 text-white/70">
                <a href="/" className="hover:text-violet-400 transition">
                  Home
                </a>
                <a href="/explore-event" className="hover:text-violet-400 transition">
                  Event
                </a>
                <a href="/dashboard" className="hover:text-violet-400 transition">
                  Dashboard
                </a>
                <a href="/profile" className="hover:text-violet-400 transition">
                  Profile
                </a>
              </div>
            </div>

            {/* ABOUT */}
            <div>
              <h3 className="text-violet-400 font-bold tracking-[5px] text-sm mb-8 uppercase">
                About Rialo
              </h3>
              <div className="flex flex-col gap-5 text-white/70">
                <a href="https://www.rialo.io/" className="hover:text-violet-400 transition">
                  About Us
                </a>
                <a href="https://www.rialo.io/blog" className="hover:text-violet-400 transition">
                  Blog
                </a>
                <a href="https://learn.rialo.io/" className="hover:text-violet-400 transition">
                  Learn
                </a>
                <a href="https://www.rialo.io/news" className="hover:text-violet-400 transition">
                  News
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div>

            <h3 className="text-violet-400 font-bold tracking-[5px] text-sm mb-6 uppercase">
              Created By
            </h3>

            <div className="space-y-4">

              {creators.map((item, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between text-white/70"
                >

                  <span>{item.name}</span>

                  <div className="flex items-center gap-3">

                    <a
                      href={item.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-violet-400 transition"
                    >
                      𝕏
                    </a>

                    <a
                      href={item.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-violet-400 transition"
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </a>

                  </div>

                </div>

              ))}

            </div>

            <p className="mt-8 text-violet-400 tracking-[4px] text-sm uppercase">
              
            </p>

          </div>

        </div>

        {/* bottom */}
<div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">

  <p className="text-white text-sm">
    
  </p>

  <p className="text-white text-xs tracking-[3px] uppercase">
    © 2026 Rialo POAP. All rights reserved.
  </p>

</div>

      </div>

    </footer>
  )
}