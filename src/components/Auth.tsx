import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { LogIn, UserPlus, Flame, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

/**
 * Auth provides the primary tactical access point for the application.
 * It handles identity verification and new operator registration.
 */
export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Orchestrates the authentication lifecycle.
   */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError("Security hashes do not match. Verification failed.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (error) throw error;
        // Instruction to the user
        setError('Verification link dispatched. Please check your terminal (email).');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep p-4 relative overflow-hidden selection:bg-primary/30">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(255,77,0,0.3)] border-2 border-white/20 relative group">
            <Flame className="text-white w-10 h-10 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-2 -right-4 bg-white text-primary text-[8px] font-mono font-black px-1.5 py-0.5 leading-none border border-primary uppercase">v2.4_ACT</div>
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">TaskFire</h1>
            <p className="tactical-label opacity-40 mt-3">Node_Authorization_Required</p>
          </div>
        </div>

        <div className="brutalist-card p-10 shadow-[20px_20px_0_rgba(0,0,0,0.5)]">
          <div className="mb-8 border-b border-white/5 pb-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
              {isSignUp ? 'INITIALIZE_NODE' : 'AUTH_UPLINK'}
            </h2>
            <p className="tactical-label opacity-40 mt-1">
              {isSignUp ? 'Deploying new credentials' : 'Verifying unique identifier'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div>
                    <label className="tactical-label mb-2 block">Operator_TAG</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-5 py-3 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all placeholder:text-slate-800 font-mono text-xs tracking-tighter"
                      placeholder="e.g._DIRECTOR_01"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="tactical-label mb-2 block">Network_ID</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all placeholder:text-slate-800 font-mono text-xs tracking-tighter"
                placeholder="OP_EMAIL@CORE"
              />
            </div>

            <div>
              <label className="tactical-label mb-2 block">Security_HASH</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all placeholder:text-slate-800 font-mono text-xs tracking-tighter"
                placeholder="••••••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="tactical-label mb-2 block">Hash_VERIFY</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 text-white focus:border-primary/50 outline-none transition-all placeholder:text-slate-800 font-mono text-xs tracking-tighter"
                  placeholder="••••••••••••"
                />
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/5 text-red-500 tactical-label border border-red-500/20 italic"
                >
                  SYSTEM_ERROR: {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-primary text-white tactical-label hover:bg-primary-light flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border border-white/20 shadow-[0_0_20px_rgba(255,77,0,0.1)]"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isSignUp ? (
                <>
                   <Zap className="w-5 h-5 flex-shrink-0" />
                   <span>INITIALIZE_NODE</span>
                </>
              ) : (
                <>
                   <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                   <span>ESTABLISH_AUTH</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-white/5 pt-8 text-center">
            <button
              onClick={() => {
                 setIsSignUp(!isSignUp);
                 setError(null);
              }}
              className="tactical-label text-primary hover:text-white transition-colors"
            >
              {isSignUp ? 'RETURN_TO_BASE' : "REQUEST_NEW_INITIALIZATION"}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center opacity-20 pointer-events-none">
          <p className="tactical-label text-[8px]">
            SECURE_HANDSHAKE_ACTIVE // GRID_CONTROL_V2.4
          </p>
        </div>
      </motion.div>
    </div>
  );
}
