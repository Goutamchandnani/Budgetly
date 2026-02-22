import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function MobileAddExpense({ isOpen, onClose, onAdd }) {
    const [isAnimating, setIsAnimating] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: 'Food'
        }
    });

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const onSubmit = (data) => {
        onAdd({
            ...data,
            amount: Number(data.amount)
        });
        reset();
        handleClose();
    };

    if (!isOpen) return null;

    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={handleClose}
            />

            {/* Bottom Sheet */}
            <div
                className={`
          relative w-full bg-budgetly-base border-t border-white/10 rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]
          transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl
          ${isAnimating ? 'translate-y-0' : 'translate-y-full'}
        `}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle Bar */}
                <div className="w-12 h-1.5 bg-budgetly-mid rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add Expense</h2>
                    <button onClick={handleClose} className="p-2 bg-white/5 rounded-full text-budgetly-sage hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Large Amount Input */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative">
                            <span className="absolute left-[-2rem] top-1/2 -translate-y-1/2 text-3xl text-budgetly-sage font-light">£</span>
                            <input
                                type="number"
                                step="0.01"
                                autoFocus
                                {...register('amount', { required: true, min: 0.01 })}
                                placeholder="0.00"
                                className="bg-transparent text-5xl font-bold text-center text-budgetly-accent w-48 outline-none placeholder:text-budgetly-mid/30"
                            />
                        </div>
                        {errors.amount && <span className="text-red-400 text-sm mt-2">Amount required</span>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-budgetly-sage uppercase tracking-wider mb-2 block">Description</label>
                        <input
                            {...register('description', { required: true })}
                            placeholder="What did you buy?"
                            className="w-full bg-budgetly-mid/30 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-budgetly-sage/40 outline-none focus:border-budgetly-accent/50 transition-colors"
                        />
                        {errors.description && <span className="text-red-400 text-sm mt-1 block">Description required</span>}
                    </div>

                    {/* Category Chips */}
                    <div>
                        <label className="text-xs font-semibold text-budgetly-sage uppercase tracking-wider mb-2 block">Category</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <div key={cat} className="relative">
                                    <input
                                        type="radio"
                                        value={cat}
                                        {...register('category')}
                                        id={`cat-${cat}`}
                                        className="peer sr-only"
                                    />
                                    <label
                                        htmlFor={`cat-${cat}`}
                                        className="inline-block px-4 py-2 rounded-full border border-white/10 bg-budgetly-mid/20 text-budgetly-sage peer-checked:bg-budgetly-accent peer-checked:text-budgetly-base peer-checked:border-budgetly-accent peer-checked:font-bold transition-all whitespace-nowrap cursor-pointer"
                                    >
                                        {cat}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-budgetly-accent text-budgetly-base font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={24} />
                        Save Expense
                    </button>
                </form>
            </div>
        </div>
    );
}
