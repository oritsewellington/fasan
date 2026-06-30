import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Plus, Edit2, Trash2, Power, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { selectCurrentUser } from "../../store/slices/authSlice.js";
import {
  useGetEventsQuery,
  useDeleteEventMutation,
  useToggleEventMutation,
} from "../../store/api/eventsApi.js";
import {
  PageLoader,
  EmptyState,
  EventStatusBadge,
  ConfirmDialog,
} from "../../components/ui/index.jsx";
import {
  getEventStatus,
  formatShortDate,
  formatNumber,
} from "../../utils/helpers.js";
import EventFormModal from "../../components/admin/EventFormModal.jsx";

export default function OrganizerEventsPage() {
  const user = useSelector(selectCurrentUser);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: events = [], isLoading } = useGetEventsQuery({ mine: "true" });
  const [deleteEvent, { isLoading: deleting }] = useDeleteEventMutation();
  const [toggleEvent] = useToggleEventMutation();

  const myEvents = events.filter(
    (e) => (e.organizer?._id || e.organizerId) === (user?._id || user?.id),
  );

  const handleDelete = async () => {
    try {
      await deleteEvent(deleteTarget._id).unwrap();
      toast.success("Event deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed.");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleEvent(id).unwrap();
      toast.success("Event status updated.");
    } catch (err) {
      toast.error(err?.data?.message || "Toggle failed.");
    }
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="section-label mb-1">Manage</p>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            My Events
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create events, add candidates, and track votes. Candidate numbers
            are auto-generated for every candidate you add.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : myEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Create your first event — pick a category, set dates and a price per vote, then add candidates."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={15} /> Create your first event
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myEvents.map((ev) => (
            <div key={ev._id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <EventStatusBadge
                  status={getEventStatus(ev.startDate, ev.endDate, ev.isOpen)}
                />
                {ev.category && (
                  <span className="text-2xs text-gray-400">{ev.category}</span>
                )}
              </div>
              <Link to={`/organizer/events/${ev._id}`}>
                <h2 className="font-display font-bold text-gray-900 text-sm leading-snug mb-1 hover:text-gold-600">
                  {ev.title}
                </h2>
              </Link>
              <p className="text-xs text-gray-400 mb-4">
                {formatShortDate(ev.startDate)} – {formatShortDate(ev.endDate)}
              </p>
              <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-3">
                <span className="text-gray-500">
                  {formatNumber(ev.totalVotes || 0)} votes
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(ev._id)}
                    title="Toggle open/closed"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                  >
                    <Power size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingEvent(ev);
                      setShowForm(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ev)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                  <Link
                    to={`/organizer/events/${ev._id}`}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gold-600"
                  >
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        event={editingEvent}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete event?"
        message={`This will permanently delete "${deleteTarget?.title}" and all its candidates. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
