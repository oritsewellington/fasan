import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Calendar,
  Search,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetEventsQuery,
  useDeleteEventMutation,
  useToggleEventMutation,
} from "../../store/api/eventsApi.js";
import {
  EventStatusBadge,
  PageLoader,
  EmptyState,
  ConfirmDialog,
} from "../ui/index.jsx";
import {
  getEventStatus,
  formatShortDate,
  formatNumber,
} from "../../utils/helpers.js";
import EventFormModal from "../admin/EventFormModal.jsx";

export default function EventsListPage({ basePath }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: events = [], isLoading } = useGetEventsQuery({});
  const [deleteEvent, { isLoading: deleting }] = useDeleteEventMutation();
  const [toggleEvent] = useToggleEventMutation();

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase()),
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

  const openCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };
  const openEdit = (ev) => {
    setEditingEvent(ev);
    setShowForm(true);
  };

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>
            Manage
          </p>
          <h1
            style={{
              fontSize: "clamp(1.3rem, 4vw, 1.6rem)",
              fontWeight: 800,
              color: "#111827",
              margin: 0,
            }}
          >
            All Events
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
          style={{ flexShrink: 0 }}
        >
          <Plus size={15} /> Create Event
        </button>
      </div>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <div style={{ position: "relative", maxWidth: 380, marginBottom: 20 }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: 13,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events or categories…"
          style={{
            width: "100%",
            padding: "11px 14px 11px 38px",
            fontSize: 16 /* prevents iOS zoom */,
            border: "1.5px solid #e5e7eb",
            borderRadius: 12,
            outline: "none",
            background: "#fff",
            color: "#111827",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          action={
            <button onClick={openCreate} className="btn-primary">
              <Plus size={15} /> Create your first event
            </button>
          }
        />
      ) : (
        <>
          {/* ── Desktop table (hidden on small screens) ───────────── */}
          <div style={{ display: "none" }} className="desktop-table-wrap">
            <style>{`
              @media(min-width: 700px) {
                .desktop-table-wrap { display: block !important; }
                .mobile-card-list    { display: none !important; }
              }
            `}</style>
            <div className="card" style={{ overflow: "hidden" }}>
              <table
                style={{
                  width: "100%",
                  fontSize: 13,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {[
                      "Event",
                      "Category",
                      "Status",
                      "Votes",
                      "Ends",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: h === "Actions" ? "right" : "left",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ev) => {
                    const status = getEventStatus(
                      ev.startDate,
                      ev.endDate,
                      ev.isOpen,
                    );
                    return (
                      <tr
                        key={ev._id}
                        style={{
                          borderBottom: "1px solid #f9fafb",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fafafa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "")
                        }
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <Link
                            to={`${basePath}/events/${ev._id}`}
                            style={{
                              fontWeight: 600,
                              color: "#111827",
                              textDecoration: "none",
                              fontSize: 13,
                              display: "block",
                              transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#d97706")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "#111827")
                            }
                          >
                            {ev.title}
                          </Link>
                          {ev.createdBy?.name && (
                            <p
                              style={{
                                fontSize: 11,
                                color: "#9ca3af",
                                margin: "2px 0 0",
                              }}
                            >
                              by {ev.createdBy.name}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 12, color: "#6b7280" }}>
                            {ev.category || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <EventStatusBadge status={status} />
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          {formatNumber(ev.totalVotes || 0)}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 12,
                            color: "#9ca3af",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatShortDate(ev.endDate)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 4,
                            }}
                          >
                            <ActionBtn
                              onClick={() => handleToggle(ev._id)}
                              title="Toggle open/closed"
                              icon={<Power size={14} />}
                            />
                            <ActionBtn
                              onClick={() => openEdit(ev)}
                              title="Edit"
                              icon={<Edit2 size={14} />}
                            />
                            <ActionBtn
                              onClick={() => setDeleteTarget(ev)}
                              title="Delete"
                              icon={<Trash2 size={14} />}
                              danger
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile card list (shown on small screens) ─────────── */}
          <div
            className="mobile-card-list"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {filtered.map((ev) => {
              const status = getEventStatus(
                ev.startDate,
                ev.endDate,
                ev.isOpen,
              );
              return (
                <div
                  key={ev._id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                  }}
                >
                  {/* Top row: title + status */}
                  <div style={{ padding: "13px 14px 0" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <Link
                        to={`${basePath}/events/${ev._id}`}
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#111827",
                          textDecoration: "none",
                          lineHeight: 1.3,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {ev.title}
                      </Link>
                      <EventStatusBadge status={status} />
                    </div>

                    {ev.category && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#d97706",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          margin: "0 0 4px",
                        }}
                      >
                        {ev.category}
                      </p>
                    )}

                    {/* Meta row */}
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <span>{formatNumber(ev.totalVotes || 0)} votes</span>
                      <span>Ends {formatShortDate(ev.endDate)}</span>
                      {ev.createdBy?.name && (
                        <span>by {ev.createdBy.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Action row */}
                  <div
                    style={{ display: "flex", borderTop: "1px solid #f9fafb" }}
                  >
                    <MobileActionBtn
                      onClick={() => handleToggle(ev._id)}
                      label="Toggle"
                      icon={<Power size={13} />}
                    />
                    <MobileActionBtn
                      onClick={() => openEdit(ev)}
                      label="Edit"
                      icon={<Edit2 size={13} />}
                    />
                    <MobileActionBtn
                      onClick={() => setDeleteTarget(ev)}
                      label="Delete"
                      icon={<Trash2 size={13} />}
                      danger
                    />
                    <Link
                      to={`${basePath}/events/${ev._id}`}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        padding: "11px 0",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#d97706",
                        textDecoration: "none",
                        borderLeft: "1px solid #f9fafb",
                      }}
                    >
                      Open <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Count footer */}
          <p
            style={{
              fontSize: 12,
              color: "#9ca3af",
              margin: "16px 0 0",
              textAlign: "center",
            }}
          >
            Showing {filtered.length} of {events.length} event
            {events.length !== 1 ? "s" : ""}
          </p>
        </>
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

// ── Small helper components ───────────────────────────────────────────────────

function ActionBtn({ onClick, icon, title, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: 7,
        borderRadius: 8,
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "#fef2f2" : "#f3f4f6";
        e.currentTarget.style.color = danger ? "#ef4444" : "#374151";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.color = "#9ca3af";
      }}
    >
      {icon}
    </button>
  );
}

function MobileActionBtn({ onClick, icon, label, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        padding: "10px 4px",
        background: "none",
        border: "none",
        borderLeft: "1px solid #f9fafb",
        cursor: "pointer",
        fontSize: 10,
        fontWeight: 600,
        color: danger ? "#ef4444" : "#6b7280",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = danger ? "#fef2f2" : "#f9fafb")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {icon}
      {label}
    </button>
  );
}
