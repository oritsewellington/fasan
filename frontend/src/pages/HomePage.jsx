import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  Trophy,
  Users,
  Shield,
  ArrowRight,
  Star,
  Zap,
  ChevronRight,
  Award,
  Music,
  Shirt,
  BookOpen,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useGetEventsQuery } from "../store/api/eventsApi.js";
import { useGetCategoriesQuery } from "../store/api/categoriesApi.js";
import { getEventStatus, formatNumber } from "../utils/helpers.js";
import {
  EventStatusBadge,
  CountdownTimer,
  PageLoader,
} from "../components/ui/index.jsx";

const GROUP_ICONS = {
  Social: Users,
  Academic: BookOpen,
  Popularity: Star,
  Sports: Trophy,
  Leadership: Crown,
  Creative: Music,
  Fashion: Shirt,
  Business: Briefcase,
  General: Sparkles,
};

const GROUP_COLORS = {
  Social: "from-blue-500 to-blue-600",
  Academic: "from-purple-500 to-purple-600",
  Popularity: "from-gold-400 to-gold-600",
  Sports: "from-green-500 to-emerald-600",
  Leadership: "from-red-500 to-rose-600",
  Creative: "from-pink-500 to-fuchsia-600",
  Fashion: "from-violet-500 to-purple-600",
  Business: "from-cyan-500 to-blue-600",
  General: "from-orange-400 to-gold-500",
};

export default function HomePage() {
  const [activeGroup, setActiveGroup] = useState("All");
  const { data: events = [] } = useGetEventsQuery({});
  const { data: categories = [], isLoading: catLoading } =
    useGetCategoriesQuery();

  const totalCategories = categories.length;
  const categoryGroups = [...new Set(categories.map((c) => c.group))].filter(
    Boolean,
  );

  const liveEvents = events.filter(
    (e) => getEventStatus(e.startDate, e.endDate, e.isOpen) === "open",
  );
  const totalVotesAcrossEvents = events.reduce(
    (s, e) => s + (e.totalVotes || 0),
    0,
  );

  const filteredCategories =
    activeGroup === "All"
      ? categories
      : categories.filter((c) => c.group === activeGroup);

  return (
    <div className="animate-fade-in">
      <section className="relative bg-hero-pattern overflow-hidden min-h-[90vh] flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="particle w-64 h-64 opacity-20"
            style={{ top: "-5%", left: "-5%", animationDelay: "0s" }}
          />
          <div
            className="particle w-48 h-48 opacity-15"
            style={{ top: "20%", right: "-3%", animationDelay: "2s" }}
          />
          <div
            className="particle w-32 h-32 opacity-10"
            style={{ bottom: "15%", left: "10%", animationDelay: "4s" }}
          />
          <div
            className="particle w-80 h-80 opacity-10"
            style={{ bottom: "-10%", right: "5%", animationDelay: "1s" }}
          />
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="page-container relative z-10 pt-12 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gold-500/15 border border-gold-500/30 rounded-full text-gold-300 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
            FASA Awards 2026 — University of Benin
          </div>

          <h1 className="font-body text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 text-balance">
            <span className="block">Celebrate</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600">
              Excellence &amp;
            </span>
            <span className="block">Greatness</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-4 font-light leading-relaxed">
            {totalCategories || "26+"} award categories. Vote for the best
            minds, leaders, artists, and icons of the Faculty of Arts, UNIBEN.
          </p>
          <p className="text-sm text-gold-400 font-medium mb-10">
            {formatNumber(totalVotesAcrossEvents || 4200)}+ votes cast •{" "}
            {liveEvents.length} live event{liveEvents.length !== 1 ? "s" : ""}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#categories"
              className="group btn-primary text-base px-10 py-4 shadow-gold-lg animate-pulse-gold"
            >
              <Trophy size={20} />
              Find Your Category
              <ArrowRight
                size={17}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <Link
              to="/about"
              className="btn-secondary text-base px-10 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Learn More
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10 mt-16">
            {[
              {
                value: totalCategories ? totalCategories.toString() : "—",
                label: "Award Categories",
              },
              {
                value: `${formatNumber(totalVotesAcrossEvents || 4200)}+`,
                label: "Votes Cast",
              },
              { value: "100%", label: "Secure Payments" },
              { value: liveEvents.length.toString(), label: "Live Events" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white font-body">
                  {value}
                </div>
                <div className="text-xs text-gray-400 font-medium mt-1 tracking-wide">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 80L1440 80L1440 0C1200 65 900 80 720 50C540 20 240 65 0 0L0 80Z"
              fill="rgb(249,250,251)"
            />
          </svg>
        </div>
      </section>

      {liveEvents.length > 0 && (
        <section className="py-14 bg-gray-50">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="section-label text-emerald-600">Live Now</p>
                </div>
                <h2 className="text-2xl font-body font-bold text-gray-900">
                  Active Voting Events
                </h2>
              </div>
              <Link
                to="/events"
                className="btn-ghost text-gold-600 hover:text-gold-700 hover:bg-gold-50"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveEvents.slice(0, 3).map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="categories" className="py-20 bg-white scroll-mt-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="section-label mb-3">FASAN Awards 2026</p>
            <h2 className="font-body text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {totalCategories ? `All ${totalCategories}` : "All"} Award
              Categories
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Tap a category to see its candidates and cast your vote. Live
              categories are marked with a green dot.
            </p>
          </div>

          {catLoading ? (
            <PageLoader />
          ) : categories.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">
              Categories are being set up. Check back shortly.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 justify-center mb-10">
                {"All" === activeGroup ? (
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all bg-gray-900 text-white border-gray-900 shadow-sm">
                    All
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveGroup("All")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    All
                  </button>
                )}
                {categoryGroups.map((group) => {
                  const Icon = GROUP_ICONS[group];
                  return (
                    <button
                      key={group}
                      onClick={() => setActiveGroup(group)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        activeGroup === group
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {Icon && <Icon size={13} />}
                      {group}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((cat) => {
                  const Icon = GROUP_ICONS[cat.group] || Award;
                  const gradColor =
                    GROUP_COLORS[cat.group] || "from-gold-400 to-gold-600";
                  const matchEvent = events.find(
                    (e) =>
                      getEventStatus(e.startDate, e.endDate, e.isOpen) ===
                        "open" && e.categoryId === cat._id,
                  );
                  return (
                    <Link
                      key={cat._id}
                      to={`/category/${cat._id}`}
                      className="group card p-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex items-start gap-4"
                    >
                      <div
                        className={`w-11 h-11 bg-gradient-to-br ${gradColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform text-lg`}
                      >
                        <span>
                          {cat.emoji || (
                            <Icon size={18} className="text-white" />
                          )}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-gold-700 transition-colors">
                            {cat.name}
                          </p>
                          {matchEvent && (
                            <span
                              className="flex-shrink-0 w-2 h-2 bg-emerald-400 rounded-full mt-1 animate-pulse"
                              title="Live event"
                            />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cat.group}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                        <p className="text-xs text-gold-500 font-medium mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                          {matchEvent ? "Vote now" : "View →"}
                          <ChevronRight size={11} />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          <div className="text-center mt-10">
            <Link to="/events" className="btn-primary px-10">
              <Trophy size={16} /> See All Voting Events
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Simple process</p>
            <h2 className="font-body text-3xl font-bold text-gray-900">
              How voting works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: Trophy,
                title: "Choose a category",
                desc: "Browse all the award categories and pick the one you want to vote in.",
              },
              {
                step: "02",
                icon: Users,
                title: "Pick your candidate",
                desc: "View all contestants, their profiles, and current standings before deciding.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Pay & vote securely",
                desc: "Complete your vote via Paystack — Nigeria's most trusted payment gateway.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 shadow-card flex items-center justify-center group-hover:shadow-card-hover group-hover:-translate-y-1 transition-all duration-200">
                    <Icon size={26} className="text-gold-500" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-body font-bold text-gray-900 text-lg mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-hero-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-900/20 to-transparent" />
        <div className="page-container relative z-10 text-center">
          <Crown
            size={48}
            className="text-gold-400 mx-auto mb-6 animate-float"
          />
          <h2 className="font-body text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to make your vote count?
          </h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Support your favourite FASAN across every award category. Every vote
            matters.
          </p>
          <Link
            to="/events"
            className="btn-primary text-base px-10 py-4 shadow-gold-lg animate-pulse-gold"
          >
            <Zap size={18} /> Vote Now — It Only Takes a Minute
          </Link>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }) {
  const status = getEventStatus(event.startDate, event.endDate, event.isOpen);
  return (
    <Link
      to={`/events/${event._id}`}
      className="card block overflow-hidden group transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover"
    >
      {event.bannerImage ? (
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
          <Crown size={48} className="text-gold-400/50 relative z-10" />
          {event.category && (
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-xs text-gold-300/70 font-medium">
                {event.category}
              </span>
            </div>
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
        <h3 className="font-body font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-gold-700 transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">{event.organization}</p>
        <CountdownTimer targetDate={event.endDate} />
        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-gray-50">
          <span className="text-gray-400">
            {formatNumber(event.totalVotes || 0)} votes
          </span>
          <span className="font-semibold text-gold-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Vote now <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
