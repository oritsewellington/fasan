import { useGetRecentTransactionsQuery } from "../../store/api/statsApi.js";
import { PageLoader, EmptyState } from "../../components/ui/index.jsx";
import { formatNaira, formatEventDate } from "../../utils/helpers.js";
import { Receipt } from "lucide-react";

export default function AdminTransactionsPage() {
  const { data: transactions = [], isLoading } = useGetRecentTransactionsQuery({
    limit: 100,
  });

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="mb-8">
        <p className="section-label mb-1">Finance</p>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Recent Transactions
        </h1>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : transactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" />
      ) : (
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
              {transactions.map((t) => (
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
      )}
    </div>
  );
}
