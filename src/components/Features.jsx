import { Cpu, Bot, Timer, TrendingUp, Shield, Layers, ArrowUpRight } from 'lucide-react'

function Features() {
  const items = [
    {
      icon: <Cpu className="h-6 w-6 text-cyan-300" />,
      title: 'Lightning Engine',
      desc: 'Optimized matching engine with sub‑millisecond response times and smart order routing.'
    },
    {
      icon: <Bot className="h-6 w-6 text-fuchsia-300" />,
      title: 'AI Automations',
      desc: 'Build, backtest and deploy bot strategies with no code using our visual composer.'
    },
    {
      icon: <Timer className="h-6 w-6 text-emerald-300" />,
      title: '24/7 Execution',
      desc: 'Always‑on cloud infrastructure with auto‑failover across regions.'
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-indigo-300" />,
      title: 'Pro Analytics',
      desc: 'Institutional‑grade metrics, PnL, drawdown and risk analytics in real time.'
    },
    {
      icon: <Shield className="h-6 w-6 text-teal-300" />,
      title: 'Secure by Design',
      desc: 'Hardware key support, SOC 2 controls and MPC wallets protect your assets.'
    },
    {
      icon: <Layers className="h-6 w-6 text-pink-300" />,
      title: 'Deep Liquidity',
      desc: 'Aggregated order books across top venues for best execution and minimal slippage.'
    }
  ]

  return (
    <section id="features" className="relative bg-slate-950 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(34,211,238,0.08),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Built for serious traders</h2>
          <p className="mt-3 text-white/70">Everything you need to operate at peak performance, packaged in a simple, beautiful interface.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-tr from-cyan-400/30 to-fuchsia-500/30 blur" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-white/10">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-white font-semibold">{item.title}</h3>
              </div>
              <p className="mt-3 text-white/70 text-sm leading-relaxed">{item.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-cyan-300 text-sm">
                Learn more <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
