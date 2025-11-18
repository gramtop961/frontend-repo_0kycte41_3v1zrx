import { useState } from 'react'
import { Menu, X, Shield, Sparkles } from 'lucide-react'

function Navbar() {
  const [open, setOpen] = useState(false)

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Markets', href: '#markets' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '#security' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <a href="#" className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-400 to-fuchsia-500 blur-sm opacity-60" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-white/10">
                  <Shield className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-white font-semibold text-lg tracking-tight">NeonX</span>
                <span className="text-cyan-300/80 text-xs font-medium px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">Trade</span>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="text-sm text-white/80 hover:text-white transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Sign in</a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
              >
                <Sparkles className="h-4 w-4" />
                Launch App
              </a>
            </div>

            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 p-2 text-white"
              onClick={() => setOpen(!open)}
              aria-label="Toggle Navigation"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open && (
            <div className="md:hidden border-t border-white/10 px-6 py-3">
              <nav className="flex flex-col gap-3 py-2">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} className="text-sm text-white/80 hover:text-white transition-colors">
                    {item.label}
                  </a>
                ))}
                <div className="pt-2 flex items-center gap-3">
                  <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Sign in</a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    Launch App
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
