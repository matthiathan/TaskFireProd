import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDeadlines } from '../hooks/useDeadlines';
import { PostgrestTask } from '../types';
import { cn, formatEnum } from '../lib/utils';

interface NotificationCenterProps {
  tasks: PostgrestTask[];
  onTaskClick: (task: PostgrestTask) => void;
}

/**
 * Tactical Notification Center for monitoring mission-critical deadlines.
 */
export function NotificationCenter({ tasks, onTaskClick }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { urgentTasks, hasTodayDeadline, count } = useDeadlines(tasks);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside tactical zone
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Tactical Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-12 h-12 flex items-center justify-center border transition-all active:scale-95 group",
          isOpen 
            ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(255,77,0,0.3)]" 
            : "bg-white/5 border-white/10 text-slate-500 hover:border-primary hover:text-white"
        )}
      >
        <Bell className={cn(
          "w-5 h-5",
          hasTodayDeadline && !isOpen && "animate-[bell-shake_1s_infinite_ease-in-out]"
        )} />
        
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              hasTodayDeadline ? "bg-red-400" : "bg-primary/50"
            )}></span>
            <span className={cn(
              "relative inline-flex rounded-full h-4 w-4 items-center justify-center text-[9px] font-black text-white",
              hasTodayDeadline ? "bg-red-500" : "bg-primary"
            )}>
              {count}
            </span>
          </span>
        )}
      </button>

      {/* Operational Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-0 mt-6 w-96 brutalist-card shadow-[40px_40px_0_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">
                  Intelligence_Stream
                </h3>
                <p className="tactical-label opacity-40 mt-1 uppercase">Active_Grid_Status</p>
              </div>
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-primary animate-pulse"></div>
                 <div className="w-1.5 h-1.5 bg-primary/20"></div>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[480px] overflow-y-auto bg-bg-surface font-mono">
              {urgentTasks.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {urgentTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        onTaskClick(task);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-8 py-6 hover:bg-primary/5 transition-all group flex gap-5 items-start border-l-2 border-transparent hover:border-primary"
                    >
                      <div className={cn(
                        "mt-1 w-10 h-10 flex items-center justify-center shrink-0 border transition-colors",
                        task.urgency === 'today' 
                          ? "bg-red-500/10 text-red-500 border-red-500/20 group-hover:bg-red-500 group-hover:text-white" 
                          : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white"
                      )}>
                        {task.urgency === 'today' ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={cn(
                            "tactical-label",
                            task.urgency === 'today' ? "text-red-500" : "text-primary"
                          )}>
                            {task.urgency === 'today' ? '!!_DEADLINE_NOW' : '>>_UPCOMING'}
                          </span>
                        </div>
                        <h4 className="text-md font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors truncate">
                          {task.title}
                        </h4>
                        <p className="tactical-label opacity-40 mt-1">Tier: {task.priority}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-12 py-20 text-center">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 text-slate-700">
                    <Bell className="w-10 h-10 opacity-20" />
                  </div>
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-3">Alpha_Clear</h4>
                  <p className="tactical-label opacity-40 italic">
                    Zero tactical threats matching filter
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-white/10 bg-black/40 flex justify-between items-center">
              <span className="tactical-label opacity-20 tracking-tighter italic font-bold">GRID_SEC_v2.4.9</span>
              {count > 0 && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="tactical-label text-primary hover:text-white transition-colors"
                >
                  PURGE_HUD
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bell-shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
          90% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
