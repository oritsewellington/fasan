import {
  Crown,
  Users,
  Clock,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetEventPollQuery } from "../store/api/polls.Api";

const MEDALS = ["🥇", "🥈", "🥉"];

const RANK_STYLES = {
  1: {
    bar: "bg-gradient-to-r from-gold-400 to-gold-600",
    ring: "ring-2 ring-gold-400",
    row: "bg-gold-50/60",
  },
  2: {
    bar: "bg-gradient-to-r from-gray-300 to-gray-400",
    ring: "ring-1 ring-gray-300",
    row: "",
  },
  3: {
    bar: "bg-gradient-to-r from-amber-500 to-amber-600",
    ring: "ring-1 ring-amber-400",
    row: "",
  },
  default: {
    bar: "bg-gradient-to-r from-gray-300 to-gray-400",
    ring: "",
    row: "",
  },
};

function timeAgo(isoString) {
  if (!isoString) return "just now";
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoString)) / 1000),
  );
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatTotalVotes(count) {
  if (!count || count < 100) return `${count || 0}`;
  const rounded = Math.floor(count / 100) * 100;
  return `${rounded.toLocaleString()}+`;
}

export default function EventLeaderboard({ eventId, compact = false }) {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetEventPollQuery(eventId, {
      skip: !eventId,
      pollingInterval: 20000,
      refetchOnMountOrArgChange: true,
    });

  if (!eventId) return null;

  if (isLoading) return <LeaderboardSkeleton compact={compact} />;

  if (isError) {
    return (
      <div className="card p-6 text-center">
        <AlertTriangle size={22} className="text-gold-500 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-3">
          Couldn't load live standings right now.
        </p>
        <button
          onClick={refetch}
          className="text-xs font-semibold text-gold-600 hover:text-gold-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const candidates = data?.candidates || [];
  const visible = compact ? candidates.slice(0, 3) : candidates;

  if (candidates.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-gray-400">
        No candidates added to this event yet.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="section-label text-gold-600 mb-1">Live standings</p>
          <h3 className="font-body font-bold text-gray-900 text-lg leading-snug truncate">
            {data.eventTitle}
          </h3>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
          <span
            className={`w-1.5 h-1.5 bg-emerald-400 rounded-full ${
              isFetching ? "animate-pulse" : ""
            }`}
          />
          <span className="text-[11px] font-semibold text-emerald-600 tracking-wide">
            LIVE
          </span>
        </div>
      </div>

      {/* list */}
      <div className="divide-y divide-gray-50">
        {visible.map((c) => {
          const style = RANK_STYLES[c.rank] || RANK_STYLES.default;
          return (
            <Link
              key={c.id}
              to={`/events/${eventId}/candidates/${c.id}`}
              className={`group block px-6 py-4 transition-colors hover:bg-gray-50 ${style.row}`}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm">
                  {c.rank <= 3 ? (
                    MEDALS[c.rank - 1]
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-[11px] font-bold text-gray-500 flex items-center justify-center">
                      {c.rank}
                    </span>
                  )}
                </span>

                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${style.ring}`}
                >
                  {c.photo ? (
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-gray-500">
                      {initials(c.name)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gold-700 transition-colors">
                    {c.name}
                  </p>
                  {c.candidateCode && (
                    <p className="text-[10px] text-gray-400">
                      {c.candidateCode}
                    </p>
                  )}
                </div>

                {c.rank === 1 && (
                  <Crown size={14} className="text-gold-500 flex-shrink-0" />
                )}

                <span className="flex-shrink-0 text-xs font-semibold text-gray-500 tabular-nums">
                  {c.shareOfTotal}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${style.bar} transition-all duration-700 ease-out`}
                  style={{
                    width: `${Math.max(c.shareOfLeader, c.votes > 0 ? 3 : 0)}%`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        {/* <div className="flex items-center gap-1.5">
          <Users size={13} />
          {formatTotalVotes(data.totalVotes)} total votes
        </div> */}
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          Updated {timeAgo(data.updatedAt)}
        </div>
      </div>

      {compact && candidates.length > 3 && (
        <Link
          to={`/events/${eventId}/results`}
          className="flex items-center justify-center gap-1 px-6 py-3 text-xs font-semibold text-gold-600 hover:text-gold-700 border-t border-gray-100 transition-colors"
        >
          View full standings <ChevronRight size={13} />
        </Link>
      )}

      {!compact && (
        <Link
          to={`/events/${eventId}`}
          className="flex items-center justify-center gap-1.5 px-6 py-3.5 text-xs font-semibold text-gray-500 hover:text-gold-600 border-t border-gray-100 transition-colors"
        >
          Vote in this event <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function LeaderboardSkeleton({ compact }) {
  const rows = compact ? 3 : 6;
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
        <div className="h-5 w-40 bg-gray-100 rounded" />
      </div>
      <div className="px-6 py-5 space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-100" />
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <div className="h-3 flex-1 bg-gray-100 rounded" />
            </div>
            <div className="h-2 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
