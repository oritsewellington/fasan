import { Link } from "react-router-dom";
import {
  Calendar,
  Vote,
  ArrowRight,
  Trophy,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice.js";
import { useGetStaffStatsQuery } from "../../store/api/statsApi.js";
import { useGetEventsQuery } from "../../store/api/eventsApi.js";
import {
  StatCard,
  PageLoader,
  EventStatusBadge,
} from "../../components/ui/index.jsx";
import {
  formatNumber,
  formatNaira,
  getEventStatus,
  formatShortDate,
} from "../../utils/helpers.js";

export default function OrganizerOverviewPage() {
  const user = useSelector(selectCurrentUser);
  const { data: stats, isLoading: sLoad } = useGetStaffStatsQuery();
  const { data: events = [], isLoading: eLoad } = useGetEventsQuery({});

  if (sLoad || eLoad) return <PageLoader />;

  const recent = [...events]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-1">Welcome back</p>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {user?.name}
          </h1>
        </div>
        <Link
          to="/polls"
          className="text-sm font-medium text-gold-600 hover:text-gold-700 flex items-center gap-1.5"
        >
          <Trophy size={15} /> View live results
        </Link>
      </div>

      {/* Revenue Transparency Grid (UPDATED to 3 columns on large viewports) */}
      <p className="section-label mb-3 text-gray-400">Revenue Transparency</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* NEW CARD PLACEMENT */}
        <StatCard
          label="Total Revenue"
          value={formatNaira(stats?.totalRevenue || 0)}
          icon={DollarSign}
        />
        <StatCard
          label={`Platform Earnings (${((stats?.platformCommission || 0.1) * 100).toFixed(0)}%)`}
          value={formatNaira(stats?.platformEarnings || 0)}
          icon={TrendingUp}
          colorClass="text-gold-600"
        />
        <StatCard
          label="Your Earnings (School Body)"
          value={formatNaira(stats?.schoolPayable || 0)}
          icon={DollarSign}
          colorClass="text-emerald-600"
        />
      </div>

      {/* Activity Statistics Grid */}
      <p className="section-label mb-3 text-gray-400">Activity</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Votes"
          value={formatNumber(stats?.totalVotes || 0)}
          icon={Vote}
        />
        <StatCard
          label="Total Events"
          value={stats?.totalEvents || 0}
          icon={Calendar}
        />
        <StatCard
          label="Active Events"
          value={stats?.activeEvents || 0}
          icon={Calendar}
          colorClass="text-gold-600"
        />
      </div>

      {/* Recent Events Card List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900">
            Recent Events
          </h2>
          <Link
            to="/organizer/events"
            className="text-sm text-gold-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No events yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((ev) => (
              <Link
                key={ev._id}
                to={`/organizer/events/${ev._id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {ev.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatShortDate(ev.createdAt)}
                  </p>
                </div>
                <EventStatusBadge
                  status={getEventStatus(ev.startDate, ev.endDate, ev.isOpen)}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
