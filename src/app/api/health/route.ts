import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    service: 'lost-found-admin',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
