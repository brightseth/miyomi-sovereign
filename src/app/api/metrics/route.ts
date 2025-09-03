import { NextResponse } from 'next/server';

// Mock data service - in production this would connect to the database
export async function GET() {
  try {
    // Simulate real-time metrics calculation
    const baseMetrics = {
      winRate: 73.2 + (Math.random() * 4 - 2), // ±2% variation
      activePositions: Math.floor(6 + Math.random() * 4), // 6-10 range
      dailyEdge: 14.7 + (Math.random() * 3 - 1.5), // ±1.5% variation
      weeklyReturn: 187.3 + (Math.random() * 20 - 10), // ±10 variation
      monthlyPnl: 2840.50 + (Math.random() * 400 - 200),
      totalSignals: 247 + Math.floor(Math.random() * 3), // Incremental
      subscribers: 142 + Math.floor(Math.random() * 2), // Slow growth
      lastUpdated: new Date().toISOString()
    };

    // Recent activity simulation
    const activities = [
      'NEW SIGNAL: Fed Rate Decision Analysis',
      'POSITION UPDATE: Bitcoin volatility spike',
      'MARKET ALERT: Sports betting inefficiency detected',
      'CONTRARIAN THESIS: Election prediction reversing',
      'EDGE IDENTIFIED: AI prediction market gap'
    ];
    
    const recentActivity = activities[Math.floor(Math.random() * activities.length)];

    const response = {
      ...baseMetrics,
      recentActivity,
      timestamp: new Date().toISOString(),
      status: 'live'
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30', // 30 second cache
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}