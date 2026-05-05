import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { 
  LayoutDashboard, 
  ListTodo, 
  History as HistoryIcon, 
  LogOut, 
  Flame,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { UserProfile, PostgrestTask } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { Toaster, toast } from 'sonner';

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  key?: string | number;
}

/**
 * SidebarItem component for consistent navigation links.
 */
function SidebarItem({ icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-6 py-4 transition-all w-full text-left group relative border-l-2",
        active 
          ? "bg-primary/10 text-white border-primary" 
          : "text-slate-500 hover:bg-white/[0.02] hover:text-white border-transparent"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-primary" : "opacity-40")} />
      <span className={cn(
        "text-sm font-display font-medium tracking-wide transition-colors",
        active ? "text-white" : "group-hover:text-white"
      )}>{label}</span>
      
      {active && (
        <motion.div 
          layoutId="sidebar-glow"
          className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none"
        />
      )}
    </button>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile | null;
  tasks: PostgrestTask[];
}

/**
 * Layout serves as the main application shell, providing responsive navigation
 * and identity management for TaskFire operators.
 */
export default function Layout({ children, activeTab, setActiveTab, profile, tasks }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onNotificationClick = (task: PostgrestTask) => {
    setActiveTab('tasks');
    // We could potentially scroll to or highlight the task here
  };

  // Securely terminates the session
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Hard reset to clear reactive state
  };

  const navItems = [
    { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard },
    { id: 'tasks', label: 'Stream', icon: ListTodo },
    { id: 'history', label: 'Archive', icon: HistoryIcon },
  ];

  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 flex font-sans selection:bg-[#FF4D00]/30 selection:text-white">
      <Toaster 
        theme="dark" 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0F0F0F',
            border: '1px solid rgba(255, 77, 0, 0.2)',
            color: '#fff',
            borderRadius: '1rem',
            fontFamily: 'Inter, sans-serif'
          },
        }}
      />
      {/* Desktop Sidebar - Persistent on large screens */}
      <aside className="hidden lg:flex w-64 bg-[#0A0A0A] border-r border-white/10 flex-col p-8 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 fire-gradient flex items-center justify-center rounded shadow-[0_0_20px_rgba(255,77,0,0.3)]">
            <Flame className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-white">TaskFire</span>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="tactical-label mb-4 px-6 opacity-30 text-[9px]">Systems / Navigation</p>
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-8 border-t border-white/[0.03]">
          <p className="tactical-label px-6 opacity-30 text-[9px]">
            {profile?.role === 'director' ? 'Auth / Level Alpha' : 'Auth / Personnel'}
          </p>
          <div className="px-6 py-4 flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 rounded-lg text-primary font-mono font-bold">
                {userInitials}
             </div>
             <div className="min-w-0">
                <p className="text-[13px] font-display font-semibold text-white truncate leading-tight">{profile?.full_name || 'Anonymous'}</p>
                <p className="font-mono text-[9px] text-slate-500 truncate tracking-tight">{profile?.email}</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-red-500 transition-all text-left w-full group"
          >
            <LogOut className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="font-display text-xs font-medium tracking-wide">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F] border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center fire-gradient rounded shadow-[0_0_15px_rgba(255,77,0,0.3)]">
             <Flame className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-display font-bold text-white tracking-tight">TaskFire</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter tasks={tasks} onTaskClick={onNotificationClick} />
          <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-white/5 rounded-lg border border-white/10 text-white active:scale-95 transition-all outline-none"
              aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-3/4 max-w-sm bg-bg-surface border-l border-white/10 p-8 flex flex-col pt-24"
            >
              <nav className="flex-1 space-y-6">
                <p className="tactical-label px-4 opacity-40">Strategic Paths</p>
                {navItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                ))}
              </nav>
              
              <div className="mt-auto space-y-6">
                 <div className="flex items-center gap-3 p-5 bg-white/5 border border-white/10">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary font-mono font-black border border-primary/20">
                       {userInitials}
                    </div>
                    <div className="min-w-0">
                       <p className="text-sm font-black text-white truncate">{profile?.full_name}</p>
                       <p className="font-mono text-[10px] text-slate-500 truncate tracking-tight">{profile?.email}</p>
                    </div>
                 </div>
                 <button
                    onClick={handleLogout}
                    className="flex justify-center items-center gap-3 px-4 py-5 bg-red-500/5 text-red-500 tactical-label w-full border border-red-500/20 active:scale-95 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminate Auth</span>
                  </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Primary Viewport */}
      <main className="flex-1 flex flex-col min-w-0 pt-20 lg:pt-0">
        {/* Context Header - Visible on desktop */}
        <header className="hidden lg:flex h-24 items-center px-10 justify-between bg-bg-deep border-b border-white/[0.03] sticky top-0 z-30">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
              {activeTab === 'dashboard' ? 'OPERATIONAL MONITOR' : 
               activeTab === 'tasks' ? 'ACTIVE STREAM' : 'MISSION ARCHIVE'}
              <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_#FF4D00]"></div>
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationCenter tasks={tasks} onTaskClick={onNotificationClick} />
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 py-2 px-4 rounded-lg shadow-2xl transition-all group cursor-default">
              <div className="text-right">
                <p className="text-[13px] font-display font-semibold text-white group-hover:text-primary transition-colors leading-tight">{profile?.full_name || 'STAFF'}</p>
                <p className="tactical-label opacity-30 text-[8px] mt-0.5">
                  {profile?.role === 'director' ? 'CLEARANCE: LEVEL ALPHA' : 'CLEARANCE: PERSONNEL'}
                </p>
              </div>
              <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 rounded group-hover:border-primary transition-colors">
                <span className="font-mono text-xs font-bold text-primary">{userInitials}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tactical Interaction Section */}
        <section className="flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-12 bg-bg-deep relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
