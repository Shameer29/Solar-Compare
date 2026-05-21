export interface Company {
  id: string
  name: string
  address: string
  phone: string
  website: string
  rating: number | null
  reviewCount: number
  isOpen: boolean | null
  photoUrl: string | null
  logoUrl: string | null
  mapsUrl: string
  distanceKm: number | null
  initial: string
}

export interface Review {
  author: string
  authorPhoto: string | null
  rating: number
  text: string
  timeAgo: string
}

export interface CompanyDetails extends Company {
  reviews: Review[]
  openingHours: string[]
  multiplePhotos: (string | null)[]
  types: string[]
  editorialSummary?: string
}

const SERVICE_QUERIES: Record<string, string> = {
  'Solar Panels': 'solar panel installation',
  'Solar & Battery': 'solar panel and battery storage',
  'Battery Storage Only': 'home battery storage installer',
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function resolvePhotoUrl(photoRef: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`,
      { redirect: 'manual', cache: 'force-cache' }
    )
    return res.headers.get('location') || null
  } catch {
    return null
  }
}

async function getPlaceDetails(placeId: string, apiKey: string): Promise<{ phone: string; website: string }> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return {
      phone: data.result?.formatted_phone_number || '',
      website: data.result?.website || '',
    }
  } catch {
    return { phone: '', website: '' }
  }
}

export async function searchSolarCompanies(
  location: string,
  service: string
): Promise<{ companies: Company[]; error?: string; searchCoords?: { lat: number; lng: number } }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return { companies: [], error: 'API_KEY_MISSING' }

  const serviceQuery = SERVICE_QUERIES[service] || 'solar energy company'
  const query = location
    ? `${serviceQuery} near ${location} UK`
    : `${serviceQuery} UK`

  // Geocode to get coordinates
  let searchCoords: { lat: number; lng: number } | undefined
  if (location) {
    try {
      const geo = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location + ', UK')}&key=${apiKey}`,
        { next: { revalidate: 3600 } }
      )
      const geoData = await geo.json()
      const loc = geoData.results?.[0]?.geometry?.location
      if (loc) searchCoords = { lat: loc.lat, lng: loc.lng }
    } catch { /* continue without coords */ }
  }

  // Text Search
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  searchUrl.searchParams.set('query', query)
  searchUrl.searchParams.set('region', 'gb')
  searchUrl.searchParams.set('key', apiKey)
  if (searchCoords) {
    searchUrl.searchParams.set('location', `${searchCoords.lat},${searchCoords.lng}`)
    searchUrl.searchParams.set('radius', '75000')
  }

  try {
    const res = await fetch(searchUrl.toString(), { cache: 'no-store' })
    if (!res.ok) return { companies: [], error: 'Search failed. Please try again.' }

    const data = await res.json()
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return { companies: [], error: data.error_message || `API error: ${data.status}` }
    }

    const places: any[] = (data.results || [])
      .filter((p: any) => p.business_status !== 'CLOSED_PERMANENTLY')
      .slice(0, 12)

    // Fetch details + photos in parallel for all places
    const enriched = await Promise.all(
      places.map(async (place) => {
        const [details, photoUrl] = await Promise.all([
          getPlaceDetails(place.place_id, apiKey),
          place.photos?.[0]?.photo_reference
            ? resolvePhotoUrl(place.photos[0].photo_reference, apiKey)
            : Promise.resolve(null),
        ])

        const lat = place.geometry?.location?.lat
        const lng = place.geometry?.location?.lng
        const distanceKm =
          searchCoords && lat && lng
            ? haversineKm(searchCoords.lat, searchCoords.lng, lat, lng)
            : null

        const logoUrl = details.website
          ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(details.website)}`
          : null

        return {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address || '',
          phone: details.phone,
          website: details.website,
          rating: typeof place.rating === 'number' ? place.rating : null,
          reviewCount: place.user_ratings_total ?? 0,
          isOpen: place.opening_hours?.open_now ?? null,
          photoUrl,
          logoUrl,
          mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          distanceKm,
          initial: place.name?.charAt(0)?.toUpperCase() || 'S',
        } satisfies Company
      })
    )

    // Sort by distance if available
    if (searchCoords) {
      enriched.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    }

    return { companies: enriched, searchCoords }
  } catch (e) {
    return { companies: [], error: 'Connection failed. Please check your network and try again.' }
  }
}

export async function getCompanyDetails(placeId: string): Promise<CompanyDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,opening_hours,photos,types,editorial_summary,business_status,url&key=${apiKey}`,
      { next: { revalidate: 1800 } }
    )
    const data = await res.json()
    const r = data.result
    if (!r) return null

    const photoRefs: string[] = (r.photos || []).slice(0, 5).map((p: any) => p.photo_reference)
    const multiplePhotos = await Promise.all(photoRefs.map(ref => resolvePhotoUrl(ref, apiKey)))

    const logoUrl = r.website
      ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(r.website)}`
      : null

    const reviews: Review[] = (r.reviews || []).map((rv: any) => ({
      author: rv.author_name || 'Anonymous',
      authorPhoto: rv.profile_photo_url || null,
      rating: rv.rating || 0,
      text: rv.text || '',
      timeAgo: rv.relative_time_description || '',
    }))

    return {
      id: placeId,
      name: r.name,
      address: r.formatted_address || '',
      phone: r.formatted_phone_number || '',
      website: r.website || '',
      rating: typeof r.rating === 'number' ? r.rating : null,
      reviewCount: r.user_ratings_total ?? 0,
      isOpen: r.opening_hours?.open_now ?? null,
      photoUrl: multiplePhotos[0] || null,
      logoUrl,
      mapsUrl: r.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      distanceKm: null,
      initial: r.name?.charAt(0)?.toUpperCase() || 'S',
      reviews,
      openingHours: r.opening_hours?.weekday_text || [],
      multiplePhotos,
      types: r.types || [],
      editorialSummary: r.editorial_summary?.overview,
    }
  } catch {
    return null
  }
}
