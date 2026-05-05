import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { PostgrestTask, Priority, Status } from '@/src/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingTask: PostgrestTask | null;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  priority: Priority;
  setPriority: (val: Priority) => void;
  status: Status;
  setStatus: (val: Status) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
  loading: boolean;
  error?: string | null;
}

/**
 * TaskModal provides the interface for creating and updating strategic entities.
 * It uses a tactical, dark-themed overlay consistent with the TaskFire branding.
 */
export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  status,
  setStatus,
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  loading,
  error
}: TaskModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="relative w-full max-w-lg brutalist-card shadow-[40px_40px_0_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
          >
            <div className="px-12 pt-12 pb-8 flex items-center justify-between border-b border-white/10 bg-white/[0.02] shrink-0">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                  {editingTask ? 'MOD_PARAMETERS' : 'TARGET_SPEC'}
                </h3>
                <p className="tactical-label opacity-40 mt-1 uppercase italic">Operational_Entry_v2.4</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all active:scale-95 group shrink-0"
                aria-label="Close modal"
              >
                <X className="w-8 h-8 group-hover:scale-90 transition-transform" />
              </button>
            </div>

            <div className="overflow-y-auto p-12 custom-scrollbar">
              <form onSubmit={onSubmit} className="space-y-8">
              {error && (
                <div className="p-5 bg-red-500/10 text-red-500 border border-red-500/20 tactical-label animate-pulse">
                  SYSTEM_CRITICAL: {error}
                </div>
              )}
              <div>
                <label className="tactical-label mb-3 block">Subject Header [TITLE]</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all placeholder:text-slate-700 font-mono tracking-tighter"
                  placeholder="INPUT_ID_STRING"
                />
              </div>
              <div>
                <label className="tactical-label mb-3 block">Strategic Scope [DESC]</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all resize-none placeholder:text-slate-700 leading-relaxed font-mono tracking-tighter"
                  placeholder="SPECIFY_OPERATIONAL_DETAILS..."
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="tactical-label mb-4 block">Criticality Tier [PRIORITY]</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          "py-4 px-2 border tactical-label transition-all text-[10px]",
                          priority === p 
                            ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(255,77,0,0.2)]" 
                            : "bg-white/5 text-slate-500 border-white/10 hover:border-white/30"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="tactical-label mb-4 block">Operational State [STATUS]</label>
                  <div className="grid grid-cols-2 gap-1">
                    {(['pending', 'in_progress', 'pending_review', 'completed'] as Status[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={cn(
                          "py-3 px-2 border tactical-label transition-all text-[9px] uppercase",
                          status === s 
                            ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(255,77,0,0.2)]" 
                            : "bg-white/5 text-slate-500 border-white/10 hover:border-white/30"
                        )}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="tactical-label mb-3 block">Activation Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all color-scheme-dark font-mono tracking-tighter"
                  />
                </div>
                <div>
                  <label className="tactical-label mb-3 block">Termination Deadline</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all color-scheme-dark font-mono tracking-tighter"
                  />
                </div>
              </div>

              <div className="flex gap-1 pt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-6 px-6 bg-white/5 text-slate-500 tactical-label hover:bg-white/10 hover:text-white border border-white/10 transition-all uppercase italic flex items-center justify-center gap-2 active:scale-95"
                >
                  <X className="w-5 h-5" />
                  Abort_CMD
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-6 px-6 bg-primary text-white tactical-label hover:bg-primary-light transition-all disabled:opacity-50 uppercase italic font-black flex items-center justify-center gap-2 active:scale-x-105 active:scale-y-95 shadow-[0_0_20px_rgba(255,77,0,0.1)]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {loading ? 'SYNCING...' : editingTask ? 'UPDATE_PARAM' : 'DEPLOY_RESOURCE'}
                </button>
              </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
