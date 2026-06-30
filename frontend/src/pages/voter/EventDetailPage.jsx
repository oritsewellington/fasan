import { Link, useParams } from "react-router-dom";
import {
  Crown,
  Calendar,
  Clock,
  ArrowLeft,
  Users,
  ArrowRight,
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
  ProgressBar,
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
      <div className="page-container py-20 text-center">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/events" className="btn-primary mt-4">
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
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
          >
            <ArrowLeft size={16} /> Back to events
          </Link>
          <div className="flex flex-col lg:flex-row gap-6">
            {event.bannerImage && (
              <img
                src={event.bannerImage}
                alt={event.title}
                className="w-full lg:w-64 h-40 object-cover rounded-2xl flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <EventStatusBadge status={status} />
                {event.category && (
                  <span className="badge-gold">{event.category}</span>
                )}
                <span className="text-xs text-gray-400">
                  {event.organization}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-sm text-gray-500 mb-3 max-w-xl">
                  {event.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gold-500" /> Starts:{" "}
                  {formatEventDate(event.startDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gold-500" /> Ends:{" "}
                  {formatEventDate(event.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-gold-500" />{" "}
                  {totalVotes.toLocaleString()} votes cast
                </span>
              </div>
              {votingOpen && (
                <div className="mt-3">
                  <CountdownTimer
                    targetDate={event.endDate}
                    label="Closes in"
                  />
                </div>
              )}
            </div>
            <div className="lg:text-right">
              <p className="text-xs text-gray-400 mb-1">Price per vote</p>
              <p className="text-2xl font-bold text-gray-900 font-display">
                ₦{(event.pricePerVote / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        {!votingOpen && (
          <div
            className={`rounded-2xl p-4 mb-6 text-sm font-medium text-center ${
              status === "upcoming"
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {status === "upcoming"
              ? "Voting has not started yet. Check back soon!"
              : "This voting event is now closed."}
          </div>
        )}

        {ranked.length === 0 ? (
          <EmptyState
            icon={Crown}
            title="No candidates yet"
            description="Candidates will appear here once added by the organizer."
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {ranked.length} Candidate{ranked.length !== 1 ? "s" : ""}
              </h2>
              <p className="text-sm text-gray-500">
                {totalVotes.toLocaleString()} total votes
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
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
  return (
    <Link
      to={isOpen ? `/events/${eventId}/candidates/${candidate._id}` : "#"}
      className={`card-hover block overflow-hidden group ${!isOpen ? "pointer-events-none opacity-80" : ""}`}
    >
      <div className="relative">
        {candidate.photo ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
            className="w-full h-52 sm:h-56 object-cover object-top"
          />
        ) : (
          <div className="w-full h-52 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Crown size={36} className="text-gray-400" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          {rank <= 3 ? (
            <span className="text-2xl drop-shadow">{MEDALS[rank - 1]}</span>
          ) : (
            <span className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-700 flex items-center justify-center shadow-sm">
              #{rank}
            </span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {candidate.candidateCode ||
            "FASA-" + String(candidate.candidateNumber).padStart(4, "0")}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white font-semibold text-sm leading-snug">
            {candidate.name}
          </p>
          {candidate.department && (
            <p className="text-white/60 text-xs mt-0.5">
              {candidate.department}
            </p>
          )}
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-500">
            {(candidate.totalVotes || 0).toLocaleString()} votes
          </span>
          <span className="font-semibold text-gold-600">
            {calcPercent(candidate.totalVotes, totalVotes).toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={candidate.totalVotes} max={leaderVotes} />
        {isOpen && (
          <p className="text-xs text-gold-600 font-semibold mt-2.5 text-right flex items-center justify-end gap-1 group-hover:gap-2 transition-all">
            Vote <ArrowRight size={11} />
          </p>
        )}
      </div>
    </Link>
  );
}
