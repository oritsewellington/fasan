import { Link } from "react-router-dom";
import { Trophy, ChevronRight, AlertTriangle } from "lucide-react";
import { PageLoader } from "../../components/ui/index.jsx";
import { useGetAllPollsQuery } from "../../store/api/polls.Api.js";

/**
 * PollsIndexPage — /polls
 * -----------------------------------------------------------------------
 * Landing point for "see the results". Lists every event/category with
 * its current leader and total votes, pulled from GET /api/polls.
 * Per-candidate detail lives on each event's own results page
 * (EventLeaderboard) — this is a scan-able overview of all 32.
 */
export default function PollsIndexPage() {
  const {
    data: polls = [],
    isLoading,
    isError,
    refetch,
  } = useGetAllPollsQuery(undefined, { pollingInterval: 30000 });

  return (
    <div className="page-container py-16">
      <div className="text-center mb-12">
        <p className="section-label mb-3">FASAN Awards 2026</p>
        <h1 className="font-body text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Live Results
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">
          Current standings across every award category, updated as votes come
          in.
        </p>
      </div>

      {isLoading && <PageLoader />}

      {isError && (
        <div className="text-center py-16">
          <AlertTriangle size={24} className="text-gold-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">
            Couldn't load results right now.
          </p>
          <button
            onClick={refetch}
            className="text-sm font-semibold text-gold-600 hover:text-gold-700"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && polls.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-12">
          No results yet — voting hasn't started.
        </p>
      )}

      {!isLoading && !isError && polls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {polls.map((poll) => (
            <Link
              key={poll.eventId}
              to={`/events/${poll.eventId}/results`}
              className="card p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs text-gray-400">
                  {poll.category || "Uncategorized"}
                </p>
                <Trophy size={14} className="text-gold-400" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
                {poll.eventTitle}
              </h3>

              {poll.leaderName ? (
                <p className="text-xs text-gray-500 mb-1">
                  Leading:{" "}
                  <span className="font-medium text-gray-800">
                    {poll.leaderName}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-gray-400 mb-1">No votes yet</p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  {poll.totalVotes.toLocaleString()} votes
                </span>
                <span className="text-xs font-semibold text-gold-600 flex items-center gap-1">
                  View standings <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
