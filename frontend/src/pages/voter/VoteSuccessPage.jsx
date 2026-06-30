import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Share2, ArrowRight, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function VoteSuccessPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref");
  const candidate = params.get("candidate");
  const votes = params.get("votes");
  const event = params.get("event");

  const handleShare = () => {
    const text = `I just voted for ${candidate} in the FASA Awards 2026! 🏆 Cast your vote too at ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: "I voted in FASA Awards 2026!",
        text,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Share text copied!");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
            <CheckCircle size={44} className="text-emerald-500" />
          </div>
          <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
            🎉
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Vote confirmed!
        </h1>
        <p className="text-gray-500 mb-8">
          You cast{" "}
          <strong>
            {votes} vote{Number(votes) > 1 ? "s" : ""}
          </strong>{" "}
          for <strong>{candidate}</strong>.
        </p>
        <div className="card p-6 text-left mb-6 space-y-3 text-sm">
          {[
            ["Candidate", candidate],
            ["Event", event],
            ["Votes cast", `${votes} vote${Number(votes) > 1 ? "s" : ""}`],
            ["Reference", ref],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-900 text-right break-all">
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Share2 size={16} /> Share my vote
          </button>
          <Link
            to="/events"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Trophy size={16} /> Vote in another category{" "}
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
