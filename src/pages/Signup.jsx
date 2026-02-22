import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }

        if (formData.password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        if (!agreedToTerms) {
            return toast.error("You must agree to the Terms & Privacy Policy");
        }

        try {
            setLoading(true);
            await signup(formData.email, formData.password, formData.name);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-budgetly-base flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-budgetly-mid/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-budgetly-accent/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-budgetly-mid rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                            <BookOpen className="w-8 h-8 text-budgetly-accent" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-budgetly-white tracking-tight">Create Account</h2>
                    <p className="text-budgetly-sage mt-2">Start your financial journey today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-budgetly-sage uppercase tracking-wider mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/30"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-budgetly-sage uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/30"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-budgetly-sage uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/30"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-budgetly-sage uppercase tracking-wider mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl glass-input outline-none transition-all placeholder:text-budgetly-sage/30"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 rounded border-budgetly-sage/30 bg-white/5 text-budgetly-accent focus:ring-budgetly-accent/50 transition-colors cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-sm text-budgetly-sage cursor-pointer select-none">
                            I agree to the <Link to="/privacy" target="_blank" className="text-budgetly-accent hover:underline">Privacy Policy</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 rounded-xl btn-primary flex justify-center items-center gap-2 text-sm uppercase tracking-wide mt-4"
                    >
                        {loading ? 'Creating Account...' : (
                            <>
                                <UserPlus size={18} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-budgetly-sage">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-budgetly-accent hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
