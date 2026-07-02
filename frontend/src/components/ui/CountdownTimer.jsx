import { Clock, AlertCircle } from "lucide-react";
import { useCountdown } from "../../hooks/useCountdown.js";

export default function CountdownTimer({ targetDate, label = "Ends in" }) {
  const t = useCountdown(targetDate);

  if (t.expired)
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 w-fit">
        <AlertCircle size={13} />
        Voting ended
      </div>
    );

  // Urgency tiers: red under 1hr, amber under 24hr, gold otherwise
  const totalHoursLeft = t.days * 24 + t.hours;
  const urgent = totalHoursLeft < 1;
  const soon = !urgent && totalHoursLeft < 24;

  const styles = urgent
    ? "text-red-700 bg-red-50 border-red-200"
    : soon
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-gold-700 bg-gold-50 border-gold-200";

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-2.5 py-1.5 w-fit ${styles}`}
    >
      <Clock size={13} className={urgent ? "animate-pulse" : ""} />
      <span>{label}:</span>
      <span className="font-extrabold tabular-nums tracking-tight">
        {t.days > 0 && <>{t.days}d </>}
        {String(t.hours).padStart(2, "0")}:{String(t.minutes).padStart(2, "0")}:
        {String(t.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
