# MIYOMI Sovereign Trading Interface

**Live at:** https://miyomi.eden2.io

## Overview
Standalone contrarian oracle trading interface with real-time market predictions, live WebSocket data, and no wrapper dependencies.

## Features

### 🎯 Live Trading Interface
- Real-time market picks with confidence scores
- Edge calculations and P&L tracking  
- WebSocket streaming with fallback polling
- 3x daily signal drops (11:00, 15:00, 21:00 ET)

### 📊 Performance Metrics
- Live win rate tracking
- Active positions monitoring
- Daily edge calculations
- Weekly/monthly returns

### ⚡ Real-time Data
- WebSocket connection for live updates
- Database integration ready (014_miyomi_launch.sql)
- API endpoints for metrics and picks
- Health monitoring at /_health

## Architecture

### Tech Stack
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Styling:** Tailwind CSS + Eden Academy design system
- **Database:** Supabase with migration schema
- **Deployment:** Vercel with custom domain routing

### API Endpoints
- `GET /api/health` - Service health check
- `GET /api/metrics` - Live performance metrics
- `GET /api/picks?limit=20` - Recent market picks

### Database Schema
Uses `014_miyomi_launch.sql` migration:
- `miyomi_picks` - Market predictions and outcomes
- `miyomi_performance` - Daily aggregated stats  
- `miyomi_config` - Agent configuration

## Deployment

### Prerequisites
```bash
# Environment variables required
DATABASE_URL=postgresql://...
WS_SOURCE=wss://api.miyomi.eden2.io/ws
NEXT_PUBLIC_WS_URL=wss://api.miyomi.eden2.io/ws
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Build & Deploy
```bash
npm install
npm run build
vercel deploy --prod
```

### DNS Configuration
Domain `miyomi.eden2.io` routes to this standalone deployment via wildcard routing configured in `/Users/seth/ops-eden2-wildcard/`.

## Exit Criteria (✅ Complete)

- [x] Live stream visible (WebSocket + polling fallback)
- [x] Database schema ready (014_miyomi_launch.sql)  
- [x] Health endpoint working (`/_health` → 200 JSON)
- [x] Domain resolves (`dig miyomi.eden2.io` → valid IPs)
- [x] No wrapper dependencies (standalone deployment)

## Performance Features

### Real-time Updates
- WebSocket connection with auto-reconnect
- Fallback to 30-second polling
- Live activity stream
- Metrics refresh every 30 seconds

### Eden Academy Design System
- Black/white color scheme with Helvetica typography
- Consistent spacing with 8px grid system
- Live data animations (pulse effects)
- Mobile-responsive layout

## Trading Features

### Market Coverage
- Kalshi, Polymarket, Manifold, Melee
- Categories: Politics, Sports, Finance, AI, Pop Culture
- Position tracking: YES/NO with confidence scores
- Edge calculation: Confidence - Market Price

### Signal Distribution  
- 3x daily automated drops
- Real-time countdown to next signal
- Subscription tiers ($5/mo premium)
- Free signal previews

---

**Status:** 🟢 Production Ready  
**Last Updated:** 2025-08-29  
**Version:** 1.0.0