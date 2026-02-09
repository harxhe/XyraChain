export default function Footer() {
  return (
    <footer className="border-t border-stone-200/50 bg-[#FDFBF7]/80 dark:bg-[#030303]/80 dark:border-white/5 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-stone-800 font-semibold tracking-tight text-sm dark:text-white transition-colors">XyraChain</span>
          <span className="text-stone-400 text-xs">© 2026</span>
        </div>

        <div className="flex gap-6 text-xs text-stone-500 dark:text-stone-400">
          <a href="#" className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
            Privacy Policy
          </a>
          <a href="https://github.com/harxhe/XyraChain" className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors">
            Github
          </a>
        </div>
      </div>
    </footer>
  );
}
