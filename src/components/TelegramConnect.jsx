import { useState, useEffect } from 'react';
import { telegramService } from '../services/api';
import { MessageSquare, RefreshCw, Unplug, CheckCircle, Copy, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TelegramConnect() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatedCode, setGeneratedCode] = useState(null);

    const fetchStatus = async () => {
        try {
            const response = await telegramService.getStatus();
            setStatus(response.data);
        } catch (error) {
            console.error("Failed to fetch Telegram status", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(() => {
            if (generatedCode && !status?.connected) {
                fetchStatus();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [generatedCode, status?.connected]);

    const handleGenerateCode = async () => {
        try {
            setLoading(true);
            const response = await telegramService.generateCode();
            setGeneratedCode(response.data.linkingCode);
            toast.success("Connection code generated!");
        } catch (error) {
            toast.error("Failed to generate code");
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!window.confirm("Are you sure you want to disconnect Telegram?")) return;

        try {
            setLoading(true);
            await telegramService.disconnect();
            setStatus({ connected: false });
            setGeneratedCode(null);
            toast.success("Disconnected successfully");
        } catch (error) {
            toast.error("Failed to disconnect");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !status) return <div className="text-budgetly-sage text-sm p-4 animate-pulse">Checking connection...</div>;

    return (
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Send size={120} className="text-budgetly-white" />
            </div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-budgetly-white">Telegram Integration</h3>
                    <p className="text-budgetly-sage text-sm">Log expenses instantly via chat</p>
                </div>
            </div>

            <div className="bg-budgetly-base/40 rounded-xl p-6 border border-white/5 relative z-10">
                {status?.connected ? (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 text-green-400 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <CheckCircle size={32} />
                        </div>

                        <h4 className="font-bold text-lg text-budgetly-white mb-1">Connected Active</h4>

                        <div className="flex items-center gap-2 text-sm text-budgetly-sage mb-8 bg-budgetly-mid/50 px-3 py-1 rounded-full border border-white/5">
                            <span>Chat ID: <span className="font-mono text-budgetly-white">{status.chatId}</span></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>

                        <button
                            onClick={handleDisconnect}
                            className="flex items-center gap-2 px-6 py-2.5 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm"
                        >
                            <Unplug size={18} />
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <div>
                        {!generatedCode ? (
                            <div className="text-center py-2">
                                <p className="text-budgetly-sage mb-8 leading-relaxed">
                                    Send messages like <span className="text-budgetly-white font-mono bg-white/5 px-1.5 py-0.5 rounded">Lunch 150</span> directly to our bot to track your expenses in real-time.
                                </p>
                                <button
                                    onClick={handleGenerateCode}
                                    className="w-full py-3.5 px-6 rounded-xl btn-primary font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                                >
                                    <Send size={18} />
                                    Connect Telegram Account
                                </button>
                            </div>
                        ) : (
                            <div className="text-center animate-fade-in">
                                <p className="text-sm text-budgetly-sage mb-6">
                                    Open the Telegram bot and send this code to link your account:
                                </p>
                                <div className="glass-panel border-budgetly-accent/30 p-4 mb-6 flex items-center justify-between max-w-xs mx-auto rounded-xl">
                                    <span className="text-2xl font-mono font-bold text-budgetly-white tracking-widest">
                                        {generatedCode}
                                    </span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedCode)}
                                        className="p-2 text-budgetly-sage hover:text-budgetly-accent transition-colors bg-white/5 rounded-lg"
                                        title="Copy code"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-sm text-budgetly-accent animate-pulse font-medium bg-budgetly-accent/10 py-2 rounded-lg">
                                    <RefreshCw size={16} className="animate-spin" />
                                    Waiting for connection...
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
