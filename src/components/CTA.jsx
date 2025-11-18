import { ArrowRight } from 'lucide-react'

function CTA() {
  return (
    <section className="relative bg-slate-950 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(217,70,239,0.08),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Ready to trade the future?</h3>
              <p className="mt-2 text-white/70">Join thousands of pro traders executing with confidence on NeonX.</p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
            >
              Create account
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
