'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { taskAPI, Task } from '@/lib/api';
import FilterBar from '@/components/FilterBar';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import ChatPanel from '@/components/ChatPanel';
import {
    LogOut,
    Plus,
    LayoutDashboard,
    CheckCircle2,
    Clock,
    ListTodo,
    User as UserIcon,
    ChevronRight,
    Menu,
    X,
    Bell,
    Settings,
    Activity,
    Target,
    Layers,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Filter & Sort state
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetchTasks();
    }, [router, filter, sortBy, search]);

    const fetchTasks = async () => {
        try {
            const data = await taskAPI.getTasks(filter, sortBy, search);
            setTasks(data || []);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleCreateTask = async (data: { title: string; description: string }) => {
        try {
            if (editingTask) {
                await taskAPI.updateTask(editingTask.id, data);
            } else {
                await taskAPI.createTask(data);
            }
            setIsTaskFormOpen(false);
            setEditingTask(undefined);
            fetchTasks();
        } catch (err) {
            console.error('Failed to save task:', err);
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            await taskAPI.toggleComplete(task.id);
            fetchTasks();
        } catch (err) {
            console.error('Failed to toggle completion:', err);
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskFormOpen(true);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Delete this task?')) {
            try {
                await taskAPI.deleteTask(taskId);
                fetchTasks();
            } catch (err) {
                console.error('Failed to delete task:', err);
            }
        }
    };

    const stats = useMemo(() => {
        if (!tasks) return { total: 0, completed: 0, pending: 0, velocity: 0 };
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const velocity = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, pending, velocity };
    }, [tasks]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Loading your dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
            <div className="mesh-background" />

            {/* Structured Sidebar */}
            <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 glass border-r border-white/5 z-50 flex-shrink-0">
                <div className="p-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <CheckCircle2 className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white leading-none">TodoFlow<span className="text-blue-500">.</span></span>
                    </Link>
                </div>

                <div className="px-6 mb-10">
                    <div className="glass-card bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="text-blue-400 w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Daily Progress</span>
                            </div>
                            <span className="text-xs font-bold text-white">{stats.velocity}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${stats.velocity}%` }} />
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 focus:outline-none overflow-y-auto custom-scrollbar">
                    <SidebarLink icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                    <SidebarLink icon={<ListTodo size={20} />} label="My Tasks" active={activeTab === 'My Tasks'} onClick={() => setActiveTab('My Tasks')} />
                    <SidebarLink icon={<Activity size={20} />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
                    <SidebarLink icon={<Layers size={20} />} label="Collections" active={activeTab === 'Collections'} onClick={() => setActiveTab('Collections')} />
                    <SidebarLink icon={<Settings size={20} />} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />

                    {/* Extra space to ensure mt-auto works correctly and there's breathing room */}
                    <div className="h-10" />
                </nav>

                <div className="p-6 mt-auto flex-shrink-0">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/10 shadow-xl">
                                <UserIcon className="text-blue-400 w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.name || 'Member'}</p>
                                <p className="text-[10px] text-slate-500 truncate font-semibold uppercase tracking-wider">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 uppercase tracking-widest"
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen flex flex-col relative z-30 min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between p-6 px-10 sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 bg-slate-950/20">
                    <div className="flex items-center gap-6">
                        <button className="lg:hidden p-2.5 bg-white/5 rounded-xl border border-white/10" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={22} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            <span className="text-white">Dashboard Overview</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5 transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/5 mx-1" />
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:text-white border border-blue-500/20 transition-all flex items-center gap-2"
                        >
                            <MessageSquare size={20} />
                            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">AI Agent</span>
                        </button>
                        <div className="h-8 w-[1px] bg-white/5 mx-1" />
                        <button
                            onClick={() => { setEditingTask(undefined); setIsTaskFormOpen(true); }}
                            className="btn-premium px-7 py-3 text-sm font-bold"
                        >
                            <Plus size={18} />
                            New Task
                        </button>
                    </div>
                </header>

                <div className="max-w-[1400px] mx-auto w-full p-8 md:p-12 space-y-12 flex-1">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 animate-in">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                <Activity size={12} />
                                Active
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-none">
                                Welcome, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Member'}</span>
                            </h2>
                            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-xl">
                                You&apos;re doing great! You have <span className="text-blue-400 font-bold">{stats.pending}</span> tasks left to do.
                            </p>
                        </div>

                        <div className="hidden xl:flex items-center gap-12">
                            <HeaderStat label="Progress" value={`${stats.velocity}%`} />
                            <div className="h-12 w-[1px] bg-white/5" />
                            <HeaderStat label="Done" value={stats.completed} highlight />
                        </div>
                    </div>

                    {/* High-Fidelity Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in delay-100">
                        <StatCard icon={<ListTodo className="text-blue-400" />} label="Total Tasks" value={stats.total} color="blue" />
                        <StatCard icon={<CheckCircle2 className="text-emerald-400" />} label="Completed" value={stats.completed} color="emerald" />
                        <StatCard icon={<Clock className="text-indigo-400" />} label="To Do" value={stats.pending} color="indigo" />
                    </div>

                    {/* Workspace Table */}
                    <div className="glass-card p-1 md:p-1 flex flex-col min-h-[600px] rounded-[2rem] border-white/5 animate-in delay-200 overflow-hidden">
                        <div className="p-8 md:p-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-white/5 bg-white/[0.02]">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-white tracking-tight">Your Tasks</h3>
                            </div>
                            <FilterBar
                                filter={filter} setFilter={setFilter}
                                sortBy={sortBy} setSortBy={setSortBy}
                                search={search} setSearch={setSearch}
                            />
                        </div>

                        <div className="p-8 md:p-10 flex-1">
                            <TaskList
                                tasks={tasks}
                                onToggle={handleToggleComplete}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                            />
                        </div>
                    </div>

                    {/* Unified Footer */}
                    <footer className="pt-12 pb-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 text-slate-500 font-semibold text-xs uppercase tracking-widest animate-in delay-300">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 size={16} className="text-blue-500/50" />
                            <span>© 2026 TaskFlow Global</span>
                        </div>
                        <div className="flex gap-10">
                            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-white transition-colors">Support</Link>
                        </div>
                    </footer>
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[60] lg:hidden animate-in" onClick={() => setIsSidebarOpen(false)}>
                    <aside className="fixed top-0 left-0 bottom-0 w-80 bg-slate-950 border-r border-white/10 p-10 flex flex-col gap-10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-blue-500 w-7 h-7" />
                                <span className="text-2xl font-bold tracking-tight text-white">TodoFlow.</span>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        </div>
                        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                            <SidebarLink icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'Overview'} onClick={() => { setActiveTab('Overview'); setIsSidebarOpen(false); }} />
                            <SidebarLink icon={<ListTodo size={20} />} label="My Tasks" active={activeTab === 'My Tasks'} onClick={() => { setActiveTab('My Tasks'); setIsSidebarOpen(false); }} />
                            <SidebarLink icon={<Activity size={20} />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => { setActiveTab('Analytics'); setIsSidebarOpen(false); }} />
                            <SidebarLink icon={<Settings size={20} />} label="Settings" active={activeTab === 'Settings'} onClick={() => { setActiveTab('Settings'); setIsSidebarOpen(false); }} />
                        </nav>
                        <button onClick={handleLogout} className="flex items-center gap-4 text-red-400 font-bold uppercase tracking-widest text-xs mt-auto py-4">
                            <LogOut size={20} />
                            Log Out
                        </button>
                    </aside>
                </div>
            )}

            <TaskForm
                isOpen={isTaskFormOpen}
                onClose={() => setIsTaskFormOpen(false)}
                onSubmit={handleCreateTask}
                initialData={editingTask}
            />

            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                onTaskMutation={() => fetchTasks()}
            />
        </div>
    );
}

function SidebarLink({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 uppercase tracking-widest ${active
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
        >
            <span className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</span>
            {label}
        </button>
    );
}

function HeaderStat({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
    return (
        <div className="text-right space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            <p className={`text-3xl font-bold tracking-tighter ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    const colorMap: any = {
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
    };

    return (
        <div className="glass-card p-10 flex items-center gap-8 group">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-lg ${colorMap[color]}`}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="text-4xl font-bold text-white tracking-tighter">{value}</p>
            </div>
        </div>
    );
}
