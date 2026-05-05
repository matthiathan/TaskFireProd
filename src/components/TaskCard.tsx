import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, Activity, CheckCircle2, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { cn, formatDate, formatEnum } from '@/src/lib/utils';
import { PostgrestTask, Status } from '@/src/types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: PostgrestTask;
  idx: number;
  onUpdateStatus: (id: string, status: Status) => void;
  onEdit: (task: PostgrestTask) => void;
  onDelete: (id: string) => Promise<void>;
  key?: string | number;
}

/**
 * TaskCard represents a single tactical operation in the TaskList.
 * It features responsive controls and real-time status indicators.
 */
export default function TaskCard({ task, idx, onUpdateStatus, onEdit, onDelete }: TaskCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const executeDelete = async () => {
    if (window.confirm('Delete this task permanently?')) {
      await onDelete(task.id);
    }
  };

  const statusOptions: { label: string; value: Status; icon: any; color: string }[] = [
    { label: 'Pending', value: 'pending', icon: Clock, color: 'text-amber-500' },
    { label: 'Working', value: 'in_progress', icon: Activity, color: 'text-blue-500' },
    { label: 'Review', value: 'pending_review', icon: Activity, color: 'text-indigo-500' },
    { label: 'Complete', value: 'completed', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      key={task.id}
      className={cn(
        "group bg-surface border border-white/[0.03] hover:border-white/10 transition-all duration-300 rounded-lg overflow-hidden",
        task.status === 'completed' && "opacity-60"
      )}
    >
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Priority Rail */}
        <div className={cn(
          "w-full sm:w-1.5 h-1 sm:h-auto shrink-0 transition-opacity",
          task.priority === 'high' ? "bg-primary shadow-[0_0_12px_#FF4D00]" :
          task.priority === 'medium' ? "bg-amber-500/50" : "bg-slate-700"
        )}></div>

        <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className={cn(
                "tactical-label px-2 py-0.5 border rounded-sm text-[8px]",
                task.status === 'in_progress' ? "bg-primary/10 text-primary border-primary/20" :
                task.status === 'pending_review' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                task.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                "bg-white/5 text-slate-500 border-white/10"
              )}>
                {task.status.replace('_', ' ')}
              </span>
              
              {task.priority === 'high' && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary tracking-tight font-display">
                  <Activity className="w-3 h-3" />
                  CRITICAL_PRIORITY
                </span>
              )}
            </div>
            
            <h3 className={cn(
              "text-xl font-display font-bold text-white tracking-tight group-hover:text-primary transition-colors mb-1 truncate",
              task.status === 'completed' && "line-through text-slate-500"
            )}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-slate-500 text-sm line-clamp-1 font-medium">
                {task.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 shrink-0 sm:border-l sm:border-white/[0.03] sm:pl-8">
            <div className="space-y-1">
              <p className="tactical-label opacity-30 text-[7px]">Engagement</p>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3 h-3 text-primary/40" />
                <span className="text-[11px] font-mono font-medium">{task.start_date ? formatDate(task.start_date) : 'TBD'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="tactical-label opacity-30 text-[7px]">Deadline</p>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3 h-3 text-primary/40" />
                <span className="text-[11px] font-mono font-medium">{task.due_date ? formatDate(task.due_date) : 'TBD'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-px bg-white/[0.01] border-t sm:border-t-0 sm:border-l border-white/[0.03] shrink-0 p-1">
          <div className="flex items-center gap-1">
            {task.status === 'pending' && (
              <button 
                onClick={() => onUpdateStatus(task.id, 'in_progress')}
                className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-primary/10 text-primary transition-all active:scale-90"
                title="Start Work"
              >
                <Clock className="w-5 h-5" />
              </button>
            )}
            {task.status === 'in_progress' && (
              <button 
                onClick={() => onUpdateStatus(task.id, 'pending_review')}
                className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-indigo-500/10 text-indigo-400 transition-all active:scale-90"
                title="Submit Review"
              >
                <Activity className="w-5 h-5" />
              </button>
            )}
            {task.status === 'pending_review' && (
              <button 
                onClick={() => onUpdateStatus(task.id, 'completed')}
                className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-all active:scale-90"
                title="Approve"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}

            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={cn(
                  "w-12 h-12 flex items-center justify-center transition-all active:scale-90 rounded-md",
                  task.status === 'completed' ? "text-emerald-500" : "text-slate-600 hover:text-white hover:bg-white/5"
                )}
                title="Status Change"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", showStatusMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 bottom-full mb-2 w-48 bg-surface border border-white/10 shadow-2xl z-50 overflow-hidden rounded-lg p-1"
                    >
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            onUpdateStatus(task.id, opt.value);
                            setShowStatusMenu(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 flex items-center gap-3 text-xs font-display transition-colors text-left rounded-md",
                            task.status === opt.value ? "text-white bg-primary/10" : "text-slate-400 hover:bg-white/5"
                          )}
                        >
                          <opt.icon className={cn("w-3.5 h-3.5", task.status === opt.value ? opt.color : "opacity-40")} />
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-white/[0.03] ml-1 pl-1">
            <button 
              onClick={() => onEdit(task)}
              className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 rounded-md transition-all active:scale-90"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            <button 
              onClick={executeDelete}
              className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all active:scale-90"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
