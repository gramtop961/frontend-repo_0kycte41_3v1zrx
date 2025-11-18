import { ArrowRight, ShieldCheck, Zap, LineChart } from 'lucide-react'
import LaserFlow from './LaserFlow'

function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      {/* LaserFlow background */}
      <div className="absolute inset-0">
        <LaserFlow color="#FF79C6" />
      </div>

      {/* Gradient overlays for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-slate-950/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-36 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
            Institutional-grade security
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-white">
            Trade crypto at light speed
          </h1>
          <p className="mt-4 text-lg text-white/80">
            NeonX is a next‑gen trading platform built for precision. Ultra‑low latency, deep liquidity, and AI‑powered automation, wrapped in a stunning, futuristic interface.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
            >
              Start trading
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-white/90 hover:text-white hover:bg-white/10 transition"
            >
              Explore features
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Feature icon={<Zap className='h-5 w-5 text-cyan-300' />} title="<2ms execution" />
            <Feature icon={<LineChart className='h-5 w-5 text-fuchsia-300' />} title="Advanced charting" />
            <Feature icon={<ShieldCheck className='h-5 w-5 text-emerald-300' />} title="Multi-layer security" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Feature({ icon, title }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/85">
      {icon}
      <span className="text-sm">{title}</span>
    </div>
  )
}

export default Hero
