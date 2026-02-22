import { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import { getCurrentMonthISO } from '../utils/dateHelpers';
import ExpenseList from '../components/ExpenseList';
import MonthSelector from '../components/MonthSelector';
import { RefreshCcw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthISO());
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const response = await expenseService.getExpenses(selectedMonth);
                setExpenses(response.data.expenses || []);
            } catch (error) {
                toast.error("Failed to load expenses");
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [selectedMonth]);

    const handleDelete = async (id) => {
        try {
            await expenseService.deleteExpense(id);
            setExpenses(prev => prev.filter(exp => (exp._id || exp.id) !== id));
            toast.success('Expense deleted');
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    const filteredExpenses = filterCategory === 'All'
        ? expenses
        : expenses.filter(e => e.category === filterCategory);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-3xl font-bold text-budgetly-white tracking-tight">Expenses</h1>
                    <p className="text-budgetly-sage mt-1">Manage your spending history</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />

                    <div className="relative group">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-budgetly-sage group-hover:text-budgetly-accent transition-colors" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="pl-10 pr-8 py-2.5 bg-budgetly-mid/50 border border-white/10 rounded-xl text-budgetly-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-budgetly-accent outline-none appearance-none cursor-pointer w-full sm:w-48 hover:bg-budgetly-mid/70 transition-colors"
                        >
                            <option value="All" className="bg-budgetly-base">All Categories</option>
                            <option value="Food" className="bg-budgetly-base">Food</option>
                            <option value="Transport" className="bg-budgetly-base">Transport</option>
                            <option value="Entertainment" className="bg-budgetly-base">Fun</option>
                            <option value="Shopping" className="bg-budgetly-base">Shopping</option>
                            <option value="Bills" className="bg-budgetly-base">Bills</option>
                            <option value="Other" className="bg-budgetly-base">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-budgetly-sage" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <RefreshCcw className="animate-spin text-budgetly-accent" />
                </div>
            ) : (
                <div className="bg-budgetly-mid/20 rounded-2xl p-6 border border-white/5">
                    <ExpenseList expenses={filteredExpenses} onDelete={handleDelete} />
                </div>
            )}
        </div>
    );
}
