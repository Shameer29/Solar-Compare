import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json({ predictions: [] })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ predictions: [] })

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&types=geocode&components=country:gb&key=${apiKey}`,
      { next: { revalidate: 300 } }
    )
    const data = await res.json()

    const predictions = (data.predictions || []).slice(0, 6).map((p: any) => ({
      description: p.description
        .replace(', UK', '')
        .replace(', United Kingdom', ''),
      placeId: p.place_id,
    }))

    return NextResponse.json({ predictions }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch {
    return NextResponse.json({ predictions: [] }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
}
