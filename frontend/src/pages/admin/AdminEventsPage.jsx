import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, Power, Calendar, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useGetEventsQuery,
  useDeleteEventMutation,
  useToggleEventMutation,
} from "../../store/api/eventsApi.js";
import { useGetOrganizersQuery } from "../../store/api/authApi.js";
import {
  EventStatusBadge,
  PageLoader,
  EmptyState,
  ConfirmDialog,
} from "../../components/ui/index.jsx";
import {
  getEventStatus,
  formatShortDate,
  formatNumber,
} from "../../utils/helpers.js";
import EventFormModal from "../../components/admin/EventFormModal.jsx";

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: events = [], isLoading } = useGetEventsQuery({});
  const { data: organizers = [] } = useGetOrganizersQuery();
  const [deleteEvent, { isLoading: deleting }] = useDeleteEventMutation();
  const [toggleEvent] = useToggleEventMutation();

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()),
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
            All Events
          </h1>
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

      <div className="relative max-w-sm mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events..."
          className="input-field pl-10"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={15} /> Create your first event
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Event</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Organizer</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Votes</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ev) => (
                <tr
                  key={ev._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/admin/events/${ev._id}`}
                      className="font-medium text-gray-900 hover:text-gold-600"
                    >
                      {ev.title}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {formatShortDate(ev.startDate)} –{" "}
                      {formatShortDate(ev.endDate)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {ev.category || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {ev.organizer?.name || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <EventStatusBadge
                      status={getEventStatus(
                        ev.startDate,
                        ev.endDate,
                        ev.isOpen,
                      )}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {formatNumber(ev.totalVotes || 0)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(ev._id)}
                        title="Toggle open/closed"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEvent(ev);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(ev)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EventFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        event={editingEvent}
        organizers={organizers}
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
