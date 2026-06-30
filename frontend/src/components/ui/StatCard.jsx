export default function StatCard({ label, value, subValue, icon: Icon, colorClass = 'text-gray-900' }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {Icon && <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center"><Icon size={15} className="text-gray-400" /></div>}
      </div>
      <p className={`text-2xl font-bold font-display ${colorClass}`}>{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
    </div>
  );
}
