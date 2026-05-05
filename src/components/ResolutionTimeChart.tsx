import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResolutionTimeChartProps {
  data: { name: string; avg: number; count: number }[];
  maxAvg: number;
}

export default function ResolutionTimeChart({ data }: ResolutionTimeChartProps) {
  return (
    <div className="brutalist-card p-8 flex flex-col h-64 shadow-xl">
      <h3 className="tactical-label mb-8 opacity-40">Latency_Log [T_COMP]</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0', color: '#FFF' }}
              itemStyle={{ color: '#FF4D00', fontFamily: 'monospace', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="avg" 
              stroke="#FF4D00" 
              fillOpacity={1} 
              fill="url(#colorAvg)" 
              strokeWidth={3}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
