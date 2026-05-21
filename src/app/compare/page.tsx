import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Sun, ChevronLeft, Globe, Phone, MapPin, Star, Clock, Shield, Check, X } from 'lucide-react'
import { getCompanyDetails } from '@/lib/places'
import type { CompanyDetails } from '@/lib/places'

interface Props {
  searchParams: Promise<{ ids?: string }>
}

// ── Scoring ────────────────────────────────────────────────────────────────

function scoreCompany(c: CompanyDetails) {
  const ratingScore = c.rating ? Math.round((c.rating / 5) * 100) : 0
  // Logarithmic review volume: 500 reviews ≈ 100
  const reviewScore = c.reviewCount
    ? Math.min(Math.round((Math.log(c.reviewCount + 1) / Math.log(501)) * 100), 100)
    : 0
  // Bayesian-smoothed reliability: penalises companies with very few reviews
  const bayesian = c.rating && c.reviewCount
    ? (c.rating * c.reviewCount + 4.0 * 25) / (c.reviewCount + 25)
    : c.rating ?? 0
  const reliabilityScore = Math.round((bayesian / 5) * 100)

  const overall = Math.round(ratingScore * 0.5 + reviewScore * 0.3 + reliabilityScore * 0.2)
  const availabilityScore = c.isOpen === true ? 100 : c.isOpen === false ? 0 : 50
  const presenceScore = (c.website ? 50 : 0) + (c.phone ? 50 : 0)

  return { overall, ratingScore, reviewScore, reliabilityScore, availabilityScore, presenceScore }
}

function scoreLabel(s: number) {
  if (s >= 90) return { text: 'Excellent', color: 'text-emerald-600' }
  if (s >= 75) return { text: 'Great', color: 'text-green-600' }
  if (s >= 60) return { text: 'Good', color: 'text-lime-600' }
  if (s >= 40) return { text: 'Average', color: 'text-amber-500' }
  return { text: 'Below avg', color: 'text-rose-500' }
}

// ── SVG circular score ─────────────────────────────────────────────────────

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f97316' : '#ef4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900 leading-none">{score}</span>
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide leading-none mt-0.5">/100</span>
      </div>
    </div>
  )
}

// ── Bar for review count ───────────────────────────────────────────────────

function ReviewBar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-slate-800">{count.toLocaleString()}</span>
        <span className="text-[10px] text-slate-400">reviews</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Row component ──────────────────────────────────────────────────────────

function Row({ label, children, alt }: { label: string; children: React.ReactNode; alt?: boolean }) {
  return (
    <tr className={alt ? 'bg-slate-50/60' : 'bg-white'}>
      <td className="px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap w-36 border-r border-slate-100">
        {label}
      </td>
      {children}
    </tr>
  )
}

// ── Winner highlight ───────────────────────────────────────────────────────

function winnerIdx(values: (number | null)[]) {
  let best = -Infinity, idx = -1
  values.forEach((v, i) => { if (v !== null && v > best) { best = v; idx = i } })
  return idx
}

// ── Main page ──────────────────────────────────────────────────────────────

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams
  const idList = (ids || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
  if (idList.length < 2) notFound()

  const companies = (await Promise.all(idList.map(id => getCompanyDetails(id)))).filter(Boolean) as CompanyDetails[]
  if (companies.length < 2) notFound()

  const scores = companies.map(scoreCompany)
  const overallWinner = winnerIdx(scores.map(s => s.overall))
  const ratingWinner  = winnerIdx(companies.map(c => c.rating))
  const reviewWinner  = winnerIdx(companies.map(c => c.reviewCount))

  // Today's opening hours
  const jsDay = new Date().getDay()
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1

  const cols = companies.length

  return (
    <div className="min-h-screen bg-[#0b1120]">

      {/* Header */}
      <header className="bg-[#0b1120]/95 backdrop-blur-sm border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="javascript:history.back()" className="flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <Sun className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80">SolarFinder</span>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <div className="bg-[#0b1120] px-4 sm:px-6 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-2">Side by side</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
            Comparing {cols} installers
          </h1>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#f0f4f8] min-h-screen pb-20">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 py-6">
          <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200">
            <table className="w-full border-collapse bg-white" style={{ minWidth: `${cols * 200 + 144}px` }}>

              {/* Company header row */}
              <thead>
                <tr className="bg-[#0b1120]">
                  <th className="px-5 py-5 text-left border-r border-white/5 w-36">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Company</span>
                  </th>
                  {companies.map((c, i) => (
                    <th key={c.id} className={`px-5 py-5 text-left ${i < cols - 1 ? 'border-r border-white/5' : ''}`}>
                      <div className="flex flex-col gap-3">
                        {/* Photo / avatar */}
                        <div className="w-full h-28 rounded-xl overflow-hidden bg-[#1e293b] relative flex-shrink-0">
                          {c.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-5xl font-black text-white/10">{c.initial}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {overallWinner === i && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Best match
                            </div>
                          )}
                        </div>
                        {/* Logo + name */}
                        <div className="flex items-center gap-2">
                          {c.logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.logoUrl} alt="" className="w-8 h-8 rounded-lg bg-white p-1 flex-shrink-0" referrerPolicy="no-referrer" />
                          )}
                          <Link href={`/company/${c.id}`} className="text-sm font-bold text-white hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                            {c.name}
                          </Link>
                        </div>
                        {/* CTA */}
                        <div className="flex gap-2">
                          {c.website && (
                            <a href={c.website} target="_blank" rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors">
                              <Globe className="w-3.5 h-3.5" />
                              Website
                            </a>
                          )}
                          {c.phone && (
                            <a href={`tel:${c.phone.replace(/\s/g,'')}`}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors">
                              <Phone className="w-3.5 h-3.5" />
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>

                {/* Overall Score */}
                <Row label="Overall Score">
                  {companies.map((c, i) => {
                    const s = scores[i]
                    const lbl = scoreLabel(s.overall)
                    return (
                      <td key={c.id} className={`px-5 py-5 ${i < cols - 1 ? 'border-r border-slate-100' : ''} ${overallWinner === i ? 'bg-orange-50' : ''}`}>
                        <div className="flex flex-col items-center gap-2">
                          <ScoreRing score={s.overall} />
                          <span className={`text-xs font-bold ${lbl.color}`}>{lbl.text}</span>
                        </div>
                      </td>
                    )
                  })}
                </Row>

                {/* Rating */}
                <Row label="Google Rating" alt>
                  {companies.map((c, i) => (
                    <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''} ${ratingWinner === i ? 'bg-green-50' : ''}`}>
                      {c.rating !== null ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-black text-slate-900">{c.rating.toFixed(1)}</span>
                            {ratingWinner === i && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">Highest</span>}
                          </div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(c.rating!) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-300">No rating</span>
                      )}
                    </td>
                  ))}
                </Row>

                {/* Review count */}
                <Row label="Reviews">
                  {companies.map((c, i) => {
                    const maxReviews = Math.max(...companies.map(co => co.reviewCount))
                    return (
                      <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''} ${reviewWinner === i ? 'bg-blue-50' : ''}`}>
                        <div className="flex flex-col gap-1">
                          <ReviewBar count={c.reviewCount} max={maxReviews} />
                          {reviewWinner === i && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full w-fit">Most reviewed</span>}
                        </div>
                      </td>
                    )
                  })}
                </Row>

                {/* Availability */}
                <Row label="Status Today" alt>
                  {companies.map((c, i) => (
                    <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''}`}>
                      {c.isOpen !== null ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          c.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {c.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">Unknown</span>
                      )}
                    </td>
                  ))}
                </Row>

                {/* Today's hours */}
                <Row label="Today's Hours">
                  {companies.map((c, i) => {
                    const line = c.openingHours[todayIdx]
                    const hours = line ? line.slice(line.indexOf(': ') + 2) : null
                    return (
                      <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          <span className="text-sm font-semibold text-slate-700">{hours || '—'}</span>
                        </div>
                      </td>
                    )
                  })}
                </Row>

                {/* Address */}
                <Row label="Location" alt>
                  {companies.map((c, i) => (
                    <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''}`}>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-500 leading-relaxed">{c.address || '—'}</span>
                      </div>
                    </td>
                  ))}
                </Row>

                {/* Contact */}
                <Row label="Contact">
                  {companies.map((c, i) => (
                    <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''}`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className={`w-3.5 h-3.5 ${c.website ? 'text-orange-400' : 'text-slate-200'}`} />
                          {c.website
                            ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-semibold hover:underline">Website</a>
                            : <span className="text-slate-300">No website</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className={`w-3.5 h-3.5 ${c.phone ? 'text-orange-400' : 'text-slate-200'}`} />
                          {c.phone
                            ? <a href={`tel:${c.phone.replace(/\s/g,'')}`} className="text-slate-700 font-semibold">{c.phone}</a>
                            : <span className="text-slate-300">No phone</span>}
                        </div>
                      </div>
                    </td>
                  ))}
                </Row>

                {/* MCS check */}
                <Row label="MCS Mentioned" alt>
                  {companies.map((c, i) => {
                    const txt = c.reviews.map(r => r.text).join(' ').toLowerCase()
                    const found = txt.includes('mcs') || txt.includes('microgeneration')
                    return (
                      <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''}`}>
                        <div className="flex items-center gap-2">
                          {found
                            ? <><Check className="w-4 h-4 text-emerald-500" /><span className="text-xs font-semibold text-emerald-700">In reviews</span></>
                            : <><X className="w-4 h-4 text-slate-300" /><span className="text-xs text-slate-400">Not mentioned</span></>}
                        </div>
                      </td>
                    )
                  })}
                </Row>

                {/* Reliability score */}
                <Row label="Reliability">
                  {companies.map((c, i) => {
                    const s = scores[i]
                    const lbl = scoreLabel(s.reliabilityScore)
                    const reliabilityWinner = winnerIdx(scores.map(sc => sc.reliabilityScore))
                    return (
                      <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''} ${reliabilityWinner === i ? 'bg-purple-50' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10">
                            <svg width={40} height={40} style={{ transform: 'rotate(-90deg)' }}>
                              <circle cx={20} cy={20} r={14} fill="none" stroke="#e2e8f0" strokeWidth={4} />
                              <circle cx={20} cy={20} r={14} fill="none"
                                stroke={s.reliabilityScore >= 75 ? '#22c55e' : s.reliabilityScore >= 50 ? '#f97316' : '#ef4444'}
                                strokeWidth={4} strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 14}
                                strokeDashoffset={2 * Math.PI * 14 * (1 - s.reliabilityScore / 100)}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[9px] font-black text-slate-800">{s.reliabilityScore}</span>
                            </div>
                          </div>
                          <div>
                            <span className={`text-xs font-bold ${lbl.color}`}>{lbl.text}</span>
                            <p className="text-[10px] text-slate-400">Bayesian score</p>
                          </div>
                          {reliabilityWinner === i && <Shield className="w-3.5 h-3.5 text-purple-400 ml-auto" />}
                        </div>
                      </td>
                    )
                  })}
                </Row>

                {/* View full profile */}
                <Row label="">
                  {companies.map((c, i) => (
                    <td key={c.id} className={`px-5 py-4 ${i < cols - 1 ? 'border-r border-slate-100' : ''}`}>
                      <Link href={`/company/${c.id}`}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors">
                        View Full Profile
                      </Link>
                    </td>
                  ))}
                </Row>

              </tbody>
            </table>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Scores are derived from Google Maps data (rating, review volume, Bayesian reliability).
            Always verify MCS certification at{' '}
            <a href="https://mcscertified.com" target="_blank" rel="noopener noreferrer" className="underline">mcscertified.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
