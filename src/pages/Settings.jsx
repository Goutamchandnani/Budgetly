import { useState, useEffect } from 'react';
import { authService, budgetService } from '../services/api';
import TelegramConnect from '../components/TelegramConnect';
import { Save, Settings as SettingsIcon, Download, Trash2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);

    // GDPR States
    const [exportLoading, setExportLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await budgetService.getBudget();
                setBudget(response.data.monthlyBudget || 0);
            } catch (error) {
                console.error("Failed to fetch budget");
            }
        };
        fetchBudget();
    }, []);

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        if (budget <= 0) return toast.error('Budget must be positive');

        try {
            setLoading(true);
            await budgetService.updateBudget(Number(budget));
            toast.success('Budget updated successfully');
        } catch (error) {
            toast.error('Failed to update budget');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            setExportLoading(true);
            const response = await authService.exportData();

            // Convert expenses to CSV
            const expenses = response.data.expenses || [];
            const headers = ['Date', 'Description', 'Amount', 'Category', 'Added Via'];

            const csvContent = [
                headers.join(','),
                ...expenses.map(exp => {
                    const date = new Date(exp.date).toISOString().split('T')[0];
                    const description = `"${(exp.description || '').replace(/"/g, '""')}"`; // Escape quotes
                    const amount = exp.amount;
                    const category = exp.category || 'Uncategorized';
                    const addedVia = exp.addedVia || 'web';
                    return [date, description, amount, category, addedVia].join(',');
                })
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            // Create a link to download the blob
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `budgetly-expenses-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Data exported successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export data');
        } finally {
            setExportLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        try {
            setDeleteLoading(true);
            await authService.deleteAccount();

            toast.success('Account deleted successfully');
            localStorage.removeItem('token');
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete account');
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="border-b border-white/5 pb-6">
                <h1 className="text-3xl font-bold text-budgetly-white tracking-tight">Settings</h1>
                <p className="text-budgetly-sage mt-1">Configure your budget and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Budget Setting */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <SettingsIcon size={120} className="text-budgetly-white" />
                    </div>

                    <h3 className="text-xl font-bold text-budgetly-white mb-4 relative z-10">Monthly Budget</h3>
                    <p className="text-budgetly-sage text-sm mb-8 relative z-10">
                        Set your target monthly spending limit. This amount tracks your progress throughout the month.
                    </p>

                    <form onSubmit={handleSaveBudget} className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-budgetly-sage uppercase tracking-wider mb-2">Amount (£)</label>
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                min="1"
                                required
                                className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/40 font-bold text-lg"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl btn-primary flex items-center justify-center gap-2 font-bold uppercase tracking-wide text-sm"
                            >
                                <Save size={18} />
                                Save Budget
                            </button>
                        </div>
                    </form>
                </div>

                {/* Telegram Integration */}
                <TelegramConnect />

                {/* Data & Privacy */}
                <div className="glass-panel p-8 rounded-2xl md:col-span-2 relative overflow-hidden border border-red-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <AlertTriangle size={120} className="text-red-500" />
                    </div>

                    <h3 className="text-xl font-bold text-budgetly-white mb-4 relative z-10">Data & Privacy</h3>
                    <p className="text-budgetly-sage text-sm mb-8 relative z-10 max-w-2xl">
                        Manage your data and account settings. You can export your data or delete your account permanently.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <button
                            onClick={handleExportData}
                            disabled={exportLoading}
                            className="px-6 py-3 rounded-xl glass-button text-budgetly-white flex items-center justify-center gap-2 font-bold transition-all hover:bg-white/10"
                        >
                            <Download size={18} />
                            {exportLoading ? 'Exporting...' : 'Export Data'}
                        </button>

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/50 flex items-center justify-center gap-2 font-bold transition-all hover:bg-red-500/20"
                        >
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative border border-red-500/30">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute top-4 right-4 text-budgetly-sage hover:text-budgetly-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-budgetly-white mb-2">Delete Account?</h2>
                                <p className="text-budgetly-sage text-sm">
                                    This action is <span className="text-red-400 font-bold">irreversible</span>. All your data including expenses and settings will be permanently lost.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-budgetly-sage uppercase tracking-wider mb-2">
                                        Type "DELETE" to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/40 font-bold text-center"
                                        placeholder="DELETE"
                                    />
                                </div>

                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                                    className="w-full px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 font-bold transition-all"
                                >
                                    {deleteLoading ? (
                                        'Deleting...'
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            Confirm Deletion
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full px-6 py-3 rounded-xl glass-button text-budgetly-sage hover:text-budgetly-white font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}            </div>
        </div>
    );
}
