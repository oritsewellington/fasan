import { useState, useMemo } from "react";
import { useGetRecentTransactionsQuery } from "../../store/api/statsApi.js";
import { PageLoader, EmptyState } from "../../components/ui/index.jsx";
import { formatNaira, formatEventDate } from "../../utils/helpers.js";
import { Receipt, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

export default function AdminTransactionsPage() {
  const { data: transactions = [], isLoading } = useGetRecentTransactionsQuery({
    limit: 100,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        t.voterName?.toLowerCase().includes(q) ||
        t.voterEmail?.toLowerCase().includes(q) ||
        t.candidateName?.toLowerCase().includes(q) ||
        t.eventTitle?.toLowerCase().includes(q),
    );
  }, [transactions, search]);

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

  const totalAmount = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalVotes = filtered.reduce((sum, t) => sum + (t.votes || 0), 0);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-1">Finance</p>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Recent Transactions
          </h1>
        </div>

        {!isLoading && transactions.length > 0 && (
          <div className="relative sm:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search voter, candidate, event..."
              className="input-field pl-9 pr-9 text-sm"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : transactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-gray-400 mb-1">
            No transactions match "{search}"
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
      ) : (
        <>
          {search && (
            <div className="flex flex-wrap gap-4 mb-4 px-1 text-xs text-gray-500">
              <span>
                <strong className="text-gray-900">{filtered.length}</strong>{" "}
                match{filtered.length !== 1 ? "es" : ""}
              </span>
              <span>
                <strong className="text-gray-900">{totalVotes}</strong> votes
              </span>
              <span>
                <strong className="text-gray-900">
                  {formatNaira(totalAmount)}
                </strong>{" "}
                total
              </span>
            </div>
          )}

          <div className="card overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Voter</th>
                  <th className="text-left px-5 py-3 font-medium">Candidate</th>
                  <th className="text-left px-5 py-3 font-medium">Event</th>
                  <th className="text-left px-5 py-3 font-medium">Votes</th>
                  <th className="text-left px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{t.voterName}</p>
                      <p className="text-xs text-gray-400">{t.voterEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {t.candidateName}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {t.eventTitle}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{t.votes}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {formatNaira(t.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {formatEventDate(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 px-1">
              <p className="text-xs text-gray-400">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 ||
                      n === totalPages ||
                      Math.abs(n - currentPage) <= 1,
                  )
                  .reduce((acc, n, i, arr) => {
                    if (i > 0 && n - arr[i - 1] > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-gray-300"
                      >
                        …
                      </span>
                    ) : (
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
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
