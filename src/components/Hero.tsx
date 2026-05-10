export default function Hero() {
  return (
    <section className="relative w-full min-h-screen lg:min-h-[700px] flex items-center justify-center overflow-hidden bg-black py-10 lg:py-20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[500px] bg-purple-900/10 blur-[120px] md:blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-6 lg:gap-12 items-center w-full relative z-10">
        
        {/* LEFT SIDE: Typography & CTA */}
        <div className="flex flex-col space-y-6 md:space-y-8 mt-4 lg:-mt-28 text-center lg:text-left items-center lg:items-start relative z-20">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Proof Your Presence, <br />
              <span className="text-[#6D4AFF]">Build Your Reputation</span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-lg max-w-md font-medium leading-relaxed mx-auto lg:mx-0">
              Join events, claim badges, and grow your onchain community identity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
            <button className="px-8 py-3.5 bg-[#5833FF] hover:bg-[#4a29eb] text-white font-bold rounded-xl transition-all shadow-[0_10px_30px_rgba(88,51,255,0.2)] hover:-translate-y-1 text-sm md:text-base">
              Explore Events
            </button>
            <button className="px-8 py-3.5 bg-transparent border border-zinc-700 hover:border-zinc-500 text-white font-bold rounded-xl transition-all hover:bg-white/5 text-sm md:text-base">
              Create Event
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: 3D Visual */}
        <div className="relative flex items-center justify-center scale-75 sm:scale-90 lg:scale-125 mt-6 md:mt-12 lg:mt-0">
          
          {/* Subtle Orbit Lines */}
          <div className="absolute w-[280px] md:w-[420px] h-[280px] md:h-[420px] border border-white/5 rounded-full scale-y-[0.35] rotate-[12deg]" />
          <div className="absolute w-[200px] md:w-[320px] h-[200px] md:h-[320px] border border-white/10 rounded-full scale-y-[0.25] -rotate-[8deg]" />

          {/* Floating Icons */}
          <div className="absolute top-[-30px] left-[10px] animate-bounce duration-[4000ms] opacity-80">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1A1A1A] border border-white/10 rounded-2xl flex items-center justify-center rotate-[-10deg] shadow-xl">
               <div className="w-5 h-5 md:w-6 md:h-6 bg-zinc-700 rounded-md" />
            </div>
          </div>
          
          <div className="absolute top-[-10px] right-[30px] animate-bounce duration-[5000ms] delay-500 opacity-90">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1A1A1A] border border-purple-500/20 rounded-2xl flex items-center justify-center rotate-[15deg] shadow-xl">
               <div className="w-5 h-5 md:w-6 md:h-6 bg-purple-600 rounded-md opacity-60" />
            </div>
          </div>

          <div className="absolute left-[-30px] md:left-[-60px] top-[80px] md:top-[120px] animate-pulse">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-[#121212] border border-white/5 rounded-full flex items-center justify-center shadow-2xl">
               <div className="w-4 h-4 md:w-5 md:h-5 bg-purple-900 rounded-full blur-[2px]" />
            </div>
          </div>

          {/* THE PODIUM */}
          <div className="absolute bottom-[-15px] flex flex-col items-center">
             <div className="w-56 md:w-72 h-14 md:h-20 bg-[#0F0F0F] border-t-2 border-zinc-800 rounded-[100%] shadow-[0_15px_40px_rgba(0,0,0,0.8)]" />
             <div className="w-60 md:w-80 h-18 md:h-24 bg-black border-t border-zinc-900 rounded-[100%] -mt-10 md:-mt-16 -z-10" />
          </div>

          {/* CENTRAL 3D BADGE */}
          <div className="relative z-20 animate-[float_5s_ease-in-out_infinite] flex flex-col items-center">
            <div className="relative w-32 h-32 md:w-44 md:h-44 bg-[#6D4AFF] rounded-[35px] md:rounded-[45px] rotate-[15deg] flex items-center justify-center shadow-[0_0_80px_rgba(109,74,255,0.4)] border-b-[8px] md:border-b-[12px] border-black/20">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-[#5833FF] rounded-full flex items-center justify-center border-4 border-white/10 shadow-inner">
                <svg className="w-10 h-10 md:w-16 md:h-16 text-white drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute inset-0 border-[6px] md:border-[10px] border-[#6D4AFF] rounded-[45px] md:rounded-[55px] -m-1 opacity-40 rotate-45" />
            </div>
            <div className="w-24 md:w-32 h-4 md:h-6 bg-purple-600/20 blur-2xl mt-8 md:mt-16 rounded-[100%] scale-x-150" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
      `}</style>
    </section>
  );
}