import { Suspense } from "react"
import { Sun, Zap, MapPin, ArrowRight } from "lucide-react"
import SearchForm from "@/components/SearchForm"
import CompanyCard from "@/components/CompanyCard"
import HeroSection from "@/components/HeroSection"
import { searchSolarCompanies } from "@/lib/places"

interface PageProps {
  searchParams: Promise<{ location?: string; service?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const { location: rawLocation, service: rawService } = await searchParams
  const locationQuery = rawLocation?.trim() || ""
  const serviceQuery = rawService || ""
  const hasSearched = locationQuery !== "" || serviceQuery !== ""

  let companies: Awaited<ReturnType<typeof searchSolarCompanies>>["companies"] = []
  let error: string | undefined

  if (hasSearched) {
    const result = await searchSolarCompanies(locationQuery, serviceQuery)
    companies = result.companies
    error = result.error
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120]">

      {/* ── Landing: full-screen video hero ─────────────────────────── */}
      {!hasSearched && <HeroSection />}

      {/* ── Results mode: compact sticky navbar ─────────────────────── */}
      {hasSearched && <CompactHeader />}

      {/* ── Search section ──────────────────────────────────────────── */}
      <section
        id="search"
        className={`${!hasSearched ? "bg-[#0b1120]" : "bg-[#0b1120]"} border-t border-white/5`}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-16 py-12">
          {!hasSearched && (
            <div className="text-center mb-8">
              <p className="text-white/50 text-sm font-medium tracking-widest uppercase mb-3">
                Search the directory
              </p>
              <h2 className="text-3xl md:text-4xl font-light text-white" style={{ letterSpacing: "-0.03em" }}>
                Find installers near you
              </h2>
            </div>
          )}
          <Suspense fallback={<div className="h-16" />}>
            <SearchForm />
          </Suspense>
        </div>
      </section>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {hasSearched && (
        <main className="flex-1 bg-[#f0f4f8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {error === "API_KEY_MISSING" && <ApiKeySetup />}

            {error && error !== "API_KEY_MISSING" && (
              <div className="mb-8 flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm animate-fade-in">
                <span className="mt-0.5">⚠</span>
                {error}
              </div>
            )}

            {!error && (
              <>
                {/* Results header */}
                <div className="flex items-end justify-between gap-4 mb-7 animate-fade-in">
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-black text-slate-900" style={{ letterSpacing: "-0.04em" }}>
                        {companies.length}
                      </span>
                      <span className="text-lg font-semibold text-slate-400">
                        {companies.length === 1 ? "installer" : "installers"} found
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {locationQuery && (
                        <span>Near <strong className="text-slate-600">{locationQuery}</strong></span>
                      )}
                      {locationQuery && serviceQuery && <span className="mx-1.5 text-slate-300">·</span>}
                      {serviceQuery && <span>{serviceQuery}</span>}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1 shrink-0 pb-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Powered by Google Maps
                  </p>
                </div>

                {companies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {companies.map((company, i) => (
                      <CompanyCard key={company.id} company={company} index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* ── Landing: How it works ────────────────────────────────────── */}
      {!hasSearched && (
        <section className="bg-[#0f1a2e] border-t border-white/5 py-20 px-6 md:px-12 lg:px-16">
          <div className="max-w-5xl mx-auto">
            <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-3 text-center">Process</p>
            <h2 className="text-3xl md:text-4xl font-light text-white text-center mb-12" style={{ letterSpacing: "-0.03em" }}>
              Three steps to clean energy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", icon: <MapPin className="w-5 h-5" />, title: "Enter your location", desc: "City, postcode, or use GPS — we find installers within 75 km." },
                { step: "02", icon: <Zap className="w-5 h-5" />, title: "Choose your service", desc: "Solar panels, battery storage, or a combined system." },
                { step: "03", icon: <ArrowRight className="w-5 h-5" />, title: "Compare & contact", desc: "Live ratings, real photos, and direct phone numbers." },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="group p-6 rounded-2xl border border-white/8 hover:border-orange-500/30 hover:bg-white/3 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                      {icon}
                    </div>
                    <span className="text-xs font-black text-white/20 tracking-widest">{step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function CompactHeader() {
  return (
    <header className="bg-[#0b1120] border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Sun className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">SolarFinder</span>
        </a>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live data
        </div>
      </div>
    </header>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
        <Sun className="w-10 h-10 text-slate-200" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2" style={{ letterSpacing: "-0.03em" }}>
        No installers found
      </h3>
      <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
        Try a different postcode or broaden your service type.
      </p>
    </div>
  )
}

function ApiKeySetup() {
  return (
    <div className="max-w-xl mx-auto py-16 text-center animate-fade-in">
      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Sun className="w-7 h-7 text-amber-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{ letterSpacing: "-0.04em" }}>
        Connect Google Places API
      </h3>
      <p className="text-slate-400 mb-6 text-sm">
        Add your key to{" "}
        <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">.env.local</code>
      </p>
      <div className="text-left bg-slate-900 rounded-xl p-4 font-mono text-sm">
        <p className="text-slate-500 text-xs mb-1"># .env.local</p>
        <p className="text-emerald-400">GOOGLE_PLACES_API_KEY=your_key</p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-[#080e1c] border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white/30 text-sm">
          <Sun className="w-4 h-4 text-orange-500/60" />
          <span className="font-semibold text-white/40">SolarFinder</span>
          <span>· UK {new Date().getFullYear()}</span>
        </div>
        <p className="text-white/20 text-xs">
          Live data via Google Maps Platform
        </p>
      </div>
    </footer>
  )
}
