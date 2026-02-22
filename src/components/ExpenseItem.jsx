import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateHelpers';
import { useState, useRef } from 'react';
import { haptics } from '../utils/haptics';

const CATEGORY_STYLES = {
    Food: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Transport: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Entertainment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Shopping: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Bills: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function ExpenseItem({ expense, onDelete }) {
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const itemRef = useRef(null);

    const handleDelete = () => {
        haptics.heavy();
        if (window.confirm('Are you sure you want to delete this expense?')) {
            onDelete(expense._id || expense.id);
        }
    };

    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
        if (!isSwiping) return;
        const touchX = e.touches[0].clientX;
        const diff = touchX - startX;

        // Only allow swiping left
        if (diff < 0) {
            setCurrentX(Math.max(diff, -100)); // Max swipe distance
        }
    };

    const handleTouchEnd = () => {
        setIsSwiping(false);
        if (currentX < -60) {
            // Swiped far enough - trigger delete
            haptics.medium();
            if (window.confirm('Delete this expense?')) {
                onDelete(expense._id || expense.id);
            }
        }
        setCurrentX(0); // Snap back
    };

    const styleClass = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.Other;

    return (
        <div className="relative overflow-hidden rounded-xl group mb-3">
            {/* Background Action Layer (Visible on Swipe) */}
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-end px-6 rounded-xl border border-red-500/30">
                <Trash2 size={20} className="text-red-400" />
            </div>

            {/* Foreground Content */}
            <div
                className="glass-panel p-4 rounded-xl flex justify-between items-center bg-budgetly-mid/40 relative z-10 transition-transform duration-200 ease-out border border-white/5 hover:border-budgetly-accent/20"
                style={{ transform: `translateX(${currentX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${styleClass}`}>
                        {expense.category[0]}
                    </div>

                    <div>
                        <h3 className="text-budgetly-white font-medium truncate pr-4 text-sm group-hover:text-budgetly-accent transition-colors">
                            {expense.description}
                        </h3>
                        <div className="text-[10px] text-budgetly-sage font-medium uppercase tracking-wide opacity-60">
                            {formatDate(expense.date)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-budgetly-white tracking-tight">
                        {formatCurrency(expense.amount)}
                    </span>
                    {/* Desktop Delete Button (Hidden on Mobile usually, but kept for desktop hover) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        className="hidden md:block p-2 text-budgetly-sage hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete expense"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
