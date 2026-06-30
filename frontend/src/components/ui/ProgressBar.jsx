export default function ProgressBar({ value, max, height = 'h-2' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`${height} bg-gray-100 rounded-full overflow-hidden`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
