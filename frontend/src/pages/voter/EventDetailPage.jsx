import { Link, useParams } from "react-router-dom";
import {
  Crown,
  Calendar,
  Clock,
  ArrowLeft,
  Users,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { useGetEventQuery } from "../../store/api/eventsApi.js";
import { useGetCandidatesQuery } from "../../store/api/candidatesApi.js";
import {
  getEventStatus,
  formatEventDate,
  isVotingOpen,
  rankCandidates,
  getTotalVotes,
  calcPercent,
} from "../../utils/helpers.js";
import {
  EventStatusBadge,
  PageLoader,
  EmptyState,
  CountdownTimer,
} from "../../components/ui/index.jsx";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: event, isLoading: evLoading } = useGetEventQuery(eventId);
  const { data: candidates = [], isLoading: cLoading } =
    useGetCandidatesQuery(eventId);

  if (evLoading || cLoading) return <PageLoader />;

  if (!event)
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>Event not found.</p>
        <Link to="/events" className="btn-primary">
          Back to events
        </Link>
      </div>
    );

  const status = getEventStatus(event.startDate, event.endDate, event.isOpen);
  const votingOpen = isVotingOpen(event);
  const ranked = rankCandidates(candidates);
  const totalVotes = getTotalVotes(candidates);
  const leaderVotes = ranked[0]?.totalVotes || 0;

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* ── Event header ─────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6" }}>
        {/* Banner image — full width, collapses gracefully */}
        {event.bannerImage && (
          <img
            src={event.bannerImage}
            alt={event.title}
            style={{
              width: "100%",
              height: "min(45vw, 280px)",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}

        <div className="page-container" style={{ padding: "20px 16px 24px" }}>
          {/* Back link */}
          <Link
            to="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#6b7280",
              textDecoration: "none",
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={15} /> Back to events
          </Link>

          {/* Badges row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <EventStatusBadge status={status} />
            {event.category && (
              <span className="badge-gold">{event.category}</span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(1.25rem, 5vw, 2rem)",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
          >
            {event.title}
          </h1>

          {event.organization && (
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 12px" }}>
              {event.organization}
            </p>
          )}

          {event.description && (
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.6,
                margin: "0 0 14px",
                maxWidth: 560,
              }}
            >
              {event.description}
            </p>
          )}

          {/* Meta row — wraps on small screens */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 20px",
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 14,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={13} style={{ color: "#f59e0b", flexShrink: 0 }} />
              Starts: {formatEventDate(event.startDate)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={13} style={{ color: "#f59e0b", flexShrink: 0 }} />
              Ends: {formatEventDate(event.endDate)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Users size={13} style={{ color: "#f59e0b", flexShrink: 0 }} />
              {totalVotes.toLocaleString()} votes cast
            </span>
          </div>

          {/* Price + countdown row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
                border: "1px solid #fde68a",
                borderRadius: 12,
                padding: "10px 16px",
                display: "inline-flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#92400e",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Price per vote
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#78350f",
                  lineHeight: 1.2,
                }}
              >
                ₦{(event.pricePerVote / 100).toLocaleString()}
              </span>
            </div>
            {votingOpen && (
              <div style={{ flexShrink: 0 }}>
                <CountdownTimer targetDate={event.endDate} label="Closes in" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Voting closed banner ──────────────────────────────────────── */}
      {!votingOpen && (
        <div className="page-container" style={{ padding: "16px 16px 0" }}>
          <div
            style={{
              borderRadius: 14,
              padding: "14px 18px",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "center",
              background: status === "upcoming" ? "#eff6ff" : "#fef2f2",
              color: status === "upcoming" ? "#1d4ed8" : "#b91c1c",
              border: `1px solid ${status === "upcoming" ? "#bfdbfe" : "#fecaca"}`,
            }}
          >
            {status === "upcoming"
              ? "⏳ Voting has not started yet. Check back soon!"
              : "🔒 This voting event is now closed."}
          </div>
        </div>
      )}

      {/* ── Candidates ───────────────────────────────────────────────── */}
      <div className="page-container" style={{ padding: "20px 16px 40px" }}>
        {ranked.length === 0 ? (
          <EmptyState
            icon={Crown}
            title="No candidates yet"
            description="Candidates will appear here once added by the organizer."
          />
        ) : (
          <>
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {ranked.length} Candidate{ranked.length !== 1 ? "s" : ""}
                </h2>
                <p
                  style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}
                >
                  Bars show position relative to the leader
                </p>
              </div>
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                {totalVotes.toLocaleString()} total votes
              </span>
            </div>

            {/* Grid — 2 cols on phones, 3 on tablets, 4 on desktop */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              <style>{`
                @media(min-width: 560px)  { .cand-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                @media(min-width: 900px)  { .cand-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 16px !important; } }
              `}</style>
              <div className="cand-grid" style={{ display: "contents" }}>
                {ranked.map((candidate, idx) => (
                  <CandidateCard
                    key={candidate._id}
                    candidate={candidate}
                    rank={idx + 1}
                    totalVotes={totalVotes}
                    leaderVotes={leaderVotes}
                    eventId={eventId}
                    isOpen={votingOpen}
                  />
                ))}
              </div>
            </div>

            {/* Legend */}
            {totalVotes > 0 && (
              <div
                style={{
                  marginTop: 24,
                  padding: "12px 16px",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Trophy size={15} style={{ color: "#f59e0b", flexShrink: 0 }} />
                <p
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Progress bars show each candidate's votes relative to the
                  current leader. The leader always shows a full bar.
                  Percentages show share of total votes.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  rank,
  totalVotes,
  leaderVotes,
  eventId,
  isOpen,
}) {
  // Bar relative to leader (best UX for race standings)
  const relPct =
    leaderVotes > 0
      ? Math.min(100, ((candidate.totalVotes || 0) / leaderVotes) * 100)
      : 0;
  // Label shows share of total votes (factually accurate number)
  const sharePct = calcPercent(candidate.totalVotes, totalVotes).toFixed(1);
  const isLeader = rank === 1 && (candidate.totalVotes || 0) > 0;

  return (
    <Link
      to={isOpen ? `/events/${eventId}/candidates/${candidate._id}` : "#"}
      style={{
        display: "block",
        textDecoration: "none",
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
        border: isLeader ? "2px solid #f59e0b" : "1px solid #f3f4f6",
        boxShadow: isLeader
          ? "0 4px 20px rgba(245,158,11,0.18)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "transform 0.15s, box-shadow 0.15s",
        pointerEvents: isOpen ? "auto" : "none",
        opacity: isOpen ? 1 : 0.82,
      }}
      onMouseEnter={(e) => {
        if (!isOpen) return;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = isLeader
          ? "0 4px 20px rgba(245,158,11,0.18)"
          : "0 1px 3px rgba(0,0,0,0.06)";
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative" }}>
        {candidate.photo ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
            style={{
              width: "100%",
              height: "min(52vw, 220px)",
              objectFit: "cover",
              objectPosition: "top",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "min(52vw, 220px)",
              background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Crown size={32} style={{ color: "#d1d5db" }} />
          </div>
        )}

        {/* Rank badge */}
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          {rank <= 3 ? (
            <span
              style={{
                fontSize: 20,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
              }}
            >
              {MEDALS[rank - 1]}
            </span>
          ) : (
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(4px)",
                fontSize: 10,
                fontWeight: 800,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            >
              {rank}
            </span>
          )}
        </div>

        {/* Candidate code */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 7px",
            borderRadius: 999,
            maxWidth: "45%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {candidate.candidateCode ||
            "FASA-" + String(candidate.candidateNumber).padStart(4, "0")}
        </div>

        {/* Name overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82), transparent)",
            padding: "28px 10px 10px",
          }}
        >
          <p
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              margin: 0,
              lineHeight: 1.3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {candidate.name}
          </p>
          {candidate.department && (
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                margin: "2px 0 0",
              }}
            >
              {candidate.department}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "10px 11px 12px" }}>
        {/* Vote count + share % */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 7,
          }}
        >
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
            {(candidate.totalVotes || 0).toLocaleString()} votes
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>
            {sharePct}%
          </span>
        </div>

        {/* Relative progress bar */}
        <div
          style={{
            height: 6,
            background: "#f3f4f6",
            borderRadius: 999,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              width: `${relPct}%`,
              background: isLeader
                ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                : "linear-gradient(90deg, #d1d5db, #9ca3af)",
              transition: "width 0.7s ease-out",
            }}
          />
        </div>

        {/* CTA */}
        {isOpen ? (
          <p
            style={{
              fontSize: 11,
              color: "#d97706",
              fontWeight: 700,
              margin: 0,
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 3,
            }}
          >
            Vote <ArrowRight size={11} />
          </p>
        ) : (
          <p
            style={{
              fontSize: 11,
              color: "#9ca3af",
              margin: 0,
              textAlign: "center",
            }}
          >
            Voting closed
          </p>
        )}
      </div>
    </Link>
  );
}
