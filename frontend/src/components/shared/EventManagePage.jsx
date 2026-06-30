import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Hash,
  DollarSign,
  Users,
  Vote,
} from "lucide-react";
import { toast } from "sonner";
import { useGetEventStatsQuery } from "../../store/api/statsApi.js";
import {
  useGetCandidatesQuery,
  useDeleteCandidateMutation,
} from "../../store/api/candidatesApi.js";
import {
  StatCard,
  PageLoader,
  EmptyState,
  EventStatusBadge,
  ProgressBar,
  ConfirmDialog,
} from "../ui/index.jsx";
import {
  formatNaira,
  formatNumber,
  getEventStatus,
  calcPercent,
  getTotalVotes,
  rankCandidates,
} from "../../utils/helpers.js";
import CandidateFormModal from "./CandidateFormModal.jsx";

export default function EventManagePage({ basePath = "/organizer" }) {
  const { eventId } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useGetEventStatsQuery(eventId);
  const { data: candidates = [] } = useGetCandidatesQuery(eventId);
  const [deleteCandidate, { isLoading: deleting }] =
    useDeleteCandidateMutation();

  if (isLoading) return <PageLoader />;
  if (!data)
    return (
      <div className="page-container py-20 text-center text-gray-400">
        Event not found.
      </div>
    );

  const { event } = data;
  const ranked = rankCandidates(candidates);
  const totalVotes = getTotalVotes(candidates);
  const leaderVotes = ranked[0]?.totalVotes || 0;
  const nextNumber =
    candidates.length > 0
      ? Math.max(...candidates.map((c) => c.candidateNumber)) + 1
      : 1;

  const handleDelete = async () => {
    try {
      await deleteCandidate({
        eventId,
        candidateId: deleteTarget._id,
      }).unwrap();
      toast.success("Candidate removed.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <Link
        to={`${basePath}/events`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={15} /> Back to events
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <EventStatusBadge
              status={getEventStatus(
                event.startDate,
                event.endDate,
                event.isOpen,
              )}
            />
            {event.category && (
              <span className="badge-gold">{event.category}</span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {event.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{event.organization}</p>
        </div>
        <button
          onClick={() => {
            setEditingCandidate(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> Add Candidate
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Votes"
          value={formatNumber(data.totalVotes || 0)}
          icon={Vote}
        />
        <StatCard
          label="Total Revenue"
          value={formatNaira(data.totalRevenue || 0)}
          icon={DollarSign}
          colorClass="text-emerald-600"
        />
        <StatCard
          label="Your Earnings"
          value={formatNaira(data.organizerCut || 0)}
          icon={DollarSign}
          colorClass="text-gold-600"
        />
        <StatCard label="Candidates" value={candidates.length} icon={Users} />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-900">Candidates</h2>
          <p className="text-xs text-gray-400">
            Numbers auto-assigned: next is FASA-
            {String(nextNumber).padStart(4, "0")}
          </p>
        </div>

        {ranked.length === 0 ? (
          <EmptyState
            icon={Hash}
            title="No candidates yet"
            description="Add your first candidate â€” a unique number will be generated automatically."
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus size={15} /> Add candidate
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {ranked.map((c, idx) => (
              <div
                key={c._id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-400 w-6">
                  #{idx + 1}
                </span>
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover object-top flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {c.name}
                    </p>
                    <span className="text-2xs px-1.5 py-0.5 bg-gold-50 text-gold-700 rounded font-bold flex-shrink-0">
                      {c.candidateCode ||
                        "FASA-" + String(c.candidateNumber).padStart(4, "0")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {c.department}
                    {c.level ? ` Â· ${c.level}` : ""}
                  </p>
                  <div className="mt-1.5 max-w-xs">
                    <ProgressBar
                      value={c.totalVotes}
                      max={leaderVotes}
                      height="h-1.5"
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    {formatNumber(c.totalVotes || 0)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {calcPercent(c.totalVotes, totalVotes).toFixed(1)}%
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingCandidate(c);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CandidateFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        eventId={eventId}
        candidate={editingCandidate}
        nextCandidateNumber={nextNumber}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove candidate?"
        message={`Remove "${deleteTarget?.name}" from this event? This cannot be undone.`}
        confirmLabel="Remove"
        danger
        loading={deleting}
      />
    </div>
  );
}
