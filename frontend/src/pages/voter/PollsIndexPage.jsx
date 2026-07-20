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
        <p className="section-label text-ember-600 mb-3">
          Class of INTREPIDUS Awards 2026
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
          Live Results
        </h1>
        <p className="text-zinc-500 max-w-lg mx-auto text-sm">
          Current standings across every award category, updated as votes come
          in.
        </p>
      </div>

      {!isLoading && !isError && polls.length > 0 && (
        <div className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-300"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500"
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
          <AlertTriangle size={24} className="text-ember-500 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-3">
            Couldn't load results right now.
          </p>
          <button
            onClick={refetch}
            className="text-sm font-semibold text-ember-600 hover:text-ember-700"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && polls.length === 0 && (
        <p className="text-center text-sm text-zinc-400 py-12">
          No results yet — voting hasn't started.
        </p>
      )}

      {!isLoading && !isError && polls.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-zinc-400 mb-1">
            No results match "{search}"
          </p>
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="text-sm font-semibold text-ember-600 hover:text-ember-700"
          >
            Clear search
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((poll) => {
              // Guard against the API returning a leaderName even when no
              // votes have been cast yet — only trust it once totalVotes > 0.
              const hasVotes = (poll.totalVotes || 0) > 0;
              const percent =
                hasVotes && poll.leaderVotes != null
                  ? (poll.leaderVotes / poll.totalVotes) * 100
                  : null;

              return (
                <Link
                  key={poll.eventId}
                  to={`/events/${poll.eventId}/results`}
                  className="card-hover group p-5"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-xs text-zinc-400">
                      {poll.category || "Uncategorized"}
                    </p>
                    <span className="flex items-center gap-1 text-2xs font-bold text-ember-600 bg-ember-50 border border-ember-100 rounded-full px-2 py-0.5">
                      <Trophy size={10} />
                    </span>
                  </div>

                  <h3 className="font-semibold text-zinc-900 text-sm leading-snug mb-2">
                    {poll.eventTitle}
                  </h3>

                  {hasVotes ? (
                    <p className="text-xs text-zinc-500 mb-3">
                      Leading:{" "}
                      <span className="font-medium text-zinc-800">
                        {poll.leaderName}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400 mb-3">No votes yet</p>
                  )}

                  {percent != null && (
                    <>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-ember-400 to-ember-600 rounded-full transition-all"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs font-bold text-ember-600">
                        {percent.toFixed(1)}% of votes
                      </p>
                    </>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                    <span className="text-xs font-semibold text-ember-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      View standings <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Results pagination"
              className="flex items-center justify-center gap-1.5 mt-12"
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={`w-9 h-9 rounded-full text-sm font-medium border transition-all ${
                    n === currentPage
                      ? "bg-ember-500 text-white border-ember-500 shadow-sm"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-500 hover:border-ember-300 hover:text-ember-600 hover:bg-ember-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
