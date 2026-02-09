import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const { connectWallet, account, isConnected } = useWallet();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-emerald-800 bg-emerald-50 font-semibold dark:bg-emerald-500/10 dark:text-emerald-400"
      : "text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-white/5";
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav backdrop-blur-md border-b border-stone-200/50 bg-[#FDFBF7]/80 dark:bg-[#030303]/80 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 dark:border-emerald-400/20">
            <iconify-icon icon="solar:pulse-2-linear" width="20"></iconify-icon>
          </div>
          <span className="text-stone-800 font-semibold tracking-tight text-lg dark:text-white transition-colors">XyraChain</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/analysis" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/analysis')}`}>
            Analysis
          </Link>
          <Link to="/triage" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/triage')}`}>
            Triage
          </Link>
          <Link to="/vault" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/vault')}`}>
            Vault
          </Link>
          <Link to="/profile" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/profile')}`}>
            Profile
          </Link>
        </div>

        {/* Wallet Connect & Theme Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/5 transition-colors"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? (
              <iconify-icon icon="solar:sun-bold-duotone" width="20"></iconify-icon>
            ) : (
              <iconify-icon icon="solar:moon-bold-duotone" width="20"></iconify-icon>
            )}
          </button>

          <button
            onClick={connectWallet}
            className={`group flex items-center gap-2 px-4 py-2 rounded-full border ${isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-white/5 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/10'} text-xs font-medium transition-all shadow-sm`}
          >
            <iconify-icon icon="solar:wallet-linear" width="16" className={isConnected ? "text-emerald-500" : "text-stone-400 group-hover:text-stone-600 dark:text-stone-500 dark:group-hover:text-stone-300"}></iconify-icon>
            <span>{isConnected && account ? formatAddress(account) : "Connect Wallet"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
