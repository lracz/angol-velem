import { CONFETTI_COLORS } from '../../utils/helpers';

export function Confetti({ active }) {
    if (!active) return null;
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
            {Array.from({ length: 24 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti-piece"
                    style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${Math.random() * 30}%`,
                        backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                        animationDelay: `${Math.random() * 0.4}s`,
                        animationDuration: `${0.8 + Math.random() * 0.6}s`,
                        width: `${6 + Math.random() * 6}px`,
                        height: `${6 + Math.random() * 6}px`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    }}
                />
            ))}
        </div>
    );
}
