import { useForm } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';

export default function AddExpenseForm({ onAdd }) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: 'Food'
        }
    });

    const onSubmit = (data) => {
        onAdd({
            ...data,
            amount: Number(data.amount)
        });
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-6 rounded-2xl mb-8 relative z-10">
            <h3 className="text-lg font-bold text-budgetly-white mb-6 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-budgetly-accent/10">
                    <PlusCircle size={20} className="text-budgetly-accent" />
                </div>
                Add New Expense
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5">
                    <input
                        {...register('description', { required: 'Description is required' })}
                        placeholder="What did you buy?"
                        className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/40"
                    />
                    {errors.description && <span className="text-xs text-red-400 mt-1 block">{errors.description.message}</span>}
                </div>

                <div className="lg:col-span-3">
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        {...register('amount', { required: 'Amount required', min: 0.01 })}
                        placeholder="Amount (£)"
                        className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/40"
                    />
                    {errors.amount && <span className="text-xs text-red-400 mt-1 block">{errors.amount.message}</span>}
                </div>

                <div className="lg:col-span-2">
                    <select
                        {...register('category')}
                        className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all bg-budgetly-mid appearance-none cursor-pointer"
                    >
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Fun</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="lg:col-span-2">
                    <button
                        type="submit"
                        className="w-full h-full py-3 px-6 rounded-xl btn-primary flex items-center justify-center font-bold text-sm tracking-wide uppercase"
                    >
                        Add
                    </button>
                </div>
            </div>
        </form>
    );
}
