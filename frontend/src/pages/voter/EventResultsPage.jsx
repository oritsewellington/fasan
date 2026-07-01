import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";
import EventLeaderboard from "../../components/EventLeaderboard.jsx";

/**
 * EventResultsPage — /events/:eventId/results
 * -----------------------------------------------------------------------
 * Full standings view for one event. Dark hero band matches the
 * homepage's gold/gray-900 treatment so this doesn't feel like a
 * bolted-on admin screen.
 */
export default function EventResultsPage() {
  const { eventId } = useParams();

  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="page-container py-16">
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-400 transition-colors mb-8"
        >
          <ArrowLeft size={13} /> Back to candidates
        </Link>

        <div className="max-w-xl mx-auto">
          <EventLeaderboard eventId={eventId} />

          <Link
            to={`/events/${eventId}`}
            className="btn-primary w-full mt-6 justify-center"
          >
            <Zap size={16} /> Cast Your Vote
          </Link>
        </div>
      </div>
    </div>
  );
}
