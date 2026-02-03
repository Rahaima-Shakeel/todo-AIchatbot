'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Save, Type, AlignLeft } from 'lucide-react';
import { Task } from '@/lib/api';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string }) => Promise<void>;
    initialData?: Task;
}

export default function TaskForm({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) {
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || '',
            });
        } else {
            setFormData({ title: '', description: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            setFormData({ title: '', description: '' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-slate-900/90 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-bottom-8 duration-500 backdrop-blur-3xl">
                <div className="flex items-center justify-between p-10 pb-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-white tracking-tighter">
                            {initialData ? 'Edit Task' : 'New Task'}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {initialData ? 'Update your task details' : 'What do you want to do?'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 pt-8 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-1 mb-1">
                            <Type className="text-blue-500 w-4 h-4" />
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Task Name</label>
                        </div>
                        <input
                            type="text"
                            required
                            autoFocus
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4.5 text-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all font-bold shadow-inner"
                            placeholder="e.g. Buy groceries or finish report"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-1 mb-1">
                            <AlignLeft className="text-blue-500 w-4 h-4" />
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Description</label>
                        </div>
                        <textarea
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4.5 text-base text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all font-semibold min-h-[160px] resize-none shadow-inner"
                            placeholder="Add some notes here (optional)..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-6 flex items-center gap-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4.5 rounded-2xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] btn-premium text-base shadow-[0_20px_40px_rgba(59,130,246,0.3)] py-4.5"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    {initialData ? <Save size={20} /> : <Plus size={20} />}
                                    {initialData ? 'Save' : 'Create'}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
