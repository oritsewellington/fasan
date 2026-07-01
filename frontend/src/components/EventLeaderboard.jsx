import { Crown, Users, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetEventPollQuery } from "../store/api/polls.Api";

/**
 * EventLeaderboard
 * -----------------------------------------------------------------------
 * Live standings for one event's candidates. Every number — votes, rank,
 * percentages — comes from GET /api/polls/:eventId, which itself reads
 * straight off Candidate.totalVotes / Event.totalVotes: counters that
 * are only ever incremented inside verifyPayment() after Paystack
 * confirms the transaction. So this is already "confirmed votes only",
 * no separate filtering needed here.
 *
 * - Bar length = shareOfLeader (relative to whoever's winning right now,
 *   leader is always 100%).
 * - The % label = shareOfTotal (share of all votes cast in this event).
 * - Polls the backend every 20s so standings feel live without websockets.
 */

const RANK_STYLES = {
  1: {
    bar: "bg-gradient-to-r from-gold-400 to-gold-500",
    ring: "ring-2 ring-gold-400",
    badge: "bg-gold-500 text-gray-900",
  },
  2: {
    bar: "bg-gradient-to-r from-gray-300 to-gray-400",
    ring: "ring-1 ring-gray-300",
    badge: "bg-gray-300 text-gray-900",
  },
  3: {
    bar: "bg-gradient-to-r from-amber-600 to-amber-700",
    ring: "ring-1 ring-amber-600",
    badge: "bg-amber-600 text-white",
  },
  default: {
    bar: "bg-gray-700",
    ring: "",
    badge: "bg-gray-800 text-gray-300",
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

export default function EventLeaderboard({ eventId, compact = false }) {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetEventPollQuery(eventId, {
      skip: !eventId,
      pollingInterval: 20000, // "live" without a websocket
      refetchOnMountOrArgChange: true,
    });

  if (!eventId) return null;

  if (isLoading) return <LeaderboardSkeleton compact={compact} />;

  if (isError) {
    return (
      <div className="card bg-gray-900 border border-gray-800 p-6 text-center">
        <AlertTriangle size={22} className="text-gold-400 mx-auto mb-2" />
        <p className="text-sm text-gray-300 mb-3">
          Couldn't load live standings right now.
        </p>
        <button
          onClick={refetch}
          className="text-xs font-semibold text-gold-400 hover:text-gold-300"
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
      <div className="card bg-gray-900 border border-gray-800 p-6 text-center text-sm text-gray-400">
        No candidates added to this event yet.
      </div>
    );
  }

  return (
    <div className="card bg-gray-900 border border-gray-800 overflow-hidden">
      {/* header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-800 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="section-label text-gold-400 mb-1">Live standings</p>
          <h3 className="font-body font-bold text-white text-lg leading-snug truncate">
            {data.eventTitle}
          </h3>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span
            className={`w-1.5 h-1.5 bg-emerald-400 rounded-full ${
              isFetching ? "animate-pulse" : ""
            }`}
          />
          <span className="text-[11px] font-semibold text-emerald-400 tracking-wide">
            LIVE
          </span>
        </div>
      </div>

      {/* list */}
      <div className="px-6 py-5 space-y-4">
        {visible.map((c) => {
          const style = RANK_STYLES[c.rank] || RANK_STYLES.default;
          return (
            <div key={c.id}>
              <div className="flex items-center gap-3 mb-1.5">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${style.badge}`}
                >
                  {c.rank}
                </span>

                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center ${style.ring}`}
                >
                  {c.photo ? (
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-gray-400">
                      {initials(c.name)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {c.name}
                  </p>
                  {c.candidateCode && (
                    <p className="text-[10px] text-gray-500">
                      {c.candidateCode}
                    </p>
                  )}
                </div>

                {c.rank === 1 && (
                  <Crown size={14} className="text-gold-400 flex-shrink-0" />
                )}

                <span className="flex-shrink-0 text-xs text-gray-400 tabular-nums">
                  {c.shareOfTotal}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${style.bar} transition-all duration-700 ease-out`}
                  style={{
                    width: `${Math.max(c.shareOfLeader, c.votes > 0 ? 3 : 0)}%`,
                  }}
                />
              </div>

              <div className="mt-1 text-[11px] text-gray-500 tabular-nums">
                {c.votes.toLocaleString()} vote{c.votes === 1 ? "" : "s"}
              </div>
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div className="px-6 py-4 bg-gray-950/60 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Users size={13} />
          {data.totalVotes.toLocaleString()} total votes
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          Updated {timeAgo(data.updatedAt)}
        </div>
      </div>

      {compact && candidates.length > 3 && (
        <Link
          to={`/events/${eventId}/results`}
          className="flex items-center justify-center gap-1 px-6 py-3 text-xs font-semibold text-gold-400 hover:text-gold-300 border-t border-gray-800 transition-colors"
        >
          View full standings <ChevronRight size={13} />
        </Link>
      )}
    </div>
  );
}

function LeaderboardSkeleton({ compact }) {
  const rows = compact ? 3 : 6;
  return (
    <div className="card bg-gray-900 border border-gray-800 overflow-hidden animate-pulse">
      <div className="px-6 pt-5 pb-4 border-b border-gray-800">
        <div className="h-3 w-24 bg-gray-800 rounded mb-2" />
        <div className="h-5 w-40 bg-gray-800 rounded" />
      </div>
      <div className="px-6 py-5 space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-full bg-gray-800" />
              <div className="w-8 h-8 rounded-full bg-gray-800" />
              <div className="h-3 flex-1 bg-gray-800 rounded" />
            </div>
            <div className="h-2 rounded-full bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
