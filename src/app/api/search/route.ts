import { NextRequest, NextResponse } from 'next/server'
import { searchSolarCompanies } from '@/lib/places'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || ''
  const service = searchParams.get('service') || ''

  if (!location && !service) {
    return NextResponse.json({ companies: [] })
  }

  const result = await searchSolarCompanies(location, service)

  return NextResponse.json(result, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
