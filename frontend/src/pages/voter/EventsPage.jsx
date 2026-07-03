import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Crown,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";
import { useGetEventsQuery } from "../../store/api/eventsApi.js";
import { useGetCategoriesQuery } from "../../store/api/categoriesApi.js";
import {
  getEventStatus,
  formatShortDate,
  formatNumber,
} from "../../utils/helpers.js";
import {
  EventStatusBadge,
  PageLoader,
  EmptyState,
  CountdownTimer,
} from "../../components/ui/index.jsx";

const STATUS_FILTERS = ["all", "open", "upcoming", "closed"];
const EVENTS_PER_PAGE = 9;

const MR_MISS_FASA_BANNER = "/mr-miss-fasa.jpeg";
const DEFAULT_EVENT_BANNER = "/fasa-banner.jpeg";

function isMrMissFasaEvent(event) {
  const name = (event.category || event.title || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name === "mr fasa" || name === "miss fasa";
}

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

  const stats = useMemo(() => {
    const open = events.filter(
      (e) => getEventStatus(e.startDate, e.endDate, e.isOpen) === "open",
    ).length;
    const totalVotes = events.reduce((s, e) => s + (e.totalVotes || 0), 0);
    return { open, totalVotes, total: events.length };
  }, [events]);

  const hasActiveFilters =
    search || statusFilter !== "all" || groupFilter !== "all";

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-10">
          <p className="section-label mb-2">Cast your vote</p>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">
            All Voting Events
          </h1>
          <p className="text-gray-500 text-sm mb-5">
            Choose an event category and vote for your favourite candidate.
          </p>

          {!isLoading && (
            <div className="flex flex-wrap gap-6 mb-7 pb-6 border-b border-gray-50">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  {stats.total}
                </span>
                <span className="text-xs text-gray-400 ml-1.5">
                  total events
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xl font-bold text-gray-900">
                  {stats.open}
                </span>
                <span className="text-xs text-gray-400 ml-1">live now</span>
              </div>
              {/* <div>
                <span className="text-xl font-bold text-gray-900">
                  {formatNumber(stats.totalVotes)}
                </span>
                <span className="text-xs text-gray-400 ml-1.5">votes cast</span>
              </div> */}
            </div>
          )}

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
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === f
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {categoryGroups.length > 0 && (
              <>
                <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                <div className="relative">
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="appearance-none pl-8 pr-8 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                  >
                    <option value="all">All Groups</option>
                    {categoryGroups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <Filter
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </>
            )}

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setGroupFilter("all");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 ml-1"
              >
                Clear filters
              </button>
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
                event
                {filtered.length !== 1 ? "s" : ""}
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
  const isFlagship = isMrMissFasaEvent(event);

  // Priority: real admin-uploaded banner > flagship poster (Mr/Miss FASA)
  // > general FASA awards banner. Every card now has an image — no more
  // dark placeholder fallback.
  const bannerSrc =
    event.bannerImage ||
    (isFlagship ? MR_MISS_FASA_BANNER : DEFAULT_EVENT_BANNER);

  return (
    <Link
      to={`/events/${event._id}`}
      className={`card block overflow-hidden group transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${
        !isOpen ? "opacity-75" : ""
      } ${isFlagship ? "ring-1 ring-gold-400/40" : ""}`}
    >
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={bannerSrc}
          alt={event.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isFlagship ? "object-top" : "object-center"
          }`}
        />
        {isOpen && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-2xs font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}
            LIVE
          </span>
        )}
        {isFlagship && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500/90 backdrop-blur-sm text-black text-2xs font-bold">
            <Crown size={11} /> FLAGSHIP
          </span>
        )}
        {/* subtle bottom gradient so the category label stays readable
            over the busy banner art instead of floating on raw pixels */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
        {event.category && (
          <span className="absolute bottom-2.5 left-3 text-xs text-white/90 font-medium drop-shadow-sm">
            {event.category}
          </span>
        )}
      </div>

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
            <Calendar size={11} /> {formatShortDate(event.endDate)}
          </span>
          <span className="font-semibold text-gold-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            {isOpen ? "Vote now" : "View results"} <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
