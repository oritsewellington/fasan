import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Crown, ArrowRight, Calendar } from "lucide-react";
import { useGetEventsQuery } from "../../store/api/eventsApi.js";
import { useGetCategoriesQuery } from "../../store/api/categoriesApi.js";
import { getEventStatus, formatShortDate } from "../../utils/helpers.js";
import {
  EventStatusBadge,
  PageLoader,
  EmptyState,
  CountdownTimer,
} from "../../components/ui/index.jsx";

const STATUS_FILTERS = ["all", "open", "upcoming", "closed"];

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const { data: events = [], isLoading } = useGetEventsQuery({});
  const { data: categories = [] } = useGetCategoriesQuery();

  const categoryGroups = [...new Set(categories.map((c) => c.group))].filter(
    Boolean,
  );

  const filtered = events.filter((ev) => {
    const status = getEventStatus(ev.startDate, ev.endDate, ev.isOpen);
    const matchStatus = statusFilter === "all" || status === statusFilter;
    const matchGroup =
      groupFilter === "all" ||
      (() => {
        const cat = categories.find((c) => c._id === ev.categoryId);
        return cat?.group === groupFilter;
      })();
    const matchSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.organization?.toLowerCase().includes(search.toLowerCase()) ||
      ev.category?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchGroup && matchSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-10">
          <p className="section-label mb-2">Cast your vote</p>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">
            All Voting Events
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Choose an event category and vote for your favourite candidate.
          </p>

          <div className="relative max-w-md mb-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search events or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  statusFilter === f
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            {categoryGroups.length > 0 && (
              <>
                <div className="w-px h-8 bg-gray-200 self-center mx-1" />
                <button
                  onClick={() => setGroupFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    groupFilter === "all"
                      ? "bg-gold-500 text-white border-gold-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  All Groups
                </button>
                {categoryGroups.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGroupFilter(g)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      groupFilter === g
                        ? "bg-gold-500 text-white border-gold-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        {isLoading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description={
              search
                ? `No events match "${search}"`
                : "No events available right now. Check back soon."
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }) {
  const status = getEventStatus(event.startDate, event.endDate, event.isOpen);
  const isOpen = status === "open";
  return (
    <Link
      to={`/events/${event._id}`}
      className={`card block overflow-hidden group transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${!isOpen ? "opacity-75" : ""}`}
    >
      {event.bannerImage ? (
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center gap-2">
          <Crown size={40} className="text-gold-400/50" />
          {event.category && (
            <span className="text-xs text-gold-400/60 font-medium px-4 text-center">
              {event.category}
            </span>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <EventStatusBadge status={status} />
          <span className="text-xs text-gray-400">
            ₦{(event.pricePerVote / 100).toLocaleString()}/vote
          </span>
        </div>
        <h2 className="font-display font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-gold-700 transition-colors line-clamp-2">
          {event.title}
        </h2>
        <p className="text-xs text-gray-500 mb-3">{event.organization}</p>
        {isOpen && <CountdownTimer targetDate={event.endDate} />}
        <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-3 mt-3">
          <span className="flex items-center gap-1 text-gray-400">
            <Calendar size={11} />
            {formatShortDate(event.endDate)}
          </span>
          <span className="font-semibold text-gold-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            {isOpen ? "Vote now" : "View results"} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
