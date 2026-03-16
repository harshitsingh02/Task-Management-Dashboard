import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Circle, LayoutDashboard, CheckSquare, ListTodo, Timer } from 'lucide-react';

// 1. Define the Task type for TypeScript
interface Task {
  id: number;
  title: string;
  description: string;
  status: 'To-Do' | 'In Progress' | 'Done';
  created_at: string;
}

export default function App() {
  // 2. State variables to hold our data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // The URL to our backend API
  const API_URL = import.meta.env.VITE_APP_URL ? `${import.meta.env.VITE_APP_URL}/tasks` : '/tasks';

  // 3. Load tasks when the app starts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to get all tasks from the backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Function to add a new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the page from reloading
    
    if (!title.trim()) return; // Don't add if title is empty

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: title, 
          description: description 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      // Clear the form inputs
      setTitle('');
      setDescription('');
      
      // Reload the tasks to show the new one
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // 5. Function to delete a task
  const handleDeleteTask = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Reload the tasks after deleting
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // 6. Function to change a task's status
  const handleChangeStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Reload the tasks to see the updated status
      fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 7. A helper function to render a single column
  const getColumnConfig = (title: string) => {
    switch(title) {
      case 'To-Do': return { bg: 'bg-zinc-100/50', border: 'border-zinc-200/60', text: 'text-zinc-700', dot: 'bg-zinc-400' };
      case 'In Progress': return { bg: 'bg-zinc-50', border: 'border-zinc-200/60', text: 'text-zinc-900', dot: 'bg-blue-500' };
      case 'Done': return { bg: 'bg-zinc-50', border: 'border-zinc-200/60', text: 'text-zinc-900', dot: 'bg-emerald-500' };
      default: return { bg: 'bg-zinc-50', border: 'border-zinc-200/60', text: 'text-zinc-700', dot: 'bg-zinc-400' };
    }
  };

  const renderColumn = (columnTitle: 'To-Do' | 'In Progress' | 'Done') => {
    const columnTasks = tasks.filter((task) => task.status === columnTitle);
    const config = getColumnConfig(columnTitle);

    return (
      <div className={`flex flex-col rounded-[2rem] w-full md:w-1/3 border ${config.bg} ${config.border} p-2`}>
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`}></div>
            <h2 className={`font-semibold text-sm tracking-tight ${config.text}`}>{columnTitle}</h2>
            <span className="text-xs font-medium text-zinc-400 ml-1">{columnTasks.length}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2.5 min-h-[150px] p-1">
          {columnTasks.map((task) => (
            <div key={task.id} className="group bg-white p-5 rounded-[1.5rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-zinc-200/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 flex flex-col">
              <h3 className="font-semibold text-zinc-900 text-[15px] leading-snug">{task.title}</h3>
              
              {task.description && (
                <p className="text-zinc-500 text-sm mt-2 line-clamp-2 leading-relaxed">{task.description}</p>
              )}
              
              <div className="mt-5 pt-4 border-t border-zinc-100 flex gap-2 justify-between items-center">
                <div className="relative">
                  <select 
                    value={task.status}
                    onChange={(e) => handleChangeStatus(task.id, e.target.value)}
                    className="appearance-none bg-zinc-50 border border-zinc-200/80 text-zinc-600 text-xs font-medium rounded-full py-1.5 pl-3 pr-8 hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors cursor-pointer outline-none"
                  >
                    <option value="To-Do">To-Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
                    <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {columnTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-400 border border-dashed border-zinc-200/80 rounded-[1.5rem] bg-transparent">
              <span className="text-sm font-medium">Drop tasks here</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans p-4 sm:p-6 lg:p-8 selection:bg-zinc-200">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-2.5 rounded-2xl shadow-sm text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Workspace</h1>
              <p className="text-zinc-500 text-sm font-medium">Manage your projects efficiently</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-500 bg-white px-4 py-2 rounded-full border border-zinc-200/60 shadow-sm">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
            System Online
          </div>
        </header>

        {/* Top Section: Bento Grid Form & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Task Creation Form */}
          <form 
            onSubmit={handleAddTask} 
            className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-6 text-zinc-900 tracking-tight">Create New Task</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2.5">Task Title <span className="text-red-400">*</span></label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200/80 text-zinc-900 text-sm rounded-2xl p-3.5 focus:bg-white focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 outline-none transition-all placeholder:text-zinc-400"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2.5">Description <span className="text-zinc-400 font-normal tracking-normal capitalize">(Optional)</span></label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200/80 text-zinc-900 text-sm rounded-2xl p-3.5 focus:bg-white focus:ring-4 focus:ring-zinc-100 focus:border-zinc-300 outline-none transition-all resize-none placeholder:text-zinc-400"
                    placeholder="Add some details..."
                    rows={1}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end relative z-10">
              <button 
                type="submit" 
                className="bg-zinc-900 text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </form>

          {/* Task Completion Progress - Dark Bento Box */}
          <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-800/50 to-transparent pointer-events-none"></div>
            
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 w-full text-center relative z-10">Progress Overview</h2>
            
            <div className="relative flex items-center justify-center mb-8 z-10">
              <svg className="transform -rotate-90 w-36 h-36">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`${completionPercentage === 100 ? 'text-emerald-400' : 'text-white'} transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tracking-tighter">{completionPercentage}%</span>
              </div>
            </div>

            <div className="flex gap-8 text-sm w-full justify-center relative z-10">
              <div className="flex flex-col items-center">
                <span className="font-bold text-2xl leading-none mb-1.5">{pendingTasks}</span>
                <span className="text-zinc-500 font-semibold text-[10px] uppercase tracking-widest">Pending</span>
              </div>
              <div className="w-px bg-zinc-800"></div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-emerald-400 text-2xl leading-none mb-1.5">{completedTasks}</span>
                <span className="text-zinc-500 font-semibold text-[10px] uppercase tracking-widest">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 font-medium text-sm">Syncing workspace...</p>
          </div>
        ) : (
          /* Kanban Columns Container */
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {renderColumn('To-Do')}
            {renderColumn('In Progress')}
            {renderColumn('Done')}
          </div>
        )}

      </div>
    </div>
  );
}
