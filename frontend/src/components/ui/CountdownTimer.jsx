import { useCountdown } from '../../hooks/useCountdown.js';

export default function CountdownTimer({ targetDate, label = 'Ends in' }) {
  const t = useCountdown(targetDate);
  if (t.expired) return <span className="text-xs text-red-500 font-medium">Voting ended</span>;
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-400">{label}:</span>
      <span className="font-mono font-bold text-gray-700 tabular-nums">
        {t.days > 0 && <>{t.days}d </>}
        {String(t.hours).padStart(2,'0')}:{String(t.minutes).padStart(2,'0')}:{String(t.seconds).padStart(2,'0')}
      </span>
    </div>
  );
}
