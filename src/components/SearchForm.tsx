"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Search, Navigation2, ChevronDown, X, Loader2 } from "lucide-react"

interface Prediction {
  description: string
  placeId: string
}

export default function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [service, setService] = useState(searchParams.get("service") || "")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLocating, setIsLocating] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPredictions = useCallback(async (value: string) => {
    if (value.length < 2) { setPredictions([]); setShowDropdown(false); return }
    setIsFetching(true)
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(value)}`)
      const data = await res.json()
      setPredictions(data.predictions || [])
      setShowDropdown((data.predictions || []).length > 0)
      setActiveIndex(-1)
    } catch { /* silent */ }
    finally { setIsFetching(false) }
  }, [])

  const handleLocationChange = (value: string) => {
    setLocation(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchPredictions(value), 280)
  }

  const selectPrediction = (description: string) => {
    setLocation(description)
    setPredictions([])
    setShowDropdown(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, predictions.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)) }
    if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); selectPrediction(predictions[activeIndex].description) }
    if (e.key === "Escape") { setShowDropdown(false); setActiveIndex(-1) }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowDropdown(false)
    const params = new URLSearchParams()
    if (location.trim()) params.set("location", location.trim())
    if (service) params.set("service", service)
    router.push(`/?${params.toString()}`)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "User-Agent": "SolarFinder/1.0" } }
          )
          const data = await res.json()
          const place = data.address?.city || data.address?.town || data.address?.village || data.address?.county || ""
          if (place) { setLocation(place); setPredictions([]); setShowDropdown(false) }
        } catch { /* silent */ }
        setIsLocating(false)
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    )
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl shadow-black/30">

        {/* Location input with autocomplete */}
        <div className="relative flex-1 min-w-0">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <input
              ref={inputRef}
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => predictions.length > 0 && setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="City, town, or postcode…"
              autoComplete="off"
              className="w-full h-14 pl-11 pr-9 bg-white rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/60 shadow-sm font-medium text-[15px] transition-shadow"
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            )}
            {location && !isFetching && (
              <button
                type="button"
                onClick={() => { setLocation(""); setPredictions([]); setShowDropdown(false); inputRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showDropdown && predictions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-xl shadow-xl shadow-black/10 border border-slate-100 overflow-hidden z-50 animate-dropdown"
            >
              {predictions.map((p, i) => (
                <button
                  key={p.placeId}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectPrediction(p.description) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i === activeIndex ? "bg-orange-50 text-orange-700" : "text-slate-700 hover:bg-slate-50"
                  } ${i !== 0 ? "border-t border-slate-50" : ""}`}
                >
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${i === activeIndex ? "text-orange-500" : "text-slate-300"}`} />
                  <span className="text-sm font-medium truncate">{p.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Service select */}
        <div className="relative flex-shrink-0 md:w-52">
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full h-14 pl-4 pr-9 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/60 shadow-sm font-medium appearance-none text-[15px]"
          >
            <option value="">All Services</option>
            <option value="Solar Panels">Solar Panels</option>
            <option value="Solar & Battery">Solar &amp; Battery</option>
            <option value="Battery Storage Only">Battery Only</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="h-14 px-7 bg-orange-500 hover:bg-orange-600 active:scale-[0.97] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-150 flex items-center justify-center gap-2 whitespace-nowrap text-[15px]"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Use my location */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className="group flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-all duration-200 disabled:opacity-40"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
          ) : (
            <Navigation2 className="w-3.5 h-3.5 group-hover:text-orange-400 transition-colors" />
          )}
          {isLocating ? "Detecting…" : "Use my current location"}
        </button>
      </div>
    </form>
  )
}
