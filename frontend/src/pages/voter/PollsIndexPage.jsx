import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  ChevronRight,
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
} from "lucide-react";
import { PageLoader } from "../../components/ui/index.jsx";
import { useGetAllPollsQuery } from "../../store/api/polls.Api.js";

const PAGE_SIZE = 9;

export default function PollsIndexPage() {
  const {
    data: polls = [],
    isLoading,
    isError,
    refetch,
  } = useGetAllPollsQuery(undefined);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return polls;
    return polls.filter(
      (poll) =>
        poll.eventTitle?.toLowerCase().includes(q) ||
        poll.category?.toLowerCase().includes(q) ||
        poll.leaderName?.toLowerCase().includes(q),
    );
  }, [polls, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

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

      {!isLoading && !isError && polls.length > 0 && (
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search category, event, or leader..."
              className="input-field pl-10 pr-9"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

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

      {!isLoading && !isError && polls.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400 mb-1">
            No results match "{search}"
          </p>
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="text-sm font-semibold text-gold-600 hover:text-gold-700"
          >
            Clear search
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((poll) => (
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
                  {/* <span className="text-xs text-gray-400">
                    {poll.totalVotes.toLocaleString()} votes
                  </span> */}
                  <span className="text-xs font-semibold text-gold-600 flex items-center gap-1">
                    View standings <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    n === currentPage
                      ? "bg-gold-500 text-white"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
