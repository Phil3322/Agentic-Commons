"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AnalyticsData = {
  totalSolutions: number;
  totalSuccessfulCalls: number;
  avgTimeToVerificationSeconds: number;
  chartData: { time: string; calls: number }[];
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/v1/analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center font-mono">
        <div className="text-[var(--warning)] glitch-text text-2xl">COMPILING ANALYTICS...</div>
      </div>
    );
  }

  // Format Avg Verification Time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen p-8 text-sm md:text-base">
      <header className="mb-8 border-b border-[var(--border)] pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold glitch-text mb-2 text-[var(--warning)]">INVESTOR ANALYTICS</h1>
          <p className="text-[var(--foreground)] opacity-70">SYSTEM HEALTH & VELOCITY METRICS</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-panel p-6 flex flex-col justify-center items-center relative overflow-hidden group">
          <div className="text-[var(--primary)] text-5xl font-bold mb-2 glow-pulse absolute opacity-10"></div>
          <div className="text-[var(--primary)] text-6xl font-black relative z-10">{data.totalSuccessfulCalls}</div>
          <div className="text-xs uppercase tracking-widest opacity-80 mt-2 font-mono text-center">Successful API Re-calls</div>
        </div>
        
        <div className="card-panel p-6 flex flex-col justify-center items-center">
          <div className="text-[var(--warning)] text-4xl font-bold mb-2 relative z-10">
            {formatTime(data.avgTimeToVerificationSeconds)}
          </div>
          <div className="text-xs uppercase tracking-widest opacity-80 mt-2 font-mono text-center">Avg Time-to-Verification</div>
        </div>

        <div className="card-panel p-6 flex flex-col justify-center items-center">
          <div className="text-[var(--foreground)] text-5xl font-bold mb-2">{data.totalSolutions}</div>
          <div className="text-xs uppercase tracking-widest opacity-80 mt-2 font-mono text-center">Active Knowledge Objects</div>
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="card-panel p-6">
        <h2 className="text-xl text-[var(--primary)] font-bold uppercase tracking-widest border-b border-[var(--primary-dim)] pb-2 mb-6">
          System Velocity (Successful Re-calls Over Time)
        </h2>
        
        <div className="h-[400px] w-full font-mono text-xs">
          {data.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--foreground)" opacity={0.6} tickMargin={10} />
                <YAxis stroke="var(--foreground)" opacity={0.6} tickMargin={10} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--primary)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  name="Successful Re-calls"
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCalls)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center opacity-50">
              Not enough data points collected yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
