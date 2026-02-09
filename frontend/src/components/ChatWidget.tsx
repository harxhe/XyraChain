
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    isThinking?: boolean;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'bot', text: 'Hello! I am your AI Health Assistant. How can I help you today?' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Updated to point to port 5000 and correct endpoint
            const response = await fetch('http://localhost:5000/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.text }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const botMessage: Message = {
                id: Date.now().toString(), // unique id
                sender: 'bot',
                text: data.response || "I'm sorry, I couldn't process that.",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server. Please check if the backend is running.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Configure Web Component if needed, otherwise standard React */}

            {/* Chat Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${isOpen
                    ? 'bg-rose-500 text-white rotate-90 shadow-rose-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-110 shadow-emerald-500/20'
                    }`}
            >
                {isOpen ? (
                    <iconify-icon icon="solar:close-circle-bold" width="28"></iconify-icon>
                ) : (
                    <iconify-icon icon="solar:chat-round-dots-bold" width="28"></iconify-icon>
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right dark:bg-[#0a0a0a] dark:border-white/10 dark:shadow-none ${isOpen
                    ? 'scale-100 opacity-100 translate-y-0 shadow-stone-900/10'
                    : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="p-4 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between backdrop-blur-md dark:bg-white/5 dark:border-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <iconify-icon icon="solar:robot-2-bold-duotone" width="24"></iconify-icon>
                        </div>
                        <div>
                            <h3 className="font-semibold text-stone-800 text-sm dark:text-white transition-colors">Xyra AI Assistant</h3>
                            <p className="text-xs text-emerald-600 flex items-center gap-1 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                                    : 'bg-stone-100 text-stone-700 rounded-bl-none border border-stone-200 dark:bg-white/10 dark:text-stone-300 dark:border-white/5'
                                    }`}
                            >
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
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-stone-100 border border-stone-200 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 dark:bg-white/10 dark:border-white/5 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-stone-50 border-t border-stone-200 backdrop-blur-md dark:bg-black/40 dark:border-white/5 transition-colors">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about your symptoms..."
                            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 pr-12 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white transition-all shadow-sm dark:bg-[#111] dark:border-white/10 dark:text-stone-200 dark:placeholder-stone-600 dark:focus:bg-[#161616]"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 p-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors flex items-center justify-center"
                        >
                            <iconify-icon icon="solar:plain-3-bold" width="18"></iconify-icon>
                        </button>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2 text-center">
                        AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>
        </>
    );
}
