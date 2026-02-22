import { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import { getCurrentMonthISO } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/formatCurrency';
import MonthSelector from '../components/MonthSelector';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { RefreshCcw, Download, TrendingUp, CreditCard, Hash } from 'lucide-react';

// Custom Palette for Charts
const COLORS = [
    '#CCFF00', // Electric Lime (Accent)
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#ec4899', // Pink
];

export default function Reports() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthISO());

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                const response = await expenseService.getExpenses(selectedMonth);
                setExpenses(response.data.expenses || []);
            } catch (error) {
                console.error("Failed to load report data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, [selectedMonth]);

    // Aggregate data for Pie Chart
    const dataByCategory = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const chartData = Object.keys(dataByCategory).map(key => ({
        name: key,
        value: dataByCategory[key]
    }));

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const handleExport = () => {
        const headers = ['Date,Description,Category,Amount'];
        const csvContent = expenses.map(e =>
            `${new Date(e.date).toLocaleDateString()},"${e.description}",${e.category},${e.amount}`
        ).join('\n');

        const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${selectedMonth}.csv`;
        a.click();
    };

    if (loading) return <div className="flex justify-center p-12"><RefreshCcw className="animate-spin text-budgetly-accent" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-budgetly-white tracking-tight">Financial Reports</h1>
                    <p className="text-budgetly-sage mt-1">Analysis for {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Summary Cards */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp size={64} className="text-budgetly-accent" />
                    </div>
                    <h3 className="text-xs font-bold text-budgetly-sage uppercase tracking-widest mb-2">Total Spent</h3>
                    <p className="text-3xl font-bold text-budgetly-white">{formatCurrency(totalSpent)}</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Hash size={64} className="text-blue-400" />
                    </div>
                    <h3 className="text-xs font-bold text-budgetly-sage uppercase tracking-widest mb-2">Transactions</h3>
                    <p className="text-3xl font-bold text-budgetly-white">{expenses.length}</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CreditCard size={64} className="text-purple-400" />
                    </div>
                    <h3 className="text-xs font-bold text-budgetly-sage uppercase tracking-widest mb-2">Average / Tx</h3>
                    <p className="text-3xl font-bold text-budgetly-white">
                        {formatCurrency(expenses.length ? totalSpent / expenses.length : 0)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-2xl min-h-[400px]">
                    <h3 className="text-lg font-bold text-budgetly-white mb-8 border-b border-white/5 pb-4">Spending by Category</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ backgroundColor: '#1B4D3E', borderColor: '#88A096', color: '#F5F5F5', borderRadius: '12px' }}
                                    itemStyle={{ color: '#F5F5F5' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-budgetly-sage opacity-50 border border-dashed border-white/10 rounded-xl">
                            No data available
                        </div>
                    )}
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <h3 className="text-lg font-bold text-budgetly-white">Detailed Breakdown</h3>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-budgetly-white bg-budgetly-mid hover:bg-budgetly-sage/20 px-4 py-2 rounded-lg transition-colors border border-white/10"
                        >
                            <Download size={14} />
                            Export
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-bold text-budgetly-sage uppercase tracking-wider">
                                    <th className="pb-4 pl-2">Category</th>
                                    <th className="pb-4 text-right pr-4">Amount</th>
                                    <th className="pb-4 text-right pr-2">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {chartData.sort((a, b) => b.value - a.value).map((item, index) => (
                                    <tr key={item.name} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2 flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="font-medium text-budgetly-white">{item.name}</span>
                                        </td>
                                        <td className="py-4 text-right pr-4 text-budgetly-white font-medium">
                                            {formatCurrency(item.value)}
                                        </td>
                                        <td className="py-4 text-right pr-2 text-budgetly-sage font-medium">
                                            {((item.value / totalSpent) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
