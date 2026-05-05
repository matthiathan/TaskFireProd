import React, { useState } from 'react';
import { PostgrestTask, Priority, Status } from '@/src/types';
import { 
  Plus, 
  Search, 
  ListTodo
} from 'lucide-react';
import { toast } from 'sonner';
// No taskService import needed here
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

interface TaskListProps {
  tasks: PostgrestTask[];
  onDelete: (id: string) => Promise<void>;
  onCreate: (payload: any) => Promise<void>;
  onUpdate: (id: string, payload: any) => Promise<void>;
  onUpdateStatus: (id: string, newStatus: Status) => Promise<void>;
}

/**
 * TaskList serves as the primary strategic view for active operations.
 * It manages the search discovery parameters and the lifecycle of task entities.
 */
export default function TaskList({ tasks, onDelete, onCreate, onUpdate, onUpdateStatus }: TaskListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PostgrestTask | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('pending');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Operational filtering
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * Commits task data to the Supabase backend.
   * Leverages taskService for abstracted database interactions.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      const payload = {
        title,
        description,
        priority,
        status,
        start_date: startDate || null,
        due_date: dueDate || null,
      };

      if (editingTask) {
        await onUpdate(editingTask.id, payload);
      } else {
        await onCreate(payload);
      }
      closeModal();
    } catch (err: any) {
      console.error('[TaskList] Submit error:', err);
      setSubmitError(err.message || 'An operational failure occurred during synchronization.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    try {
      await onUpdateStatus(id, newStatus);
    } catch (err) {
      console.error('[TaskList] Status update error:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const deletionPromise = onDelete(id);
    
    toast.promise(deletionPromise, {
      loading: 'Deleting task...',
      success: 'Task permanently deleted.',
      error: (err: any) => `Deletion failed: ${err.message}`
    });

    return deletionPromise;
  };

  const openModal = (task?: PostgrestTask) => {
    setSubmitError(null);
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setStartDate(task.start_date || '');
      setDueDate(task.due_date || '');
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('pending');
      setStartDate('');
      setDueDate('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setSubmitError(null);
  };

  return (
    <div className="space-y-8">
      {/* Filtering and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-lg w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 opacity-40" />
          <input
            type="text"
            placeholder="Search operational stream..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface border border-white/[0.03] text-white placeholder:text-slate-600 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-all font-sans text-sm rounded-xl shadow-lg"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center justify-center gap-2 py-4 px-8"
        >
          <Plus className="w-5 h-5" />
          <span>New Operation</span>
        </button>
      </div>

      {/* Main Task Stream */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-surface border border-dashed border-white/5 rounded-3xl p-32 text-center">
            <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ListTodo className="w-8 h-8 text-slate-800" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Operational Stream Void</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">No matching tasks found. Adjust your search parameters or initiate a new mission.</p>
          </div>
        ) : (
          filteredTasks.map((task, idx) => (
            <TaskCard 
              key={task.id}
              task={task}
              idx={idx}
              onUpdateStatus={updateStatus}
              onEdit={openModal}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>

      {/* Task Creation/Editing Overlay */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingTask={editingTask}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        priority={priority}
        setPriority={setPriority}
        status={status}
        setStatus={setStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        loading={loading}
        error={submitError}
      />
    </div>
  );
}
