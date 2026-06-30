import { Link } from "react-router-dom";
import {
  DollarSign,
  Calendar,
  Vote,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice.js";
import { useGetOrganizerStatsQuery } from "../../store/api/statsApi.js";
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

export default function OrganizerOverviewPage() {
  const user = useSelector(selectCurrentUser);
  const { data: stats, isLoading: sLoad } = useGetOrganizerStatsQuery(
    user?._id || user?.id,
  );
  const { data: allEvents = [], isLoading: eLoad } = useGetEventsQuery({
    mine: "true",
  });

  if (sLoad || eLoad) return <PageLoader />;

  const myEvents = allEvents.filter(
    (e) => (e.organizer?._id || e.organizerId) === (user?._id || user?.id),
  );
  const recent = [...myEvents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-8">
        <p className="section-label mb-1">Welcome back</p>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {user?.name}'s Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Earnings"
          value={formatNaira(stats?.totalEarnings || 0)}
          icon={DollarSign}
          colorClass="text-emerald-600"
        />
        <StatCard
          label="Total Revenue"
          value={formatNaira(stats?.totalRevenue || 0)}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Votes"
          value={formatNumber(stats?.totalVotes || 0)}
          icon={Vote}
        />
        <StatCard
          label="Active Events"
          value={stats?.activeEvents || 0}
          icon={Calendar}
          colorClass="text-gold-600"
        />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900">
            My Recent Events
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
            No events assigned to you yet.
          </p>
        ) : (
          recent.map((ev) => (
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
          ))
        )}
      </div>
    </div>
  );
}
