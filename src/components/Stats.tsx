export default function Stats() {
  const stats = [
    {
      title: "Badges Claimed",
      value: "12,480+",
      desc: "Attendance badges collected by users",
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "Events Hosted",
      value: "320+",
      desc: "Communities already using Rialo",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Wallets",
      value: "5,900+",
      desc: "Growing reputation identities",
      color: "from-fuchsia-500 to-purple-600",
    },
    {
      title: "Claim Success Rate",
      value: "99.2%",
      desc: "Fast and smooth live claims",
      color: "from-emerald-400 to-cyan-500",
    },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-6 pb-24 pt-0 -mt-15 lg:-mt-24">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-purple-600/5 blur-[120px] -z-10 pointer-events-none" />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((item, index) => (
          <div
            key={index}
            // UPDATE: Border diubah menjadi border-zinc-700 agar sama dengan style tombol Create Event
            className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-700 rounded-[2rem] p-8 transition-all duration-500 hover:border-purple-500/30 hover:-translate-y-2 overflow-hidden shadow-2xl"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`} />
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {item.title}
                </p>
              </div>

              <h3 className={`text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r ${item.color} bg-clip-text text-transparent tracking-tighter`}>
                {item.value}
              </h3>

              <div className="h-[1px] w-full bg-zinc-800/50 mb-4 group-hover:w-full transition-all duration-700 group-hover:bg-purple-500/40" />

              {/* UPDATE: Warna teks deskripsi diubah menjadi putih (text-white) */}
              <p className="text-white text-sm leading-relaxed font-medium transition-colors duration-500">
                {item.desc}
              </p>
            </div>

            {/* Subtle bottom accent light */}
            <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          </div>
        ))}
      </div>
    </section>
  );
}