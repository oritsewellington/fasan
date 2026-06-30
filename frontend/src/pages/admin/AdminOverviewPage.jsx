import { Link } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  Users,
  Vote,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useGetAdminStatsQuery } from "../../store/api/statsApi.js";
import { useGetEventsQuery } from "../../store/api/eventsApi.js";
import {
  StatCard,
  PageLoader,
  EventStatusBadge,
} from "../../components/ui/index.jsx";
import {
  formatNaira,
  formatNumber,
  getEventStatus,
  formatShortDate,
} from "../../utils/helpers.js";

export default function AdminOverviewPage() {
  const { data: stats, isLoading: sLoad } = useGetAdminStatsQuery();
  const { data: events = [], isLoading: eLoad } = useGetEventsQuery({});

  if (sLoad || eLoad) return <PageLoader />;

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-8">
        <p className="section-label mb-1">Admin Dashboard</p>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Platform Overview
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatNaira(stats?.totalRevenue || 0)}
          icon={DollarSign}
          colorClass="text-emerald-600"
        />
        <StatCard
          label="Platform Earnings"
          value={formatNaira(stats?.platformCuts || 0)}
          icon={TrendingUp}
          colorClass="text-gold-600"
        />
        <StatCard
          label="Total Votes"
          value={formatNumber(stats?.totalVotes || 0)}
          icon={Vote}
        />
        <StatCard
          label="Organizers"
          value={stats?.totalOrganizers || 0}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Events"
          value={stats?.totalEvents || 0}
          icon={Calendar}
        />
        <StatCard
          label="Active Events"
          value={stats?.activeEvents || 0}
          icon={Calendar}
          colorClass="text-emerald-600"
        />
        <StatCard
          label="Organizer Payouts"
          value={formatNaira(stats?.organizerPayouts || 0)}
          icon={DollarSign}
        />
        <StatCard
          label="Commission Rate"
          value={`${((stats?.platformCommission || 0.15) * 100).toFixed(0)}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900">
            Recent Events
          </h2>
          <Link
            to="/admin/events"
            className="text-sm text-gold-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No events yet.
            </p>
          ) : (
            recentEvents.map((ev) => (
              <Link
                key={ev._id}
                to="/admin/events"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {ev.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {ev.organization} • {formatShortDate(ev.createdAt)}
                  </p>
                </div>
                <EventStatusBadge
                  status={getEventStatus(ev.startDate, ev.endDate, ev.isOpen)}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
