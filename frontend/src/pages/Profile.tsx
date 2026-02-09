import Navbar from '../components/Navbar';

// Mock Data
const MOCK_PROFILE = {
    address: "xdc742d35Cc6634C0532925a3b844Bc454e4438f44e",
    balance: "1,245.50",
    network: {
        name: "XDC Apothem Testnet",
        chainId: 51,
        status: "connected"
    },
    stats: {
        totalReports: 42,
        aiAccuracy: 94.8,
        lastScanDate: "2024-03-08",
        storageUsed: "145 MB"
    }
};

export default function Profile() {
    const shortenAddress = (addr: string) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // In a real app, I'd add a toast notification here
    };

    return (
        <div className="text-stone-500 antialiased h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden bg-[#FDFBF7] dark:bg-[#030303] dark:text-stone-400 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-24 px-4 md:px-8 relative flex flex-col items-center justify-center h-full overflow-hidden">

                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-180px)] max-h-[600px]">

                    {/* Left Column: Account & Network (Span 4) */}
                    <div className="md:col-span-5 flex flex-col gap-6 h-full">

                        {/* Account Card */}
                        <div className="p-6 rounded-3xl border border-stone-200 bg-white shadow-sm relative overflow-hidden flex-shrink-0 dark:bg-[#0a0a0a] dark:border-white/10 transition-colors">
                            <div className="absolute top-0 right-0 p-24 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>

                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:from-emerald-500/10 dark:to-teal-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                                        <iconify-icon icon="solar:user-id-bold" width="32"></iconify-icon>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-medium text-stone-800 dark:text-white mb-1 transition-colors">Connected Wallet</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-stone-500 bg-stone-50 px-2 py-1 rounded-lg border border-stone-100 text-xs dark:bg-white/5 dark:border-white/10 dark:text-stone-400">
                                                {shortenAddress(MOCK_PROFILE.address)}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(MOCK_PROFILE.address)}
                                                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-800 dark:hover:bg-white/10 dark:hover:text-stone-200 transition-colors"
                                            >
                                                <iconify-icon icon="solar:copy-linear" width="14"></iconify-icon>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between dark:bg-white/5 dark:border-white/10 transition-colors">
                                    <div>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">XDC Balance</p>
                                        <p className="text-xl font-semibold text-stone-800 dark:text-white transition-colors">{MOCK_PROFILE.balance} XDC</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                                        <iconify-icon icon="solar:wallet-money-bold" width="16"></iconify-icon>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Network Status */}
                        <div className="p-6 rounded-3xl border border-stone-200 bg-white shadow-sm flex-grow flex flex-col dark:bg-[#0a0a0a] dark:border-white/10 transition-colors">
                            <h3 className="text-base font-medium text-stone-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                                <iconify-icon icon="solar:earth-bold" width="18" className="text-emerald-500"></iconify-icon>
                                Network Status
                            </h3>

                            <div className="space-y-3 flex-grow">
                                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block absolute top-0 animate-ping opacity-50"></span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">{MOCK_PROFILE.network.name}</p>
                                            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">Connected</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">Chain ID</p>
                                        <p className="text-xs font-mono text-stone-600 dark:text-stone-300">{MOCK_PROFILE.network.chainId}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 dark:bg-white/5 dark:border-white/10 transition-colors">
                                    <span className="text-xs text-stone-500 dark:text-stone-400">RPC Endpoint</span>
                                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">https://rpc.apothem.network</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Settings (Span 7) */}
                    <div className="md:col-span-7 flex flex-col gap-6 h-full">

                        {/* System Statistics */}
                        <div className="p-6 rounded-3xl border border-stone-200 bg-white shadow-sm flex-grow flex flex-col justify-center dark:bg-[#0a0a0a] dark:border-white/10 transition-colors">
                            <h3 className="text-base font-medium text-stone-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                                <iconify-icon icon="solar:chart-square-bold" width="18" className="text-emerald-500"></iconify-icon>
                                System Statistics
                            </h3>

                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col justify-center dark:bg-white/5 dark:border-white/10 transition-colors">
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Total Reports</p>
                                    <p className="text-2xl font-semibold text-stone-800 dark:text-white transition-colors">{MOCK_PROFILE.stats.totalReports}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col justify-center dark:bg-white/5 dark:border-white/10 transition-colors">
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">AI Accuracy</p>
                                    <p className="text-2xl font-semibold text-stone-800 dark:text-white transition-colors">{MOCK_PROFILE.stats.aiAccuracy}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col justify-center dark:bg-white/5 dark:border-white/10 transition-colors">
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Storage Used</p>
                                    <p className="text-lg font-medium text-stone-800 dark:text-white transition-colors">{MOCK_PROFILE.stats.storageUsed}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col justify-center dark:bg-white/5 dark:border-white/10 transition-colors">
                                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Last Scan</p>
                                    <p className="text-lg font-medium text-stone-800 dark:text-white transition-colors">{MOCK_PROFILE.stats.lastScanDate}</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings / Actions */}
                        <div className="p-6 rounded-3xl border border-stone-200 bg-white shadow-sm flex-shrink-0 dark:bg-[#0a0a0a] dark:border-white/10 transition-colors">
                            <h3 className="text-base font-medium text-stone-800 dark:text-white mb-4 transition-colors">Account Settings</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-100 transition-all group dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 group-hover:text-stone-700 transition-colors dark:bg-white/10 dark:text-stone-400 dark:group-hover:text-white">
                                            <iconify-icon icon="solar:key-minimalistic-bold" width="16"></iconify-icon>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-stone-700 dark:text-stone-300 transition-colors">Export Private Keys</p>
                                        </div>
                                    </div>
                                    <iconify-icon icon="solar:arrow-right-linear" width="16" className="text-stone-400 group-hover:text-stone-600 transition-colors dark:text-stone-500 dark:group-hover:text-stone-300"></iconify-icon>
                                </button>

                                <button className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-rose-50 border border-stone-100 hover:border-rose-200 transition-all group dark:bg-white/5 dark:border-white/10 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-stone-200 group-hover:bg-rose-100 flex items-center justify-center text-stone-500 group-hover:text-rose-500 transition-colors dark:bg-white/10 dark:group-hover:bg-rose-500/20 dark:text-stone-400 dark:group-hover:text-rose-400">
                                            <iconify-icon icon="solar:logout-2-bold" width="16"></iconify-icon>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-stone-700 group-hover:text-rose-600 transition-colors dark:text-stone-300 dark:group-hover:text-rose-400">Disconnect Wallet</p>
                                        </div>
                                    </div>
                                    <iconify-icon icon="solar:arrow-right-linear" width="16" className="text-stone-400 group-hover:text-rose-400 transition-colors dark:text-stone-500 dark:group-hover:text-rose-400"></iconify-icon>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
