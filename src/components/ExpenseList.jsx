import ExpenseItem from './ExpenseItem';
import { CalendarX } from 'lucide-react';

export default function ExpenseList({ expenses, onDelete }) {
    if (!expenses || expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-budgetly-sage glass-panel rounded-2xl border-dashed border-white/10">
                <div className="w-16 h-16 bg-budgetly-mid/50 rounded-full flex items-center justify-center mb-4">
                    <CalendarX size={32} className="text-budgetly-sage/50" />
                </div>
                <p className="text-lg font-medium text-budgetly-white">No expenses found</p>
                <p className="text-sm opacity-60">Add one above or select a different month</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => (
                <ExpenseItem
                    key={expense._id || expense.id}
                    expense={expense}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
