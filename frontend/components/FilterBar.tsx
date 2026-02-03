'use client';

import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FilterBarProps {
    filter: string;
    setFilter: (filter: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    search: string;
    setSearch: (search: string) => void;
}

export default function FilterBar({
    filter, setFilter, sortBy, setSortBy, search, setSearch
}: FilterBarProps) {
    const [localSearch, setLocalSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(localSearch);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearch, setSearch]);

    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 w-full lg:w-auto">
            {/* Refactored Search Input */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-6 py-1 min-w-[320px] focus-within:border-blue-500/30 focus-within:bg-white/[0.08] transition-all shadow-inner group">
                <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 group-focus-within:scale-110 transition-all duration-300 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 focus:outline-none font-semibold"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-4">
                {/* Refactored Status Filter Dropdown */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-6 py-1 min-w-[180px] hover:bg-white/[0.08] hover:border-white/10 focus-within:border-blue-500/30 transition-all cursor-pointer group">
                    <Filter className="w-4 h-4 text-slate-500 pointer-events-none transition-colors group-hover:text-blue-400 flex-shrink-0" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent py-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-white outline-none cursor-pointer w-full"
                    >
                        <option value="all" className="bg-[#0f172a]">All Status</option>
                        <option value="pending" className="bg-[#0f172a]">Pending</option>
                        <option value="completed" className="bg-[#0f172a]">Completed</option>
                    </select>
                </div>

                {/* Refactored Sort Order Dropdown */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-6 py-1 min-w-[200px] hover:bg-white/[0.08] hover:border-white/10 focus-within:border-blue-500/30 transition-all cursor-pointer group">
                    <ArrowUpDown className="w-4 h-4 text-slate-500 pointer-events-none transition-colors group-hover:text-blue-400 flex-shrink-0" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent py-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-white outline-none cursor-pointer w-full"
                    >
                        <option value="created_at" className="bg-[#0f172a]">Date Created</option>
                        <option value="updated_at" className="bg-[#0f172a]">Last Updated</option>
                        <option value="title" className="bg-[#0f172a]">Alphabetical</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
