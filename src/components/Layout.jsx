import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, BarChart3, Settings, LogOut, Zap } from 'lucide-react';
import MobileNavigation from './MobileNavigation';

export default function Layout({ children }) {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Expenses', href: '/expenses', icon: Wallet },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-budgetly-base text-budgetly-white flex flex-col md:flex-row relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-budgetly-mid/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-budgetly-accent/5 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar Navigation - Desktop Only */}
            <div className="hidden md:flex fixed inset-y-0 left-0 w-72 glass-panel border-r border-white/5 z-20 flex-col">
                <div className="p-8">
                    <div className="font-bold text-2xl text-budgetly-accent flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-budgetly-accent flex items-center justify-center text-budgetly-base shadow-[0_0_15px_rgba(204,255,0,0.4)]">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        Budgetly
                    </div>
                </div>

                <div className="p-6 border-b border-white/5 bg-budgetly-mid/30 mx-4 rounded-xl mb-4">
                    <div className="text-xs text-budgetly-sage uppercase tracking-wider font-semibold mb-1">Signed in as</div>
                    <div className="font-medium text-budgetly-white truncate text-sm">{currentUser?.email}</div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`
                flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-200 group
                ${isActive(item.href)
                                    ? 'bg-budgetly-accent text-budgetly-base font-bold shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                                    : 'text-budgetly-sage hover:bg-white/5 hover:text-budgetly-white'}
              `}
                        >
                            <item.icon size={20} className={`transition-transform duration-200 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-6 py-3.5 w-full text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:pl-7"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Mobile Header - Minimal */}
            <div className="md:hidden glass-panel border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-30">
                <div className="font-bold text-xl text-budgetly-accent flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-budgetly-accent flex items-center justify-center text-budgetly-base">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    Budgetly
                </div>
                <div className="w-8" /> {/* Spacer for balance */}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 w-full no-scrollbar pb-20 md:pb-0 md:pl-72">
                <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation - Only visible on mobile */}
            <div className="md:hidden">
                <MobileNavigation />
            </div>
        </div>
    );
}
