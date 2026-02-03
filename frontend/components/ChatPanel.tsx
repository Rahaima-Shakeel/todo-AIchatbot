'use client';

import { useState, useEffect, useRef } from 'react';
import { chatAPI, ChatMessage } from '@/lib/api';
import { Bot, User, X, Send, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskMutation: () => void;
}

export default function ChatPanel({ isOpen, onClose, onTaskMutation }: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentResponse]);

    const fetchHistory = async () => {
        try {
            const history = await chatAPI.getHistory();
            setMessages(history);
        } catch (err) {
            console.error('Failed to fetch chat history:', err);
        }
    };

    const handleSend = async () => {
        const textContent = inputValue.trim();
        if (!textContent || isTyping) return;

        setInputValue('');
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: textContent,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setCurrentResponse('');

        try {
            const token = localStorage.getItem('access_token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const response = await fetch(`${API_URL}/api/chat/stream?message=${encodeURIComponent(textContent)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';
            let needsSync = false;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'text') {
                                assistantContent += parsed.content;
                                setCurrentResponse(assistantContent);
                            } else if (parsed.type === 'tool_call') {
                                needsSync = true;
                            }
                        } catch (e) {
                            // Ignore parse errors from partial chunks
                        }
                    }
                }
            }

            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMsg]);
            setCurrentResponse('');

            if (needsSync) {
                onTaskMutation();
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages(prev => [...prev, {
                id: 'error',
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please check your connection and try again.",
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-slate-950/80 backdrop-blur-3xl border-l border-white/10 z-[100] flex flex-col shadow-2xl"
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Bot className="text-white w-7 h-7" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-950 rounded-full" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            TodoFlow AI
                            <Sparkles className="w-4 h-4 text-blue-400" />
                        </h3>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">AI Productivity Partner</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-white">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                        >
                            {msg.role !== 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mb-1">
                                    <Bot className="w-4 h-4 text-blue-400" />
                                </div>
                            )}
                            <div className={`max-w-[85%] group relative`}>
                                <div className={`
                                    px-4 py-3 rounded-2xl text-sm leading-relaxed
                                    ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/10'
                                        : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-none'}
                                `}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 block px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {currentResponse && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start items-end gap-3"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mb-1">
                                <Bot className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="max-w-[85%]">
                                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white/5 text-slate-200 border border-white/10 rounded-bl-none">
                                    {currentResponse}
                                    <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isTyping && !currentResponse && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-slate-500 text-xs px-11"
                        >
                            <span className="flex gap-1">
                                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                            </span>
                            Thinking...
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
                <div className="relative group">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a message or use commands..."
                        className="w-full bg-slate-900/50 text-white text-sm rounded-2xl px-4 py-4 pr-14 border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none resize-none min-h-[60px] max-h-[150px] placeholder:text-slate-600 shadow-inner"
                        rows={1}
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className={`p-2 rounded-xl transition-all duration-200 ${inputValue.trim() && !isTyping
                                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95'
                                : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-600 px-1 font-medium italic">
                    <div className="flex items-center gap-1.5">
                        <Command className="w-3 h-3" />
                        <span>Enter to send</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Powered</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
