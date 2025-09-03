'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, DollarSign, Activity, Clock, Target,
  Play, CheckCircle, XCircle, Minus, ArrowUpRight,
  BarChart3, Zap, Eye, Twitter, Youtube
} from 'lucide-react';

// Types
interface MarketPick {
  id: string;
  timestamp: string;
  market: string;
  platform: string;
  position: 'YES' | 'NO';
  confidence: number;
  edge: number;
  entryOdds: number;
  currentOdds?: number;
  status: 'PENDING' | 'WIN' | 'LOSS' | 'LIVE';
  category: string;
  pnl?: number;
}

interface LiveMetrics {
  winRate: number;
  activePositions: number;
  dailyEdge: number;
  weeklyReturn: number;
  monthlyPnl: number;
  totalSignals: number;
  subscribers: number;
  recentActivity: string;
}

interface WebSocketMessage {
  type: 'METRICS_UPDATE' | 'NEW_PICK' | 'PICK_UPDATE' | 'SYSTEM_STATUS';
  data: any;
  timestamp: string;
}

export default function MiyomiSovereign() {
  // Core state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    winRate: 73.2,
    activePositions: 8,
    dailyEdge: 14.7,
    weeklyReturn: 187.3,
    monthlyPnl: 2840.50,
    totalSignals: 247,
    subscribers: 142,
    recentActivity: 'NEW SIGNAL: Fed Rate Decision Analysis'
  });
  
  const [recentPicks, setRecentPicks] = useState<MarketPick[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [nextDrop, setNextDrop] = useState<Date | null>(null);
  
  // WebSocket connection for live data
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.miyomi.eden2.io/ws';
    let ws: WebSocket | null = null;
    let reconnectInterval: NodeJS.Timeout;
    
    const connectWebSocket = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('📡 MIYOMI WebSocket connected');
          setWsConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('📡 MIYOMI WebSocket disconnected');
          setWsConnected(false);
          // Reconnect after 5 seconds
          reconnectInterval = setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        // Fallback to polling if WebSocket fails
        startPollingFallback();
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) ws.close();
      if (reconnectInterval) clearTimeout(reconnectInterval);
    };
  }, []);
  
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'METRICS_UPDATE':
        setLiveMetrics(prev => ({ ...prev, ...message.data }));
        break;
      case 'NEW_PICK':
        setRecentPicks(prev => [message.data, ...prev.slice(0, 19)]);
        break;
      case 'PICK_UPDATE':
        setRecentPicks(prev => prev.map(pick => 
          pick.id === message.data.id ? { ...pick, ...message.data } : pick
        ));
        break;
    }
  }, []);
  
  const startPollingFallback = useCallback(() => {
    const pollData = async () => {
      try {
        const [metricsRes, picksRes] = await Promise.all([
          fetch('/api/metrics'),
          fetch('/api/picks?limit=20')
        ]);
        
        if (metricsRes.ok) {
          const metrics = await metricsRes.json();
          setLiveMetrics(prev => ({ ...prev, ...metrics }));
        }
        
        if (picksRes.ok) {
          const picks = await picksRes.json();
          setRecentPicks(picks);
        }
      } catch (error) {
        console.error('Polling fallback error:', error);
      }
    };
    
    // Poll every 30 seconds as fallback
    const interval = setInterval(pollData, 30000);
    pollData(); // Initial load
    
    return () => clearInterval(interval);
  }, []);
  
  // Time and drop calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      calculateNextDrop();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const calculateNextDrop = () => {
    const now = new Date();
    const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const dropTimes = ['11:00', '15:00', '21:00'];
    
    for (const time of dropTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const dropTime = new Date(etNow);
      dropTime.setHours(hours, minutes, 0, 0);
      
      if (dropTime > etNow) {
        setNextDrop(dropTime);
        return;
      }
    }
    
    // Tomorrow's first drop
    const tomorrow = new Date(etNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    setNextDrop(tomorrow);
  };
  
  const getTimeUntilNextDrop = (): string => {
    if (!nextDrop) return 'Calculating...';
    
    const diff = nextDrop.getTime() - currentTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Data loading on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load from database or set fallback data
        const response = await fetch('/api/miyomi/picks?limit=20');
        if (response.ok) {
          const data = await response.json();
          setRecentPicks(data.picks || []);
        } else {
          // Fallback data for development
          setRecentPicks([
            {
              id: '1',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              market: 'Will Fed cut rates in March 2025?',
              platform: 'Kalshi',
              position: 'NO',
              confidence: 0.73,
              edge: 0.18,
              entryOdds: 0.65,
              currentOdds: 0.58,
              status: 'LIVE',
              category: 'finance',
              pnl: 145.50
            },
            {
              id: '2',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              market: 'Bitcoin above $100k by Dec 2025?',
              platform: 'Polymarket',
              position: 'YES',
              confidence: 0.68,
              edge: 0.15,
              entryOdds: 0.53,
              currentOdds: 0.59,
              status: 'WIN',
              category: 'finance',
              pnl: 324.75
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);
  
  const getCategoryEmoji = (category: string): string => {
    const emojis: Record<string, string> = {
      politics: '🏛️',
      sports: '🏆', 
      finance: '📈',
      ai: '🤖',
      pop: '✨',
      geo: '🌍',
      internet: '💻'
    };
    return emojis[category] || '🎯';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WIN': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'LOSS': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'LIVE': return <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/20 sticky top-0 z-50 bg-black/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold eden-text-header bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                MIYOMI
              </h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 pulse-green' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-400">
                  {wsConnected ? 'LIVE' : 'RECONNECTING'}
                </span>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <a href="https://twitter.com/miyomi_markets" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@miyomi" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition">
                <Youtube className="w-5 h-5" />
              </a>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString('en-US', { 
                  timeZone: 'America/New_York',
                  hour12: false 
                })} ET
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Live Metrics */}
      <section className="py-12 px-6 border-b border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Main Metrics */}
            <div className="lg:col-span-2">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 eden-text-header">
                CONTRARIAN ORACLE
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                AI-driven market analysis finding inefficiencies where consensus gets comfortable • Git Deployment Active
              </p>
              
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="eden-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 eden-text-header">Win Rate</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-green-500">
                    {liveMetrics.winRate.toFixed(1)}%
                  </div>
                </div>
                
                <div className="eden-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 eden-text-header">Active</span>
                    <Activity className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-500">
                    {liveMetrics.activePositions}
                  </div>
                </div>
                
                <div className="eden-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 eden-text-header">Daily Edge</span>
                    <Target className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-500">
                    {liveMetrics.dailyEdge.toFixed(1)}%
                  </div>
                </div>
                
                <div className="eden-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 eden-text-header">7D Return</span>
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-purple-500">
                    +{liveMetrics.weeklyReturn.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Next Drop Countdown */}
            <div className="lg:col-span-1">
              <div className="eden-card h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400 eden-text-header">NEXT SIGNAL</span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-4xl font-mono font-bold text-red-500 mb-4">
                  {getTimeUntilNextDrop()}
                </div>
                <div className="text-sm text-gray-400 mb-6">
                  Daily drops at 11:00, 15:00, 21:00 ET
                </div>
                
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg font-bold hover:opacity-90 transition">
                    Subscribe $5/mo
                  </button>
                  <button className="w-full px-4 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition">
                    Free Signals
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="eden-card">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="font-bold eden-text-header">LIVE ACTIVITY</span>
            </div>
            <p className="text-green-400 font-mono">{liveMetrics.recentActivity}</p>
          </div>
        </div>
      </section>

      {/* Recent Picks */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold eden-text-header">RECENT SIGNALS</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{liveMetrics.totalSignals} total signals</span>
              <span>•</span>
              <span>{liveMetrics.subscribers} subscribers</span>
            </div>
          </div>

          <div className="space-y-4">
            {recentPicks.map(pick => (
              <div key={pick.id} className="eden-card hover:bg-white/10 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{getCategoryEmoji(pick.category)}</span>
                      <h3 className="text-xl font-bold">{pick.market}</h3>
                      {getStatusIcon(pick.status)}
                    </div>
                    
                    <div className="grid md:grid-cols-5 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 eden-text-header">Platform</div>
                        <div className="font-bold">{pick.platform}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 eden-text-header">Position</div>
                        <div className={`font-bold ${pick.position === 'YES' ? 'text-green-500' : 'text-red-500'}`}>
                          {pick.position}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 eden-text-header">Edge</div>
                        <div className="font-bold text-yellow-500">{(pick.edge * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 eden-text-header">Odds</div>
                        <div className="font-bold">
                          {(pick.entryOdds * 100).toFixed(0)}% → {pick.currentOdds ? `${(pick.currentOdds * 100).toFixed(0)}%` : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 eden-text-header">P&L</div>
                        <div className={`font-bold ${pick.pnl && pick.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pick.pnl ? `$${pick.pnl.toFixed(2)}` : '—'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-500">
                      {new Date(pick.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'America/New_York'
                      })} ET
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <button className="p-3 bg-red-600 rounded-lg hover:bg-red-700 transition">
                      <Play className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-400">
            © 2025 MIYOMI - Contrarian Market Oracle • Live at miyomi.eden2.io
          </div>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/miyomi_markets" className="hover:text-red-500 transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://youtube.com/@miyomi" className="hover:text-red-500 transition">
              <Youtube className="w-5 h-5" />
            </a>
            <div className="text-sm hover:text-red-500 transition">
              API Status: {wsConnected ? 'Connected' : 'Reconnecting...'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}