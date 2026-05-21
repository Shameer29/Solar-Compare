import { NextRequest, NextResponse } from 'next/server'
import { getCompanyDetails } from '@/lib/places'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params
  const details = await getCompanyDetails(placeId)

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (!details) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers })
  }
  return NextResponse.json(details, { headers })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
}
