import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await authService.forgotPassword(email);
            setSubmitted(true);
            toast.success('Reset link sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-budgetly-base flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-budgetly-mid/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-budgetly-accent/5 rounded-full blur-[120px]" />

                <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center shadow-lg border border-green-500/30 mb-6">
                        <Send className="w-8 h-8 text-green-400" />
                    </div>

                    <h2 className="text-3xl font-bold text-budgetly-white tracking-tight mb-4">Check your email</h2>
                    <p className="text-budgetly-sage mb-8">
                        We've sent a password reset link to <span className="font-semibold text-budgetly-white">{email}</span>
                    </p>

                    <Link
                        to="/login"
                        className="w-full py-3.5 px-4 rounded-xl btn-primary flex justify-center items-center gap-2 text-sm uppercase tracking-wide"
                    >
                        <ArrowLeft size={18} />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-budgetly-base flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-budgetly-mid/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-budgetly-accent/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-budgetly-mid rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                            <Mail className="w-8 h-8 text-budgetly-accent" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-budgetly-white tracking-tight">Forgot Password?</h2>
                    <p className="text-budgetly-sage mt-2">No worries, we'll send you reset instructions</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-budgetly-sage uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/30"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl btn-primary flex justify-center items-center gap-2 text-sm uppercase tracking-wide"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-budgetly-sage hover:text-budgetly-white transition-colors">
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
