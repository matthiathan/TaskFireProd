import { useState, useMemo } from 'react';
import { PostgrestTask, Priority, Status } from '@/src/types';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  Archive,
  Trash2,
  Trash,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn, formatDate } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
// No taskService import needed here

interface HistoryProps {
  tasks: PostgrestTask[];
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, newStatus: Status) => Promise<void>;
}

/**
 * History provides an audited view of all completed tactical operations.
 * It includes advanced filtering and strategic sorting capabilities.
 */
export default function History({ tasks, onDelete, onUpdateStatus }: HistoryProps) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');

  // Strategic data transformation
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                             t.description?.toLowerCase().includes(search.toLowerCase());
        const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
        return matchesSearch && matchesPriority;
      })
      .sort((a, b) => {
        const dateA = new Date(a.completed_at || 0).getTime();
        const dateB = new Date(b.completed_at || 0).getTime();
        return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [tasks, search, priorityFilter, dateSort]);

  const handleReactivate = async (id: string) => {
    toast.promise(onUpdateStatus(id, 'pending'), {
      loading: 'REACTIVATING OPERATION...',
      success: 'ENTITY RESTORED TO ACTIVE STREAM',
      error: 'REACTIVATION FAILURE'
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this task?')) return;
    
    const deletionPromise = onDelete(id);
    
    toast.promise(deletionPromise, {
      loading: 'Deleting task...',
      success: 'Task permanently deleted.',
      error: (err: any) => `Deletion failed: ${err.message}`
    });

    return deletionPromise;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Search and Filters Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/[0.03] pb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Mission Archive
          </h1>
          <p className="tactical-label mt-2 opacity-30 text-[9px]">
            Audited Operational Logs / Persistent Records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface border border-white/[0.03] px-6 py-3 rounded-xl flex items-center gap-4">
            <Archive className="w-5 h-5 text-primary opacity-50" />
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-white leading-none">
                {filteredTasks.length}
              </span>
              <span className="tactical-label opacity-30 text-[8px] mt-1 shrink-0 uppercase tracking-widest leading-none">Entities</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 opacity-40" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface border border-white/[0.03] text-white focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all font-sans text-sm rounded-xl"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-6 py-4 bg-surface border border-white/[0.03] rounded-xl flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-primary opacity-40" />
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-transparent text-xs border-none outline-none text-slate-400 font-display font-medium uppercase tracking-widest cursor-pointer w-full"
            >
              <option value="All" className="bg-bg-deep">All Priorities</option>
              <option value="high" className="bg-bg-deep">High Priority</option>
              <option value="medium" className="bg-bg-deep">Medium Risk</option>
              <option value="low" className="bg-bg-deep">Low Impact</option>
            </select>
          </div>

          <button 
            onClick={() => setDateSort(s => s === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-between gap-6 px-6 py-4 bg-surface border border-white/[0.03] hover:border-white/10 transition-all rounded-xl flex-1 sm:flex-initial group"
          >
            <div className="flex items-center gap-3">
              <ArrowUpDown className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs font-display font-medium text-slate-400 group-hover:text-white uppercase tracking-wider">
                {dateSort === 'desc' ? 'Latest First' : 'Oldest First'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Audit Log Table - with mobile card degradation */}
      <div className="bg-surface border border-white/[0.03] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="tactical-label border-b border-white/[0.03] bg-white/[0.01] opacity-30">
                <th className="px-8 py-4 text-[9px] font-normal">MISSION_REFERENCE</th>
                <th className="px-8 py-4 text-[9px] font-normal">RANK</th>
                <th className="px-8 py-4 text-[9px] font-normal">DEPLOYMENT</th>
                <th className="px-8 py-4 text-[9px] font-normal">RESOLUTION</th>
                <th className="px-8 py-4 text-right text-[9px] font-normal">COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <AnimatePresence initial={false}>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-600">
                      <div className="flex flex-col items-center">
                        <Archive className="w-12 h-12 mb-4 text-primary opacity-10" />
                        <p className="text-xs font-display font-medium uppercase tracking-widest opacity-40 italic">Zero matches detected</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, idx) => (
                    <motion.tr 
                      key={task.id} 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-white/[0.01] transition-colors group cursor-default"
                    >
                      <td className="px-8 py-5">
                        <div className="text-[13px] font-display font-semibold text-white group-hover:text-primary transition-colors">{task.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm mt-1 leading-tight font-medium">{task.description || 'NO_PAYLOAD_DATA'}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2 py-0.5 border rounded-sm tactical-label text-[8px]",
                           task.priority === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                           task.priority === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                           "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        )}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[11px] font-mono font-medium text-slate-500">
                        {formatDate(task.started_at)}
                      </td>
                      <td className="px-8 py-5 text-[11px] font-mono font-bold text-emerald-500">
                        {formatDate(task.completed_at)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleReactivate(task.id)}
                            className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all active:scale-95"
                            title="Reactivate Mission"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
                            title="Erase History"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>


        {/* Mobile-Only Stacked Cards */}
        <div className="md:hidden divide-y divide-white/[0.03]">
           {filteredTasks.length === 0 ? (
             <div className="px-8 py-20 text-center text-slate-600">
                <Archive className="w-12 h-12 mb-4 text-primary opacity-10 mx-auto" />
                <p className="text-xs font-display font-medium uppercase tracking-widest opacity-40 italic">Empty Audit Log</p>
             </div>
           ) : (
             filteredTasks.map((task) => (
                <div key={task.id} className="p-8 space-y-6">
                   <div>
                      <div className="flex justify-between items-start gap-4 mb-3">
                         <h4 className="text-lg font-display font-bold text-white tracking-tight">{task.title}</h4>
                         <span className={cn(
                           "px-2 py-0.5 border rounded-sm tactical-label text-[8px] shrink-0",
                            task.priority === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            task.priority === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-slate-500/10 text-slate-500 border-slate-500/20"
                         )}>
                           {task.priority}
                         </span>
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 border-l border-white/5 pl-4 font-medium italic">
                          {task.description}
                        </p>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                         <span className="text-[7px] text-slate-600 uppercase tracking-widest block mb-1">Engaged</span>
                         <span className="text-[10px] font-mono font-medium text-slate-500">{formatDate(task.started_at)}</span>
                      </div>
                      <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                         <span className="text-[7px] text-emerald-500/50 uppercase tracking-widest block mb-1">Resolved</span>
                         <span className="text-[10px] font-mono font-bold text-emerald-500">{formatDate(task.completed_at)}</span>
                      </div>
                   </div>

                   <div className="flex gap-2">
                      <button
                        onClick={() => handleReactivate(task.id)}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 text-[10px] font-display font-bold uppercase tracking-wider"
                      >
                         <RefreshCw className="w-3.5 h-3.5" />
                         Reactivate
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-red-500 transition-all flex items-center justify-center gap-2 text-[10px] font-display font-bold uppercase tracking-wider"
                      >
                         <Trash2 className="w-3.5 h-3.5" />
                         Delete
                      </button>
                   </div>
                </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
