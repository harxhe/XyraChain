import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: number;
    sender: 'ai' | 'user';
    text: string;
}

export default function TriageChat() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'ai', text: 'Hello. I have analyzed your scan. Based on the preliminary results, I need to ask a few questions to better understand your condition. Do you have a persistent cough?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        const userMsg: Message = { id: Date.now(), sender: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const aiMsg: Message = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.answer || "I'm having trouble processing that request."
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Network error: Unable to reach the AI service. Ensure the backend is running."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="text-stone-500 antialiased h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden bg-[#FDFBF7] dark:bg-[#030303] dark:text-stone-400 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-20 px-4 md:px-6 relative flex flex-col items-center justify-center h-full overflow-hidden">

                <div className="w-full max-w-5xl h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] flex flex-col">
                    <div className="flex flex-col h-full rounded-3xl border border-stone-200 bg-white/90 backdrop-blur-sm relative overflow-hidden shadow-2xl shadow-stone-900/10 ring-1 ring-stone-900/5 dark:bg-[#0a0a0a]/90 dark:border-white/10 dark:ring-white/5 transition-colors">

                        {/* Chat Header */}
                        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 backdrop-blur-md dark:bg-white/5 dark:border-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 relative dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                    <iconify-icon icon="solar:chat-round-dots-bold" width="20"></iconify-icon>
                                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-stone-800 dark:text-white tracking-tight transition-colors">Xyra Medical Assistant</h3>
                                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                                        <span className="flex items-center gap-1.5">
                                            <iconify-icon icon="solar:pulse-2-bold" width="12" className="text-emerald-500"></iconify-icon>
                                            System Active
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600"></span>
                                        <span>Case #8392-A</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 transition-all hover:scale-105 active:scale-95 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20">
                                    <iconify-icon icon="solar:shield-check-bold" width="16"></iconify-icon>
                                    <span className="text-xs font-semibold">Seal Record</span>
                                </button>
                                <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors dark:hover:bg-white/10 dark:hover:text-stone-200">
                                    <iconify-icon icon="solar:menu-dots-bold" width="20"></iconify-icon>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth">
                            <div className="flex justify-center mb-8">
                                <span className="text-xs font-medium text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full dark:text-slate-400">Today</span>
                            </div>

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}>
                                    <div className={`flex items-end max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg ${msg.sender === 'user'
                                            ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-500/30'
                                            : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200 dark:bg-white/10 dark:text-stone-300 dark:ring-white/10'
                                            }`}>
                                            <iconify-icon icon={msg.sender === 'user' ? "solar:user-bold" : "solar:robot-2-bold"} width="16"></iconify-icon>
                                        </div>

                                        <div className={`p-4 md:px-6 md:py-4 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-sm'
                                            : 'bg-stone-100 border border-stone-200 text-stone-700 rounded-bl-sm dark:bg-white/5 dark:border-white/5 dark:text-stone-300'
                                            }`}>
                                            {msg.sender === 'user' ? (
                                                msg.text
                                            ) : (
                                                <div className="prose prose-stone prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                            li: ({ node, ...props }) => <li className="text-stone-600 dark:text-stone-300" {...props} />,
                                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                            strong: ({ node, ...props }) => <strong className="font-semibold text-stone-800 dark:text-white" {...props} />,
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start animate-fade-in-up">
                                    <div className="flex items-end max-w-[80%] gap-3">
                                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-stone-100 text-stone-600 ring-1 ring-stone-200 dark:bg-white/10 dark:text-stone-300 dark:ring-white/10">
                                            <iconify-icon icon="solar:robot-2-bold" width="16"></iconify-icon>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-stone-100 border border-stone-200 text-stone-700 rounded-bl-sm flex gap-1.5 items-center h-12 dark:bg-white/5 dark:border-white/5 dark:text-stone-300">
                                            <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                                            <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                                            <span className="w-1.5 h-1.5 bg-emerald-500/60 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 border-t border-stone-200 bg-stone-50 dark:bg-black/40 dark:border-white/5 transition-colors">
                            <div className="relative flex items-center gap-3">
                                <button className="p-3 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors shrink-0 dark:hover:text-white dark:hover:bg-white/10">
                                    <iconify-icon icon="solar:paperclip-linear" width="20"></iconify-icon>
                                </button>
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your symptoms..."
                                        className="w-full bg-white border border-stone-200 rounded-2xl pl-5 pr-14 py-4 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-sm dark:bg-[#111] dark:border-white/10 dark:text-stone-200 dark:placeholder-stone-600"
                                    />
                                    <button
                                        onClick={handleSend}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg ${input.trim()
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white translate-x-0 opacity-100'
                                            : 'bg-stone-100 text-stone-300 cursor-not-allowed translate-x-2 opacity-0 pointer-events-none dark:bg-white/5 dark:text-stone-600'
                                            }`}
                                    >
                                        <iconify-icon icon="solar:plain-3-bold" width="18"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-stone-400 mt-3">
                                AI responses are for informational purposes only. In emergencies, call 911 immediately.
                            </p>
                        </div>

                    </div>
                </div>

            </main>

        </div>
    );
}
