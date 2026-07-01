import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Crown,
  Calendar,
  Clock,
  ArrowLeft,
  Users,
  ArrowRight,
  Trophy,
  ChevronLeft,
  ChevronRight,
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
const CANDIDATES_PER_PAGE = 12;

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: event, isLoading: evLoading } = useGetEventQuery(eventId);
  const { data: candidates = [], isLoading: cLoading } =
    useGetCandidatesQuery(eventId);

  const [currentPage, setCurrentPage] = useState(1);
  const candidatesTopRef = useRef(null);

  // Reset to page 1 whenever we land on a different event.
  useEffect(() => {
    setCurrentPage(1);
  }, [eventId]);

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

  const totalPages = Math.max(
    1,
    Math.ceil(ranked.length / CANDIDATES_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * CANDIDATES_PER_PAGE;
  // Rank stays tied to the full standings, not the page slice, so medals
  // and numbers never reset per page.
  const paginatedCandidates = ranked
    .map((candidate, idx) => ({ candidate, rank: idx + 1 }))
    .slice(startIdx, startIdx + CANDIDATES_PER_PAGE);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    candidatesTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
      <div
        className="page-container"
        style={{ padding: "20px 16px 40px" }}
        ref={candidatesTopRef}
      >
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
                marginBottom: 6,
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

            {/* Pagination summary */}
            {totalPages > 1 && (
              <p
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  margin: "0 0 14px",
                }}
              >
                Showing{" "}
                <span style={{ fontWeight: 600, color: "#6b7280" }}>
                  {startIdx + 1}–
                  {Math.min(startIdx + CANDIDATES_PER_PAGE, ranked.length)}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: 600, color: "#6b7280" }}>
                  {ranked.length}
                </span>
              </p>
            )}

            {/* Grid — 2 cols on phones, 3 on tablets, 4 on desktop */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginTop: totalPages > 1 ? 0 : 10,
              }}
            >
              <style>{`
                @media(min-width: 560px)  { .cand-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                @media(min-width: 900px)  { .cand-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 16px !important; } }
              `}</style>
              <div className="cand-grid" style={{ display: "contents" }}>
                {paginatedCandidates.map(({ candidate, rank }) => (
                  <CandidateCard
                    key={candidate._id}
                    candidate={candidate}
                    rank={rank}
                    totalVotes={totalVotes}
                    leaderVotes={leaderVotes}
                    eventId={eventId}
                    isOpen={votingOpen}
                  />
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}

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

/**
 * Clean numbered pagination, styled to match this page's gold/amber palette.
 * Truncates to ~7 visible buttons max so it holds up with large candidate
 * lists (e.g. a "Most Popular" category with 60+ nominees).
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const btnBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#4b5563",
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <nav
      aria-label="Candidates pagination"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 28,
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        style={{
          ...btnBase,
          opacity: currentPage === 1 ? 0.35 : 1,
          pointerEvents: currentPage === 1 ? "none" : "auto",
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d1d5db",
              fontSize: 13,
              userSelect: "none",
            }}
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            style={
              page === currentPage
                ? {
                    ...btnBase,
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    borderColor: "#f59e0b",
                    color: "#fff",
                    boxShadow: "0 3px 10px rgba(245,158,11,0.35)",
                  }
                : btnBase
            }
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        style={{
          ...btnBase,
          opacity: currentPage === totalPages ? 0.35 : 1,
          pointerEvents: currentPage === totalPages ? "none" : "auto",
        }}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
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
  // Tracks whether the photo URL 404s or fails to decode, so we can fall
  // back to a clean placeholder instead of a broken-image icon.
  const [imgError, setImgError] = useState(false);

  // Bar relative to leader (best UX for race standings)
  const relPct =
    leaderVotes > 0
      ? Math.min(100, ((candidate.totalVotes || 0) / leaderVotes) * 100)
      : 0;
  // Label shows share of total votes (factually accurate number)
  const sharePct = calcPercent(candidate.totalVotes, totalVotes).toFixed(1);
  const isLeader = rank === 1 && (candidate.totalVotes || 0) > 0;

  const initials = (candidate.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const showPhoto = candidate.photo && !imgError;

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
        const img = e.currentTarget.querySelector("[data-photo-zoom]");
        if (img) img.style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = isLeader
          ? "0 4px 20px rgba(245,158,11,0.18)"
          : "0 1px 3px rgba(0,0,0,0.06)";
        const img = e.currentTarget.querySelector("[data-photo-zoom]");
        if (img) img.style.transform = "scale(1)";
      }}
    >
      {/* Photo — fixed portrait aspect-ratio (4:5) instead of a
          viewport-width-based height. A vw-based height shrinks the visible
          area disproportionately as columns increase (e.g. 4-col desktop),
          which crops faces awkwardly. Aspect-ratio keeps every photo framed
          the same way regardless of grid density or screen size. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 5",
          overflow: "hidden",
          background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
        }}
      >
        {showPhoto ? (
          <img
            data-photo-zoom
            src={candidate.photo}
            alt={candidate.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 18%",
              display: "block",
              transition: "transform 0.35s ease-out",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 17,
                boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
              }}
            >
              {initials || <Crown size={22} />}
            </div>
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
              "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.35) 65%, transparent)",
            padding: "30px 10px 10px",
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
              textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            {candidate.name}
          </p>
          {candidate.department && (
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 11,
                margin: "2px 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
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
