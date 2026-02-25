import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield, Smartphone, Heart, Linkedin } from 'lucide-react';
import { playSuccesSound, playHoverSound } from '../utils/sound';

export default function Landing() {
    const [savings, setSavings] = useState(12450);
    const [coffeeValue, setCoffeeValue] = useState(5);

    // Animated ticker effect
    useEffect(() => {
        const interval = setInterval(() => {
            setSavings(prev => prev + Math.floor(Math.random() * 5));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSliderChange = (e) => {
        setCoffeeValue(e.target.value);
        playHoverSound();
    };

    const yearlyCost = coffeeValue * 365;

    return (
        <div className="min-h-screen bg-budgetly-base text-budgetly-white overflow-hidden relative selection:bg-budgetly-accent selection:text-budgetly-base">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-budgetly-mid/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-budgetly-accent/5 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-xl sm:text-2xl font-bold tracking-tighter flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-budgetly-accent rounded-lg flex items-center justify-center text-budgetly-base flex-shrink-0">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-budgetly-base" fill="currentColor" />
                    </div>
                    Budgetly
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link to="/login" className="text-sm sm:text-base text-budgetly-sage hover:text-budgetly-white font-medium transition-colors">Login</Link>
                    <Link
                        to="/signup"
                        className="text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all whitespace-nowrap"
                        onMouseEnter={playHoverSound}
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-budgetly-accent/10 border border-budgetly-accent/20 text-budgetly-accent text-sm font-bold uppercase tracking-wider mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-budgetly-accent animate-pulse" />
                        Students saved £{savings.toLocaleString()} today
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Stop Being <span className="text-transparent bg-clip-text bg-gradient-to-r from-budgetly-sage to-white/50">Broke.</span> <br />
                        Start <span className="text-budgetly-accent relative inline-block">
                            Living
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-budgetly-accent opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                            </svg>
                        </span>.
                    </h1>

                    <p className="text-xl text-budgetly-sage mb-12 max-w-2xl mx-auto leading-relaxed">
                        The student budget tracker that's actually satisfying to use.
                        Log expenses via Telegram in seconds. Correct your habits before you run out of cash.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            onClick={playSuccesSound}
                            className="group relative px-8 py-4 bg-budgetly-accent text-budgetly-base text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(204,255,0,0.3)] hover:shadow-[0_0_60px_rgba(204,255,0,0.5)] transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="flex items-center gap-2">
                                Start Saving Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-budgetly-mid/30 text-budgetly-white font-bold rounded-2xl border border-white/5 hover:bg-budgetly-mid/50 transition-all backdrop-blur-md"
                        >
                            Live Demo
                        </Link>
                    </div>

                    <p className="mt-8 text-sm font-medium text-budgetly-sage flex items-center justify-center gap-2">
                        <CheckCircle size={16} className="text-budgetly-accent" /> 100% Free forever. No ads, no subscriptions.
                    </p>
                </div>
            </section>

            {/* The "Ouch" Calculator */}
            <section className="relative z-10 py-24 bg-black/20 backdrop-blur-sm border-t border-white/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-12">How much are your "little treats" costing you?</h2>

                    <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden group">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-budgetly-accent/5 rounded-full blur-[80px]" />

                        <div className="relative z-10">
                            <label className="block text-budgetly-sage font-medium mb-4 uppercase tracking-widest text-sm">Daily Spend on Coffee/Snacks</label>
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <span className="text-2xl font-bold text-budgetly-sage">£1</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="0.5"
                                    value={coffeeValue}
                                    onChange={handleSliderChange}
                                    className="w-full h-4 bg-budgetly-base rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-budgetly-accent hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(204,255,0,0.5)]"
                                />
                                <span className="text-2xl font-bold text-budgetly-sage">£20</span>
                            </div>

                            <div className="text-6xl md:text-8xl font-black text-budgetly-white tracking-tighter mb-2 transition-all duration-300">
                                £{coffeeValue}
                            </div>
                            <p className="text-budgetly-sage mb-8">per day</p>

                            <div className="w-full h-px bg-white/10 mb-8" />

                            <div className="space-y-2">
                                <p className="text-lg text-budgetly-sage">Equals a shocking</p>
                                <div className={`text-4xl md:text-5xl font-bold ${yearlyCost > 2000 ? 'text-red-500' : 'text-budgetly-accent'} transition-colors`}>
                                    £{yearlyCost.toLocaleString()} / year
                                </div>
                                <p className="text-sm text-white/40">Use that for a holiday instead. ✈️</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-white/5 group">
                        <div className="w-14 h-14 bg-budgetly-mid rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Smartphone size={32} className="text-budgetly-accent" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Telegram Integration</h3>
                        <p className="text-budgetly-sage leading-relaxed">
                            Text your expenses like you're texting a friend. "Lunch £12". Done. No more opening complex apps.
                        </p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-white/5 group">
                        <div className="w-14 h-14 bg-budgetly-mid rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield size={32} className="text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Guilt-Free Spending</h3>
                        <p className="text-budgetly-sage leading-relaxed">
                            Set a "Fun Money" budget. As long as the bar is green, buy whatever you want without the guilt.
                        </p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-white/5 group">
                        <div className="w-14 h-14 bg-budgetly-mid rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <CheckCircle size={32} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Simple Reports</h3>
                        <p className="text-budgetly-sage leading-relaxed">
                            See exactly where your money goes. "Why am I broke?" → "Oh, £200 on Uber Eats." Mystery solved.
                        </p>
                    </div>
                </div>
            </section>

            <footer className="py-12 text-center text-budgetly-sage text-sm relative z-10 flex flex-col items-center gap-4">
                <p>&copy; {new Date().getFullYear()} Budgetly. Built for Students.</p>
                <div className="flex items-center gap-2 text-budgetly-sage justify-center">
                    Made with <Heart size={14} className="text-red-500 fill-current" /> by Goutam Chandnani
                    <a
                        href="https://www.linkedin.com/in/goutamchandnani/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-budgetly-sage hover:text-budgetly-accent transition-colors ml-2"
                    >
                        <Linkedin size={18} />
                    </a>
                </div>
            </footer>

        </div>
    );
}
