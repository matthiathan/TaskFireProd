import { PostgrestTask, Status } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Validates the current user session and returns the userId.
 * @throws Error if user is not authenticated.
 */
async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    throw new Error('SECURE ACCESS DENIED: User must be authenticated to perform this operation.');
  }
  return session.user.id;
}

/**
 * Fetches all tasks for the current authenticated user.
 * Ordered by due_date for operational priority.
 * 
 * @author Muhammad (Backend Layer)
 * @returns {Promise<PostgrestTask[]>} Array of task entities.
 */
export async function fetchTasks(): Promise<PostgrestTask[]> {
  const userId = await ensureAuth();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Database Fetch Error: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Creates a new task entity with tactical defaults.
 * 
 * @author Muhammad (Backend Layer)
 * @param {Partial<PostgrestTask>} payload - Task data.
 * @returns {Promise<PostgrestTask>} The created task.
 */
export async function createTask(payload: Partial<PostgrestTask>): Promise<PostgrestTask> {
  const userId = await ensureAuth();

  const sanitizedPayload = {
    ...payload,
    user_id: userId,
    status: payload.status || 'pending',
    priority: payload.priority || 'medium',
    start_date: payload.start_date === '' ? null : payload.start_date,
    due_date: payload.due_date === '' ? null : payload.due_date,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert([sanitizedPayload])
    .select()
    .single();

  if (error) {
    throw new Error(`Task Creation Failed: ${error.message}`);
  }

  return data;
}

/**
 * Updates an existing task with lifecycle timestamp management.
 * 
 * @author Muhammad (Backend Layer)
 * @param {string} id - The task UUID.
 * @param {Partial<PostgrestTask>} payload - Fields to update.
 * @returns {Promise<PostgrestTask>} The updated entity.
 */
export async function updateTask(id: string, payload: Partial<PostgrestTask>): Promise<PostgrestTask> {
  const userId = await ensureAuth();
  
  const finalUpdates: any = { ...payload };

  // Sanitize dates
  if (finalUpdates.start_date === '') finalUpdates.start_date = null;
  if (finalUpdates.due_date === '') finalUpdates.due_date = null;

  // Tactical Lifecycle Timestamp Logic
  if (payload.status === 'in_progress' || payload.status === 'pending_review') {
    if (payload.started_at === undefined) {
      finalUpdates.started_at = new Date().toISOString();
    }
    finalUpdates.completed_at = null;
  } else if (payload.status === 'completed') {
    finalUpdates.completed_at = new Date().toISOString();
  } else if (payload.status === 'pending') {
    finalUpdates.started_at = null;
    finalUpdates.completed_at = null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(finalUpdates)
    .eq('id', id)
    .eq('user_id', userId) // Security redundancy
    .select()
    .single();

  if (error) {
    throw new Error(`Task Update Failed: ${error.message}`);
  }

  return data;
}

/**
 * Permanently deletes a task using the specialized RPC function.
 * 
 * @author Muhammad (Backend Layer)
 * @param {string} id - The task UUID.
 * @throws {Error} if deletion fails.
 */
export async function deleteTask(id: string): Promise<void> {
  await ensureAuth();
  
  const { error } = await supabase.rpc('delete_user_task', { 
    target_task_id: id 
  });

  if (error) {
    throw new Error(`Database rejection on delete: ${error.message}`);
  }
}
