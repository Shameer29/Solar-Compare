import { notFound } from 'next/navigation'
import { Sun, Phone, Globe, MapPin, Star, Clock, ExternalLink, Shield } from 'lucide-react'
import { getCompanyDetails } from '@/lib/places'
import type { Review } from '@/lib/places'
import BackButton from './BackButton'

interface Props {
  params: Promise<{ placeId: string }>
}

const UK_ACCREDITATIONS = [
  { name: 'MCS Certified', url: 'https://mcscertified.com', keywords: ['mcs', 'microgeneration'] },
  { name: 'NAPIT', url: 'https://napit.org.uk', keywords: ['napit'] },
  { name: 'NICEIC', url: 'https://niceic.com', keywords: ['niceic'] },
  { name: 'TrustMark', url: 'https://trustmark.org.uk', keywords: ['trustmark'] },
  { name: 'Which? Trusted', url: 'https://trustedtraders.which.co.uk', keywords: ['which trusted', 'which? trusted'] },
]

export default async function CompanyPage({ params }: Props) {
  const { placeId } = await params
  const company = await getCompanyDetails(placeId)
  if (!company) notFound()

  const fullStars = company.rating !== null ? Math.round(company.rating) : 0
  const allReviewText = company.reviews.map(r => r.text).join(' ').toLowerCase()

  const accreditations = UK_ACCREDITATIONS.map(acc => ({
    ...acc,
    found: acc.keywords.some(kw => allReviewText.includes(kw)),
  }))

  // Google weekday_text: index 0 = Monday. JS getDay(): 0=Sun, 1=Mon…
  const jsDay = new Date().getDay()
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1

  const cleanTypes = company.types
    .filter(t => !['establishment', 'point_of_interest', 'business', 'store'].includes(t))
    .map(t => t.replace(/_/g, ' '))
    .slice(0, 5)

  const photos = company.multiplePhotos.filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-[#0b1120]">

      {/* Sticky header */}
      <header className="bg-[#0b1120]/95 backdrop-blur-sm border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <BackButton />
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sun className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80">SolarFinder</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {company.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.photoUrl}
            alt={company.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-600/20 to-amber-500/10 flex items-center justify-center">
            <span className="text-[160px] font-black text-white/5 select-none">{company.initial}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {company.isOpen !== null && (
          <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
            company.isOpen ? 'bg-emerald-500/90 text-white' : 'bg-black/55 text-white/75'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${company.isOpen ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
            {company.isOpen ? 'Open Now' : 'Closed'}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
          <div className="max-w-5xl mx-auto">
            {company.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt=""
                className="w-10 h-10 rounded-xl bg-white/10 p-1.5 mb-3 shadow-lg"
                referrerPolicy="no-referrer"
              />
            )}
            <h1
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
              style={{ letterSpacing: '-0.03em' }}
            >
              {company.name}
            </h1>
            {company.rating !== null && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i <= fullStars ? 'text-amber-400 fill-amber-400' : 'text-white/25 fill-white/25'}`}
                    />
                  ))}
                </div>
                <span className="text-white font-bold">{company.rating.toFixed(1)}</span>
                <span className="text-white/55 text-sm">({company.reviewCount.toLocaleString()} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#f0f4f8] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-6">

            {company.editorialSummary && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">About</h2>
                <p className="text-slate-700 leading-relaxed">{company.editorialSummary}</p>
              </div>
            )}

            {/* Photo gallery */}
            {photos.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Photos</h2>
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {photos.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-36 w-56 flex-shrink-0 object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Customer Reviews</h2>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Via Google
                </span>
              </div>

              {company.reviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {company.reviews.map((review, i) => (
                    <ReviewCard key={i} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-10">No reviews available yet.</p>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Contact */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Contact</h2>
              <div className="space-y-3 mb-4">
                {company.address && (
                  <div className="flex gap-2.5 text-sm">
                    <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 leading-relaxed text-xs">{company.address}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex gap-2.5 items-center">
                    <Phone className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <a
                      href={`tel:${company.phone.replace(/\s/g, '')}`}
                      className="text-sm font-semibold text-slate-800 hover:text-orange-600 transition-colors"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
                <a
                  href={company.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Google Maps
                </a>
              </div>
            </div>

            {/* Opening hours */}
            {company.openingHours.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-slate-300" />
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Opening Hours</h2>
                </div>
                <div className="space-y-1">
                  {company.openingHours.map((line, i) => {
                    const sep = line.indexOf(': ')
                    const day = sep >= 0 ? line.slice(0, sep) : line
                    const hours = sep >= 0 ? line.slice(sep + 2) : ''
                    const isToday = i === todayIdx
                    return (
                      <div
                        key={i}
                        className={`flex justify-between gap-2 px-2 py-1.5 rounded-lg text-xs ${
                          isToday
                            ? 'bg-orange-50 text-orange-700 font-semibold'
                            : 'text-slate-600'
                        }`}
                      >
                        <span>{day}</span>
                        <span className="text-right">{hours || '—'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Accreditations */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-slate-300" />
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Accreditations</h2>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                MCS certification is required for solar installs to qualify for Smart Export Guarantee payments. Always verify directly.
              </p>
              <div className="space-y-2">
                {accreditations.map(acc => (
                  <a
                    key={acc.name}
                    href={acc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      acc.found
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {acc.found ? '✓' : '↗'} {acc.name}
                    </span>
                    <span className="opacity-60">{acc.found ? 'Mentioned' : 'Verify'}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Categories */}
            {cleanTypes.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Categories</h2>
                <div className="flex flex-wrap gap-1.5">
                  {cleanTypes.map(type => (
                    <span key={type} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium capitalize">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const fullStars = Math.round(review.rating)
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3 mb-2">
        {review.authorPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.authorPhoto}
            alt=""
            className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{review.author.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800">{review.author}</span>
            <span className="text-xs text-slate-400">{review.timeAgo}</span>
          </div>
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={`w-3 h-3 ${i <= fullStars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
      {review.text && (
        <p className="text-sm text-slate-600 leading-relaxed ml-12">{review.text}</p>
      )}
    </div>
  )
}
