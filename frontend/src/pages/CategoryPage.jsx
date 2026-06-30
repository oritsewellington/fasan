import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Crown, Clock, Bell, ArrowRight } from "lucide-react";
import { useGetEventsQuery } from "../store/api/eventsApi.js";
import { useGetCandidatesQuery } from "../store/api/candidatesApi.js";
import { useGetCategoriesQuery } from "../store/api/categoriesApi.js";
import {
  getEventStatus,
  isVotingOpen,
  rankCandidates,
  getTotalVotes,
  calcPercent,
} from "../utils/helpers.js";
import {
  PageLoader,
  EmptyState,
  ProgressBar,
  CountdownTimer,
  EventStatusBadge,
} from "../components/ui/index.jsx";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function CategoryPage() {
  const { categoryId } = useParams();
  const { data: categories = [], isLoading: catLoading } =
    useGetCategoriesQuery();
  const { data: events = [], isLoading: evLoading } = useGetEventsQuery({});

  if (catLoading || evLoading) return <PageLoader />;

  const category = categories.find((c) => c._id === categoryId);
  const matchEvent = events.find((e) => e.categoryId === categoryId);

  if (!category) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-gray-500">Category not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
          >
            <ArrowLeft size={16} /> All categories
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
              {category.emoji || "🏆"}
            </div>
            <div>
              <p className="section-label mb-1">{category.group}</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                {category.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        {matchEvent ? (
          <CategoryEvent event={matchEvent} />
        ) : (
          <EmptyState
            icon={Clock}
            title="Voting hasn't opened for this category"
            description="Organizers are still setting up candidates for this award. Check back soon, or browse a category that's already live."
            action={
              <Link to="/events" className="btn-primary">
                <Bell size={15} /> See live categories <ArrowRight size={14} />
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}

function CategoryEvent({ event }) {
  const { data: candidates = [], isLoading } = useGetCandidatesQuery(event._id);
  if (isLoading) return <PageLoader />;

  const status = getEventStatus(event.startDate, event.endDate, event.isOpen);
  const votingOpen = isVotingOpen(event);
  const ranked = rankCandidates(candidates);
  const totalVotes = getTotalVotes(candidates);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <EventStatusBadge status={status} />
          <span className="text-sm text-gray-500">
            {totalVotes.toLocaleString()} votes cast
          </span>
        </div>
        {votingOpen && (
          <CountdownTimer targetDate={event.endDate} label="Closes in" />
        )}
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          icon={Crown}
          title="No candidates yet"
          description="Candidates will appear here once added by the organizer."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {ranked.map((candidate, idx) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              rank={idx + 1}
              totalVotes={totalVotes}
              eventId={event._id}
              isOpen={votingOpen}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CandidateCard({ candidate, rank, totalVotes, eventId, isOpen }) {
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
        <ProgressBar value={candidate.totalVotes} max={totalVotes} />
        {isOpen && (
          <p className="text-xs text-gold-600 font-semibold mt-2.5 text-right flex items-center justify-end gap-1 group-hover:gap-2 transition-all">
            Vote <ArrowRight size={11} />
          </p>
        )}
      </div>
    </Link>
  );
}
