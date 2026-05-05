import { useState, useEffect, useCallback } from 'react';
import { PostgrestTask } from '../types';
import * as taskService from '../services/taskService';
import { supabase } from '../lib/supabase';

/**
 * useTasks: The Centralized State & Real-time Synchronization Manager
 * 
 * Provides a predictable, synchronized task array by combining local React state 
 * with Supabase Realtime subscriptions. Eliminates the need for manual 'onRefresh' 
 * prop drilling.
 * 
 * @author Waafia (Frontend View Integration)
 * @returns {Object} Data and mutation methods for component consumption.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<PostgrestTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Primary fetch to initialize the local state.
   */
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await taskService.fetchTasks();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sync operational data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Realtime Subscription Manager
   * Listens for INSERT, UPDATE, and DELETE events from Supabase.
   * Directly mutates local state to ensure instant UI responsiveness.
   */
  useEffect(() => {
    loadTasks();

    let channel: any;

    try {
      channel = supabase
        .channel('task_stream')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks' },
          (payload) => {
            console.log('[Realtime] Data Packet Intercepted:', payload);
            
            if (payload.eventType === 'INSERT') {
              setTasks((current) => [...current, payload.new as PostgrestTask]);
            } else if (payload.eventType === 'UPDATE') {
              setTasks((current) => 
                current.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t))
              );
            } else if (payload.eventType === 'DELETE') {
              setTasks((current) => current.filter((t) => t.id === payload.old.id));
            }
          }
        )
        .subscribe();
    } catch(err) {
      console.warn("Supabase channel initialization skipped (missing config).")
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch(e) {}
      }
    };
  }, [loadTasks]);

  /**
   * Mutation Wrappers
   */

  const addTask = async (payload: Partial<PostgrestTask>) => {
    try {
      // We don't manually add to state here; the Realtime INSERT event will handle it
      await taskService.createTask(payload);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const editTask = async (id: string, payload: Partial<PostgrestTask>) => {
    try {
      // The Realtime UPDATE event will sync the UI
      await taskService.updateTask(id, payload);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * removeTask: Perfoems Optimistic UI deletion.
   * Removes from state immediately for perceived zero-latency.
   */
  const removeTask = async (id: string) => {
    const previousTasks = [...tasks];
    
    // Optimistic Update
    setTasks((current) => current.filter((t) => t.id !== id));

    try {
      await taskService.deleteTask(id);
    } catch (err: any) {
      // Rollback on failure
      setTasks(previousTasks);
      setError(`Critical Error: Delete failed on server. ${err.message}`);
      throw err;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    addTask,
    editTask,
    removeTask,
    refresh: loadTasks
  };
}
