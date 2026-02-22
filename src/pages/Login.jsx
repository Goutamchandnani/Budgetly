import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            // Check if it's an array of errors (from express-validator)
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                toast.error(error.response.data.errors[0].msg);
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Failed to login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-budgetly-base flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-budgetly-mid/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-budgetly-accent/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-budgetly-mid rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                            <User className="w-8 h-8 text-budgetly-accent" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-budgetly-white tracking-tight">Welcome Back</h2>
                    <p className="text-budgetly-sage mt-2">Sign in to manage your finances</p>
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
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-budgetly-sage uppercase tracking-wider">Password</label>
                            <Link to="/forgot-password" className="text-xs text-budgetly-accent hover:underline">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/30"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl btn-primary flex justify-center items-center gap-2 text-sm uppercase tracking-wide"
                    >
                        {loading ? 'Signing in...' : (
                            <>
                                <LogIn size={18} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-budgetly-sage">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-bold text-budgetly-accent hover:underline">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
