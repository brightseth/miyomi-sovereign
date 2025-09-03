import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'MIYOMI Sovereign',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    websocket: {
      enabled: !!process.env.NEXT_PUBLIC_WS_URL,
      url: process.env.NEXT_PUBLIC_WS_URL || null
    },
    database: {
      connected: !!process.env.DATABASE_URL,
      migrations: 'complete'
    },
    features: {
      live_trading: true,
      real_time_data: true,
      api_endpoints: true
    }
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, max-age=0',
    }
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}