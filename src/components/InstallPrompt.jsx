import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIosDevice);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, show prompt after a delay if not standalone
        if (isIosDevice && !isStandalone) {
            // Check if we've already shown it recently (optional localStorage check could go here)
            setTimeout(() => setShowPrompt(true), 10000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-96 bg-budgetly-base/95 backdrop-blur-md border border-budgetly-accent/20 rounded-2xl p-4 shadow-2xl z-50 animate-slide-up flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-budgetly-accent flex items-center justify-center text-budgetly-base">
                        <Download size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-budgetly-white">Install Budgetly</h3>
                        <p className="text-sm text-budgetly-sage">Add to home screen for quick access.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="p-1 text-budgetly-sage hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {isIOS ? (
                <div className="text-sm text-budgetly-sage bg-budgetly-mid/30 p-3 rounded-lg">
                    Tap <Share size={14} className="inline mx-1" /> then "Add to Home Screen"
                </div>
            ) : (
                <button
                    onClick={handleInstall}
                    className="w-full py-3 bg-budgetly-accent text-budgetly-base font-bold rounded-xl active:scale-95 transition-transform"
                >
                    Install Now
                </button>
            )}
        </div>
    );
}
