'use client';

import { Task } from '@/lib/api';
import { CheckCircle2, Circle, Edit2, Trash2, Clock, Calendar, ChevronRight } from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    onToggle: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onToggle, onEdit, onDelete }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in">
                <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-xl">
                    <CheckCircle2 className="text-slate-700 w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">All caught up</h3>
                <p className="text-slate-500 font-medium max-w-xs text-base leading-relaxed">
                    No tasks found in this view. Start your next project by creating a task.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className="group flex items-center gap-6 p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-400 group relative"
                >
                    <button
                        onClick={() => onToggle(task)}
                        className={`mt-0.5 transition-all duration-300 active:scale-90 ${task.completed ? 'text-blue-500 scale-110' : 'text-slate-700 hover:text-slate-500'}`}
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-10 h-10" />
                        ) : (
                            <Circle className="w-10 h-10" />
                        )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                            <h3 className={`text-lg font-bold tracking-tight transition-all duration-300 ${task.completed ? 'text-slate-600 line-through' : 'text-white'}`}>
                                {task.title}
                            </h3>
                            {task.completed && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20">
                                    Done
                                </span>
                            )}
                        </div>
                        {task.description && (
                            <p className="text-sm text-slate-500 line-clamp-1 font-medium leading-relaxed">
                                {task.description}
                            </p>
                        )}

                        <div className="flex items-center gap-5 pt-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-500 transition-colors">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-500 transition-colors">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button
                            onClick={() => onEdit(task)}
                            className="p-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                            title="Edit task"
                        >
                            <Edit2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/10"
                            title="Delete task"
                        >
                            <Trash2 className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
