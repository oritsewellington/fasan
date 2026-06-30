export function EventStatusBadge({ status }) {
  const map = {
    open:     'badge-open',
    closed:   'badge-closed',
    upcoming: 'badge-upcoming',
  };
  const dot = { open: 'bg-emerald-400', closed: 'bg-red-400', upcoming: 'bg-blue-400' };
  return (
    <span className={map[status] || 'badge-closed'}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || 'bg-gray-400'} ${status === 'open' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}
