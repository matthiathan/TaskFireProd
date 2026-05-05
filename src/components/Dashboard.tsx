import { useMemo } from 'react';
import { PostgrestTask, UserProfile, Priority } from '@/src/types';
import { cn } from '@/src/lib/utils';
import ReportGenerator from './ReportGenerator';
import StatusDistribution from './StatusDistribution';
import ResolutionTimeChart from './ResolutionTimeChart';

interface DashboardProps {
  tasks: PostgrestTask[];
  profile: UserProfile | null;
}

/**
 * Dashboard serves as the command center for TaskFire.
 * It provides a high-level overview of operational metrics and real-time process streams.
 */
export default function Dashboard({ tasks, profile }: DashboardProps) {
  // Memoized strategic metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const completed = completedTasks.length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pendingReview = tasks.filter(t => t.status === 'pending_review').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    let totalHours = 0;
    let countWithTiming = 0;

    completedTasks.forEach(task => {
      if (task.started_at && task.completed_at) {
        const start = new Date(task.started_at).getTime();
        const end = new Date(task.completed_at).getTime();
        const diffHours = (end - start) / (1000 * 60 * 60);
        totalHours += diffHours;
        countWithTiming++;
      }
    });

    const averageCompletionTime = countWithTiming > 0 ? (totalHours / countWithTiming).toFixed(1) : '0';
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

    return { total, completed, inProgress, pendingReview, pending, averageCompletionTime, completionRate };
  }, [tasks]);

  const statusData = [
    { name: 'Completed', value: stats.completed, color: '#FF4D00' },
    { name: 'In Progress', value: stats.inProgress, color: '#FF9900' },
    { name: 'Review', value: stats.pendingReview, color: '#6366f1' },
    { name: 'Pending', value: stats.pending, color: 'rgba(255,255,255,0.2)' },
  ].filter(d => d.value > 0);

  const resolutionData = useMemo(() => {
    const priorities: Priority[] = ['low', 'medium', 'high'];
    return priorities.map(p => {
      const priorityTasks = tasks.filter(t => t.priority === p && t.status === 'completed' && t.started_at && t.completed_at);
      let totalHours = 0;
      priorityTasks.forEach(t => {
        const start = new Date(t.started_at!).getTime();
        const end = new Date(t.completed_at!).getTime();
        totalHours += (end - start) / (1000 * 60 * 60);
      });
      const avg = priorityTasks.length > 0 ? (totalHours / priorityTasks.length).toFixed(1) : '0';
      return { name: p.charAt(0).toUpperCase() + p.slice(1), avg: parseFloat(avg), count: priorityTasks.length };
    });
  }, [tasks]);

  const maxAvg = Math.max(...resolutionData.map(d => d.avg), 1);

  return (
    <div className="space-y-8 pb-10">
      {/* Executive Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/[0.03] pb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            {profile?.role === 'director' ? 'Executive Oversight' : 'Personal Terminal'}
          </h1>
          <p className="tactical-label mt-2 opacity-30 text-[9px]">
            {profile?.role === 'director' 
              ? 'Mission Control Access / Tier 1 Clearance' 
              : 'Field Operational Protocol Active'}
          </p>
        </div>
        {profile?.role === 'director' && <ReportGenerator tasks={tasks} stats={stats} />}
      </div>

      {/* Key Result Areas (KRA) Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Total Entities" 
          value={stats.total.toString()} 
          trend="+5.2%" 
          trendLabel="Portfolio Growth"
        />
        <SummaryCard 
          label="Conversion Yield" 
          value={`${stats.completionRate}%`} 
          progress={parseFloat(stats.completionRate)}
          trendLabel="Operational Success"
        />
        <SummaryCard 
          label="Avg Mission Latency" 
          value={`${stats.averageCompletionTime}h`} 
          trend="-0.8h"
          trendPositive={true}
          trendLabel="Velocity Score"
        />
        <SummaryCard 
          label="Active Deployments" 
          value={stats.inProgress.toString()} 
          trend="CONNECTED"
          isStatus={true}
          trendLabel="Network Status"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tactical Stream Feed */}
        <div className="lg:col-span-2 bg-surface border border-white/[0.03] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-sm font-display font-bold text-white tracking-wide">Live Operational Stream</h3>
            <span className="tactical-label flex items-center gap-2 text-[9px] opacity-40">
               <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#FF4D00]"></div>
               Grid Synchronized
            </span>
          </div>
          <div className="p-0 overflow-x-auto">
             <table className="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr className="tactical-label border-b border-white/[0.03] bg-white/[0.005] opacity-30">
                    <th className="px-8 py-4 font-normal text-[8px]">ID_REFERENCE</th>
                    <th className="px-8 py-4 font-normal text-[8px]">CLEARANCE_TIER</th>
                    <th className="px-8 py-4 font-normal text-[8px]">OPERATIONAL_STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {tasks.slice(0, 8).map(task => (
                    <tr key={task.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-4 text-[13px] font-medium text-white group-hover:text-primary transition-colors">{task.title}</td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2 py-0.5 border rounded-sm tactical-label text-[8px]",
                          task.priority === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          task.priority === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        )}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1 h-3 rounded-full",
                            task.status === 'completed' ? "bg-emerald-500" :
                            task.status === 'in_progress' ? "bg-primary animate-pulse" :
                            task.status === 'pending_review' ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" :
                            "bg-white/20"
                          )}></div>
                          <span className={cn(
                            "text-[10px] font-display font-medium tracking-wide uppercase",
                            task.status === 'completed' ? "text-emerald-500" :
                            task.status === 'in_progress' ? "text-primary" :
                            task.status === 'pending_review' ? "text-indigo-400" :
                            "text-slate-500"
                          )}>{task.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-600 text-xs italic">No operational data detected on current frequency</td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
        </div>


        {/* Strategic Analytics Visualization */}
        <div className="flex flex-col gap-1">
          <StatusDistribution 
            data={statusData} 
            completionRate={stats.completionRate} 
          />
          <ResolutionTimeChart 
            data={resolutionData} 
            maxAvg={maxAvg} 
          />
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  trend?: string;
  trendLabel?: string;
  trendPositive?: boolean;
  progress?: number;
  isStatus?: boolean;
}

function SummaryCard({ label, value, trend, trendLabel, trendPositive, progress, isStatus }: SummaryCardProps) {
  return (
    <div className="bg-surface border border-white/[0.03] p-8 rounded-2xl group transition-all hover:border-primary/20 cursor-default shadow-sm hover:shadow-primary/5">
      <div className="flex items-center justify-between mb-6">
        <p className="tactical-label opacity-30 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[9px]">
          <span className="w-1 h-2 bg-primary/20 group-hover:bg-primary rounded-full transition-colors"></span>
          {label}
        </p>
      </div>
      
      <div className="flex items-end justify-between relative z-10">
        <span className="text-4xl font-display font-bold text-white tracking-tight group-hover:text-primary transition-colors">{value}</span>
        {trend && (
          <div className="flex flex-col items-end">
            <span className={cn(
              "text-[10px] font-mono font-bold tracking-tight px-1.5 py-0.5 rounded",
              isStatus ? "text-slate-500 bg-white/5" : 
              trendPositive ? "text-emerald-500 bg-emerald-500/10" : "text-primary bg-primary/10"
            )}>
              {trend}
            </span>
            <span className="font-mono text-[7px] text-slate-600 tracking-widest uppercase mt-2">{trendLabel}</span>
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="w-full h-1 bg-white/5 overflow-hidden mt-8 rounded-full">
          <div className="bg-primary h-full transition-all duration-1000 shadow-[0_0_12px_#FF4D00]" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
}
