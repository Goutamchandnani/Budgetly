import { formatCurrency } from '../utils/formatCurrency';
import ProgressBar from './ProgressBar';

export default function BudgetCard({ budget, spent }) {
    const remaining = budget - spent;
    const percentage = Math.round((spent / budget) * 100) || 0;

    let statusText = 'On Track';
    let statusColor = 'text-budgetly-accent';

    if (percentage >= 90) {
        statusText = 'Over Budget';
        statusColor = 'text-red-500';
    } else if (percentage >= 70) {
        statusText = 'Warning';
        statusColor = 'text-yellow-500';
    }

    return (
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden group">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-budgetly-accent/5 rounded-full blur-[60px] group-hover:bg-budgetly-accent/10 transition-colors duration-500" />

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h2 className="text-budgetly-sage text-xs font-bold uppercase tracking-widest mb-2">Monthly Budget</h2>
                    <div className="text-4xl font-bold text-budgetly-white tracking-tight">
                        {formatCurrency(remaining)}
                        <span className="text-sm font-medium text-budgetly-sage ml-2 tracking-normal">remaining</span>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-budgetly-base/50 border border-white/5 backdrop-blur-sm ${statusColor}`}>
                    {statusText}
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-budgetly-sage">Spent: <span className="text-budgetly-white">{formatCurrency(spent)}</span></span>
                    <span className="text-budgetly-sage">Target: <span className="text-budgetly-white">{formatCurrency(budget)}</span></span>
                </div>
                <ProgressBar percentage={percentage} colorClass={percentage >= 90 ? 'bg-red-500' : (percentage >= 70 ? 'bg-yellow-500' : 'bg-budgetly-accent')} />
                <div className="text-right text-xs font-bold text-budgetly-sage mt-1">
                    {percentage}% USED
                </div>
            </div>
        </div>
    );
}
