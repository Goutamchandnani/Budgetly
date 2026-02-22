import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, BarChart3, Settings } from 'lucide-react';

export default function MobileNavigation() {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
        { icon: Wallet, label: 'Expenses', path: '/expenses' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-budgetly-mid/95 backdrop-blur-md border-t border-white/10 z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-budgetly-accent' : 'text-budgetly-sage hover:text-budgetly-white'
                                }`}
                        >
                            <Icon size={24} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
