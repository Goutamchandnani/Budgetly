import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
    const [pulling, setPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (startY === 0) return;
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY;

        if (distance > 0 && window.scrollY === 0) {
            // Add resistance
            setPullDistance(Math.min(distance * 0.5, 120));
            if (distance > 80) {
                setPulling(true);
            } else {
                setPulling(false);
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pulling && !refreshing) {
            setRefreshing(true);
            setPullDistance(60); // Snap to loading position
            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
                setPullDistance(0);
                setPulling(false);
            }
        } else {
            setPullDistance(0);
            setPulling(false);
        }
        setStartY(0);
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen relative"
        >
            <div
                style={{
                    height: pullDistance,
                    opacity: pullDistance > 0 ? 1 : 0,
                    transition: pulling ? 'none' : 'height 0.3s ease-out, opacity 0.3s'
                }}
                className="flex items-center justify-center overflow-hidden w-full absolute top-0 left-0 right-0 z-0 bg-transparent text-budgetly-accent"
            >
                <div className="flex items-center gap-2 transform translate-y-2">
                    <RefreshCw
                        size={20}
                        className={`${refreshing ? 'animate-spin' : ''} ${pulling ? 'rotate-180 transition-transform duration-300' : ''}`}
                    />
                    <span className="text-xs font-semibold">
                        {refreshing ? 'Refreshing...' : pulling ? 'Release to refresh' : 'Pull to refresh'}
                    </span>
                </div>
            </div>

            <div
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: pulling ? 'none' : 'transform 0.3s ease-out'
                }}
                className="relative z-10"
            >
                {children}
            </div>
        </div>
    );
}
