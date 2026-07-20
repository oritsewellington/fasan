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

// Same flagship-detection + banner fallback logic as the events list, kept
// in sync so a candidate lands on a detail page that matches the card
// they clicked from.
const MR_MISS_FASA_BANNER = "/mr-miss-fasa.webp";
const DEFAULT_EVENT_BANNER = "/fasa-banner.webp";

function isMrMissFasaEvent(event) {
  const name = (event.category || event.title || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name === "mr fasa" || name === "miss fasa";
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: event, isLoading: evLoading } = useGetEventQuery(eventId);
  const { data: candidates = [], isLoading: cLoading } =
    useGetCandidatesQuery(eventId);

  const [currentPage, setCurrentPage] = useState(1);
  const candidatesTopRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [eventId]);

  if (evLoading || cLoading) return <PageLoader />;

  if (!event)
    return (
      <div className="py-24 px-5 text-center">
        <p className="text-gray-500 mb-4">Event not found.</p>
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

  const isFlagship = isMrMissFasaEvent(event);
  const bannerSrc =
    event.bannerImage ||
    (isFlagship ? MR_MISS_FASA_BANNER : DEFAULT_EVENT_BANNER);

  const totalPages = Math.max(
    1,
    Math.ceil(ranked.length / CANDIDATES_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * CANDIDATES_PER_PAGE;
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
    <div className="bg-gray-50 min-h-screen animate-fade-in">
      {/* ── Hero: banner with overlaid title/badges ─────────────────── */}
      <div className="relative bg-gray-900">
        <div className="relative w-full h-[52vw] max-h-[420px] min-h-[260px] overflow-hidden">
          <img
            src={bannerSrc}
            alt={event.title}
            className={`w-full h-full object-cover ${isFlagship ? "object-top" : "object-center"}`}
          />
          {/* Scrim: strong at the bottom for text legibility, light at top
              so the back button/flagship tag stay readable without hiding
              the art. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        </div>

        <Link
          to="/events"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={14} /> Back to events
        </Link>

        {isFlagship && (
          <span className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold-500/90 backdrop-blur-sm text-black text-xs font-bold shadow-sm">
            <Crown size={12} /> FLAGSHIP EVENT
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0">
          <div className="page-container pb-6 sm:pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <EventStatusBadge status={status} />
              {event.category && (
                <span className="badge-gold">{event.category}</span>
              )}
            </div>
            <h1 className="font-display text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold text-white leading-tight mb-1.5 drop-shadow-sm max-w-2xl">
              {event.title}
            </h1>
            {event.organization && (
              <p className="text-sm text-gray-300">{event.organization}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Ticket-stub info card, overlapping the hero ─────────────── */}
      <div className="page-container relative z-10 -mt-6 sm:-mt-8 mb-2">
        <div className="card p-5 sm:p-6 shadow-card-hover">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <MetaItem
                icon={Calendar}
                label="Starts"
                value={formatEventDate(event.startDate)}
              />
              <MetaItem
                icon={Clock}
                label="Ends"
                value={formatEventDate(event.endDate)}
              />
              {/* <MetaItem
                icon={Users}
                label="Votes cast"
                value={totalVotes > 100 ? "100+" : totalVotes.toLocaleString()}
              /> */}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200 rounded-xl px-4 py-2.5">
                <span className="text-2xs font-semibold text-gold-800 uppercase tracking-wide">
                  Price per vote
                </span>
                <span className="text-xl font-extrabold text-gold-900 leading-tight">
                  ₦{(event.pricePerVote / 100).toLocaleString()}
                </span>
              </div>
              {votingOpen && (
                <div className="hidden sm:block">
                  <CountdownTimer
                    targetDate={event.endDate}
                    label="Closes in"
                  />
                </div>
              )}
            </div>
          </div>

          {votingOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-50">
              <CountdownTimer targetDate={event.endDate} label="Closes in" />
            </div>
          )}

          {event.description && (
            <p className="text-sm text-gray-600 leading-relaxed mt-5 pt-5 border-t border-gray-50">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Voting closed notice ─────────────────────────────────────── */}
      {!votingOpen && (
        <div className="page-container mt-5">
          <div
            className={`rounded-2xl px-5 py-3.5 text-sm font-semibold text-center border ${
              status === "upcoming"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {status === "upcoming"
              ? "⏳ Voting has not started yet. Check back soon!"
              : "🔒 This voting event is now closed."}
          </div>
        </div>
      )}

      {/* ── Candidates ───────────────────────────────────────────────── */}
      <div className="page-container py-10" ref={candidatesTopRef}>
        {ranked.length === 0 ? (
          <EmptyState
            icon={Crown}
            title="No candidates yet"
            description="Candidates will appear here once added by the organizer."
          />
        ) : (
          <>
            <div className="flex items-end justify-between flex-wrap gap-2 mb-1">
              <div>
                <h2 className="font-display text-xl font-extrabold text-gray-900">
                  {ranked.length} Candidate{ranked.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Bars show position relative to the leader
                </p>
              </div>
            </div>

            {totalPages > 1 && (
              <p className="text-xs text-gray-400 mb-4">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {startIdx + 1}–
                  {Math.min(startIdx + CANDIDATES_PER_PAGE, ranked.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-600">
                  {ranked.length}
                </span>
              </p>
            )}

            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${
                totalPages > 1 ? "" : "mt-2.5"
              }`}
            >
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

            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}

            {totalVotes > 0 && (
              <div className="flex items-center gap-2.5 mt-6 px-4 py-3 bg-white rounded-xl border border-gray-100">
                <Trophy size={15} className="text-gold-500 flex-shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed">
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

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-gold-600" />
      </div>
      <div className="leading-tight">
        <p className="text-2xs text-gray-400 font-medium">{label}</p>
        <p className="text-xs font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/** Matches the gold-accented pagination used on the Events list page. */
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
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <nav
      aria-label="Candidates pagination"
      className="flex items-center justify-center gap-1.5 mt-8 flex-wrap"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:border-gold-300 hover:text-gold-600 hover:bg-gold-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-gray-300 text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all ${
              page === currentPage
                ? "bg-gold-500 text-white border-gold-500 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gold-300 hover:text-gold-600 hover:bg-gold-50"
            }`}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-500 hover:border-gold-300 hover:text-gold-600 hover:bg-gold-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
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
  const [imgError, setImgError] = useState(false);

  const relPct =
    leaderVotes > 0
      ? Math.min(100, ((candidate.totalVotes || 0) / leaderVotes) * 100)
      : 0;
  const sharePct = calcPercent(candidate.totalVotes, totalVotes).toFixed(1);
  const isLeader = rank === 1 && (candidate.totalVotes || 0) > 0;

  const initials = (candidate.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  // A candidate has votes only if their count is above zero
  const hasVotes = (candidate.totalVotes || 0) > 0;
  const showPhoto = candidate.photo && !imgError;

  return (
    <Link
      to={isOpen ? `/events/${eventId}/candidates/${candidate._id}` : "#"}
      className={`group block rounded-2xl overflow-hidden bg-white transition-all duration-200 ${
        isOpen
          ? "hover:-translate-y-1 hover:shadow-card-hover cursor-pointer"
          : "pointer-events-none opacity-80"
      } ${
        isLeader
          ? "border-2 border-ember-400 shadow-[0_4px_20px_rgba(217,164,65,0.18)]"
          : "border border-zinc-100 shadow-card"
      }`}
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200">
        {showPhoto ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-[center_18%] transition-transform duration-300 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              {initials || <Crown size={22} />}
            </div>
          </div>
        )}

        {/* ── Fixed Rank / Medal Badge Logic ── */}
        <div className="absolute top-2 left-2">
          {hasVotes && rank <= 3 ? (
            <span className="text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              {MEDALS[rank - 1]}
            </span>
          ) : (
            <span className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm text-2xs font-extrabold text-zinc-700 flex items-center justify-center shadow-sm">
              {rank}
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 max-w-[45%] px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold truncate">
          {candidate.candidateCode ||
            "IX-" + String(candidate.candidateNumber).padStart(4, "0")}
        </div>

        <div className="absolute bottom-0 left-0 right-0 pt-8 pb-2.5 px-2.5 bg-gradient-to-t from-black/85 via-black/35 to-transparent">
          <p className="text-white font-bold text-[13px] leading-snug line-clamp-2 drop-shadow-sm">
            {candidate.name}
          </p>
          {candidate.department && (
            <p className="text-white/65 text-[11px] mt-0.5 truncate">
              {candidate.department}
            </p>
          )}
        </div>
      </div>

      <div className="px-2.5 pt-2.5 pb-3">
        <div className="flex items-center justify-end mb-1.5">
          <span className="text-xs font-bold text-ember-600">{sharePct}%</span>
        </div>

        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isLeader
                ? "bg-gradient-to-r from-ember-400 to-ember-600"
                : "bg-gradient-to-r from-zinc-300 to-zinc-400"
            }`}
            style={{ width: `${relPct}%` }}
          />
        </div>

        {isOpen ? (
          <p className="text-2xs text-ember-600 font-bold text-right flex items-center justify-end gap-1">
            Vote <ArrowRight size={11} />
          </p>
        ) : (
          <p className="text-2xs text-zinc-400 text-center">Voting closed</p>
        )}
      </div>
    </Link>
  );
}
