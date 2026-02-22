import React from 'react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-budgetly-base p-6 md:p-12 animate-fade-in relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-budgetly-mid/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-budgetly-accent/5 rounded-full blur-[120px]" />

            <div className="max-w-4xl mx-auto relative z-10 glass-panel p-8 md:p-12 rounded-3xl border border-white/5">
                <Link to="/" className="inline-flex items-center text-budgetly-sage hover:text-budgetly-white mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </Link>

                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-budgetly-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-budgetly-accent">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-budgetly-white mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-xl text-budgetly-sage max-w-2xl mx-auto">
                        We value your trust and are committed to protecting your personal data.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Overview */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-budgetly-white flex items-center gap-3">
                            <Eye className="text-budgetly-accent" size={24} />
                            Data Collection
                        </h2>
                        <p className="text-budgetly-sage leading-relaxed">
                            Budgetly collects minimal personal data to provide our expense tracking services.
                            This includes your name, email address, and the financial data you input (expenses, budget limits).
                            We do not share this information with third parties for marketing purposes.
                        </p>
                    </section>

                    {/* Section 2: Usage */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-budgetly-white flex items-center gap-3">
                            <Lock className="text-budgetly-accent" size={24} />
                            Data Usage & Security
                        </h2>
                        <p className="text-budgetly-sage leading-relaxed">
                            Your data is used solely to functionality of the app, such as calculating your budget status and generating reports.
                            We employ industry-standard encryption and security measures to ensure your information remains confidential and safe.
                        </p>
                    </section>

                    {/* Section 3: User Rights */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-budgetly-white flex items-center gap-3">
                            <FileText className="text-budgetly-accent" size={24} />
                            Your Rights
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold text-budgetly-white mb-2">Data Export</h3>
                                <p className="text-sm text-budgetly-sage">
                                    You can download a full copy of your personal data and expense history directly from the Settings page.
                                </p>
                            </div>
                            <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                                <h3 className="font-bold text-red-400 mb-2">Account Deletion</h3>
                                <p className="text-sm text-budgetly-sage">
                                    You have the right to request permanent deletion of your account and all associated data at any time via the Settings page. This action is irreversible.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Contact */}
                    <section className="pt-8 border-t border-white/10 text-center">
                        <p className="text-budgetly-sage">
                            If you have questions about this policy, please contact us at <a href="mailto:budgetlyy@gmail.com" className="text-budgetly-accent hover:underline">budgetlyy@gmail.com</a>.
                        </p>
                        <p className="text-xs text-budgetly-sage/50 mt-4">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
