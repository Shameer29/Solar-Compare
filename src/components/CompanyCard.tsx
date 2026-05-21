import { MapPin, Phone, Globe, Star, ExternalLink, Navigation } from "lucide-react"
import type { Company } from "@/lib/places"

const AVATAR_COLORS = [
  "from-orange-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
]

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`
  if (km < 10) return `${km.toFixed(1)} km away`
  return `${Math.round(km)} km away`
}

export default function CompanyCard({
  company,
  index = 0,
}: {
  company: Company
  index?: number
}) {
  const fullStars = company.rating !== null ? Math.round(company.rating) : 0
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const domain = company.website
    ? (() => { try { return new URL(company.website).hostname.replace("www.", "") } catch { return "" } })()
    : ""

  return (
    <article
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Top gradient bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />

      {/* Company photo / avatar hero */}
      <div className="relative h-36 overflow-hidden bg-slate-50">
        {company.photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={company.photoUrl}
            alt={company.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
            <span className="text-6xl font-black text-white/20 select-none">{company.initial}</span>
          </div>
        )}

        {/* Gradient overlay on photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Avatar badge over photo */}
        <div className={`absolute bottom-3 left-4 w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg ring-2 ring-white`}>
          <span className="text-lg font-black text-white">{company.initial}</span>
        </div>

        {/* Distance badge */}
        {company.distanceKm !== null && (
          <div className="absolute bottom-3 right-4 flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
            <Navigation className="w-3 h-3" />
            {formatDistance(company.distanceKm)}
          </div>
        )}

        {/* Open/Closed badge */}
        {company.isOpen !== null && (
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            company.isOpen
              ? "bg-emerald-500/90 text-white"
              : "bg-black/40 text-white/80"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${company.isOpen ? "bg-white animate-pulse" : "bg-white/50"}`} />
            {company.isOpen ? "Open Now" : "Closed"}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Name + Rating */}
        <div className="mb-3">
          <h3 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
            {company.name}
          </h3>

          {company.rating !== null && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i <= fullStars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800">{company.rating.toFixed(1)}</span>
              {company.reviewCount > 0 && (
                <span className="text-xs text-slate-400">
                  ({company.reviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-300" />
            <span className="line-clamp-2 text-xs leading-relaxed">{company.address}</span>
          </div>
          {company.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
              <a
                href={`tel:${company.phone.replace(/\s/g, "")}`}
                className="text-xs font-semibold text-slate-700 hover:text-orange-600 transition-colors"
              >
                {company.phone}
              </a>
            </div>
          )}
          {domain && (
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
              <span className="text-xs text-slate-400 truncate">{domain}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all duration-150 shadow-sm shadow-orange-200"
            >
              <Globe className="w-3.5 h-3.5" />
              Website
            </a>
          ) : null}
          <a
            href={company.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all duration-150 ${!company.website ? "flex-1" : ""}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {company.website ? "Maps" : "View on Maps"}
          </a>
        </div>
      </div>
    </article>
  )
}
