import { NextRequest, NextResponse } from 'next/server';

// Mock picks data - in production this would query the miyomi_picks table
const generateMockPicks = (count: number) => {
  const markets = [
    'Will Fed cut rates in March 2025?',
    'Bitcoin above $100k by Dec 2025?',
    'Will ChatGPT-5 be released in 2025?',
    'Trump to announce 2028 campaign before July?',
    'NBA Finals winner odds shift >20%?',
    'Ethereum ETF approval before Q2 2025?',
    'Major tech earnings beat expectations?',
    'Polymarket volume exceeds $1B monthly?'
  ];
  
  const platforms = ['Kalshi', 'Polymarket', 'Manifold', 'Melee'];
  const categories = ['finance', 'politics', 'ai', 'sports', 'pop'];
  
  return Array.from({ length: count }, (_, i) => {
    const market = markets[Math.floor(Math.random() * markets.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const position = Math.random() > 0.5 ? 'YES' : 'NO';
    const entryOdds = 0.3 + Math.random() * 0.4; // 0.3-0.7 range
    const currentOdds = entryOdds + (Math.random() * 0.2 - 0.1); // ±0.1 variation
    const confidence = 0.6 + Math.random() * 0.3; // 0.6-0.9 range
    const edge = confidence - entryOdds;
    
    const statuses = ['LIVE', 'WIN', 'LOSS', 'PENDING'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // More LIVE positions
    const randomNum = Math.random();
    let status = statuses[0];
    let cumulative = 0;
    
    for (let j = 0; j < statuses.length; j++) {
      cumulative += weights[j];
      if (randomNum <= cumulative) {
        status = statuses[j];
        break;
      }
    }
    
    // Calculate P&L for resolved positions
    let pnl = null;
    if (status === 'WIN') {
      pnl = 100 + Math.random() * 400; // $100-500 wins
    } else if (status === 'LOSS') {
      pnl = -(50 + Math.random() * 150); // $50-200 losses
    }
    
    return {
      id: `pick_${Date.now()}_${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      market,
      platform,
      position,
      confidence,
      edge,
      entryOdds,
      currentOdds: Math.max(0.01, Math.min(0.99, currentOdds)),
      status,
      category,
      pnl
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    // In production, this would be a database query like:
    // const picks = await db.query(`
    //   SELECT * FROM miyomi_picks 
    //   WHERE ($1::text IS NULL OR status = $1)
    //   AND ($2::text IS NULL OR category = $2)
    //   ORDER BY timestamp DESC 
    //   LIMIT $3
    // `, [status, category, limit]);
    
    let picks = generateMockPicks(limit);
    
    // Apply filters
    if (status) {
      picks = picks.filter(pick => pick.status.toLowerCase() === status.toLowerCase());
    }
    
    if (category) {
      picks = picks.filter(pick => pick.category.toLowerCase() === category.toLowerCase());
    }
    
    const response = {
      picks,
      total: picks.length,
      timestamp: new Date().toISOString(),
      filters: { status, category, limit }
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60', // 1 minute cache
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Picks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch picks' },
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