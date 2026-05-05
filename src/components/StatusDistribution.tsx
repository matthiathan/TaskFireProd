import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusDistributionProps {
  data: { name: string; value: number; color: string }[];
  completionRate: string;
}

export default function StatusDistribution({ data, completionRate }: StatusDistributionProps) {
  return (
    <div className="brutalist-card p-8 shadow-xl flex-1">
      <h3 className="tactical-label mb-8 opacity-40">Load_Dist [STATUS]</h3>
      <div className="h-[250px] w-full min-h-[250px] relative">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={95}
              paddingAngle={0}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0', color: '#FFF' }}
              itemStyle={{ color: '#FFF', fontFamily: 'monospace', fontSize: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="block text-4xl font-black text-white tracking-tighter uppercase italic">{completionRate}%</span>
          <span className="tactical-label opacity-40">Efficient</span>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 font-mono">
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <div className="w-1.5 h-3" style={{ backgroundColor: d.color }}></div>
              {d.name}
            </div>
            <span className="text-xs font-black text-white">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
