import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { budgetService, expenseService } from '../services/api';
import { getCurrentMonthISO } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/formatCurrency';
import BudgetCard from '../components/BudgetCard';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, RefreshCcw, TrendingUp, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import PullToRefresh from '../components/PullToRefresh';
import MobileAddExpense from '../components/MobileAddExpense';
import { haptics } from '../utils/haptics';

export default function Dashboard() {
    const [budget, setBudget] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileAddOpen, setIsMobileAddOpen] = useState(false);
    const { currentUser } = useAuth();
    const currentMonth = getCurrentMonthISO();

    const fetchData = useCallback(async () => {
        try {
            const [budgetRes, expensesRes] = await Promise.all([
                budgetService.getBudget(),
                expenseService.getExpenses(currentMonth)
            ]);
            setBudget(budgetRes.data.monthlyBudget || 0);
            setExpenses(expensesRes.data.expenses || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAddExpense = async (newExpense) => {
        try {
            const response = await expenseService.addExpense(newExpense);
            haptics.success();
            setExpenses(prev => [response.data, ...prev]);
            toast.success('Expense added successfully');
        } catch (error) {
            haptics.error();
            toast.error('Failed to add expense');
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await expenseService.deleteExpense(id);
            setExpenses(prev => prev.filter(exp => (exp._id || exp.id) !== id));
            toast.success('Expense deleted');
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (loading) return <div className="flex justify-center p-12"><RefreshCcw className="animate-spin text-budgetly-accent" /></div>;

    return (
        <PullToRefresh onRefresh={fetchData}>
            <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-0">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-budgetly-white tracking-tight">Dashboard</h1>
                        <p className="text-budgetly-sage mt-1 text-sm md:text-base">Overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center gap-2 px-4 py-2 bg-budgetly-mid/30 rounded-full border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-budgetly-sage">Live Updates Active</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        <BudgetCard budget={budget} spent={totalSpent} />

                        {/* Desktop Add Form */}
                        <div className="hidden md:block">
                            <AddExpenseForm onAdd={handleAddExpense} />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h3 className="text-lg md:text-xl font-bold text-budgetly-white">Recent Activity</h3>
                                <Link to="/expenses" className="text-sm text-budgetly-accent hover:underline">View All</Link>
                            </div>
                            <ExpenseList expenses={expenses.slice(0, 5)} onDelete={handleDeleteExpense} />
                        </div>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        {/* Quick Stats / Tips */}
                        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-budgetly-accent">
                            <h3 className="flex items-center gap-2 font-bold text-budgetly-white mb-4">
                                <AlertCircle size={20} className="text-budgetly-accent" />
                                Smart Tips
                            </h3>
                            <ul className="text-sm text-budgetly-sage space-y-3">
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-budgetly-accent mt-1.5 flex-shrink-0" />
                                    Connect Telegram for instant logging.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-budgetly-accent mt-1.5 flex-shrink-0" />
                                    Keep "Dining Out" under 20% of budget.
                                </li>
                                <li className="flex gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-budgetly-accent mt-1.5 flex-shrink-0" />
                                    Export reports for detailed analysis.
                                </li>
                            </ul>
                        </div>

                        {/* Mini Stat */}
                        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                            <div className="p-3 rounded-full bg-budgetly-mid/50 text-budgetly-accent border border-white/5">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <div className="text-xs text-budgetly-sage uppercase tracking-wider font-semibold">Daily Average</div>
                                <div className="text-xl font-bold text-budgetly-white">
                                    {formatCurrency(expenses.length ? Math.round(totalSpent / new Date().getDate()) : 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Action Button */}
                <button
                    onClick={() => {
                        haptics.medium();
                        setIsMobileAddOpen(true);
                    }}
                    className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-budgetly-accent text-budgetly-base rounded-full shadow-[0_4px_20px_rgba(204,255,0,0.4)] flex items-center justify-center z-40 active:scale-90 transition-transform"
                >
                    <Plus size={32} />
                </button>

                {/* Mobile Add Expense Sheet */}
                <MobileAddExpense
                    isOpen={isMobileAddOpen}
                    onClose={() => setIsMobileAddOpen(false)}
                    onAdd={handleAddExpense}
                />
            </div>
        </PullToRefresh>
    );
}
