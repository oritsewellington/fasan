import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Crown,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
const EVENTS_PER_PAGE = 9;

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);

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

  // Any change to search/status/group should land the user back on page 1 —
  // otherwise they can filter down to 2 pages while sitting on page 6 and
  // see an empty grid with no obvious explanation.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, groupFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / EVENTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * EVENTS_PER_PAGE;
  const paginatedEvents = filtered.slice(startIdx, startIdx + EVENTS_PER_PAGE);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

      <div className="page-container py-10" ref={listTopRef}>
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
          <>
            <div className="flex items-center justify-between mb-5 px-1">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-600">
                  {startIdx + 1}–
                  {Math.min(startIdx + EVENTS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-600">
                  {filtered.length}
                </span>{" "}
                event{filtered.length !== 1 ? "s" : ""}
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-gray-400">
                  Page {safePage} of {totalPages}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedEvents.map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Clean numbered pagination with smart truncation, gold accent to match
 * the FASAN brand. Caps visible page buttons at ~7 regardless of total
 * pages, so it holds up even with hundreds of events.
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

  return (
    <nav
      aria-label="Events pagination"
      className="flex items-center justify-center gap-1.5 mt-12"
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
          <span className="text-xs text-gray-600 font-bold">
            ₦{(event.pricePerVote / 100).toLocaleString()}/vote
          </span>
        </div>
        <h2 className="font-display font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-gold-700 transition-colors line-clamp-2">
          {event.title}
        </h2>
        <p className="text-xs text-gray-500 mb-3">{event.organization}</p>
        {isOpen && <CountdownTimer targetDate={event.endDate} />}
        <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-3 mt-3">
          <span className="flex items-center gap-1 text-gray-600 font-medium">
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
