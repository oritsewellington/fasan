import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Star,
  CheckCircle,
  Minus,
  Plus,
  AlertCircle,
  Hash,
  Share2,
  Link2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useGetCandidateQuery } from "../../store/api/candidatesApi.js";
import { useGetEventQuery } from "../../store/api/eventsApi.js";
import {
  useInitializePaymentMutation,
  useVerifyPaymentMutation,
} from "../../store/api/votesApi.js";
import { usePaystack } from "../../hooks/usePaystack.js";
import {
  formatNaira,
  generateReference,
  isVotingOpen,
} from "../../utils/helpers.js";
import { PageLoader } from "../../components/ui/index.jsx";

export default function CandidatePage() {
  const { eventId, candidateId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: candidate, isLoading: cLoad } = useGetCandidateQuery({
    eventId,
    candidateId,
  });
  const { data: event, isLoading: evLoad } = useGetEventQuery(eventId);
  const [initializePayment] = useInitializePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const { initializePayment: openPaystack } = usePaystack();

  if (cLoad || evLoad) return <PageLoader />;
  if (!candidate || !event)
    return (
      <div className="page-container py-20 text-center">
        <p className="text-gray-500">Not found.</p>
        <Link to="/events" className="btn-primary mt-4">
          Back to events
        </Link>
      </div>
    );

  const votingOpen = isVotingOpen(event);
  const totalAmount = event.pricePerVote * quantity;
  const candidateUrl = `${window.location.origin}/events/${eventId}/candidates/${candidateId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(candidateUrl);
      setCopied(true);
      toast.success("Link copied! Share it so others can vote too.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Long-press to copy manually.");
    }
  };

  const handleShare = () => {
    const text = `Vote for ${candidate.name} in ${event.title} — FASA Awards 2026! 🏆`;
    if (navigator.share) {
      navigator.share({ title: text, text, url: candidateUrl }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleVote = async () => {
    if (!voterName.trim()) return toast.error("Please enter your name.");
    if (!voterEmail.trim() || !voterEmail.includes("@"))
      return toast.error("Please enter a valid email.");
    if (!votingOpen) return toast.error("Voting is currently closed.");

    setProcessing(true);
    const reference = generateReference();

    try {
      await initializePayment({
        email: voterEmail,
        name: voterName,
        candidateId,
        eventId,
        quantity,
        reference,
      }).unwrap();

      openPaystack({
        email: voterEmail,
        amount: totalAmount,
        reference,
        metadata: {
          voterName,
          candidateName: candidate.name,
          eventTitle: event.title,
        },
        onSuccess: async () => {
          try {
            await verifyPayment(reference).unwrap();
            toast.success("Vote confirmed! Thank you!");
            navigate(
              `/vote/success?ref=${reference}&candidate=${encodeURIComponent(candidate.name)}&votes=${quantity}&event=${encodeURIComponent(event.title)}`,
            );
          } catch (err) {
            toast.error(
              err?.data?.message || "Verification failed. Contact support.",
            );
          } finally {
            setProcessing(false);
          }
        },
        onClose: () => {
          setProcessing(false);
          toast.info("Payment cancelled.");
        },
      });
    } catch (err) {
      setProcessing(false);
      toast.error(err?.data?.message || "Could not initialize payment.");
    }
  };

  const candidateCode =
    candidate.candidateCode ||
    "FASA-" + String(candidate.candidateNumber).padStart(4, "0");

  return (
    <div className="animate-fade-in">
      <div className="page-container py-10 max-w-5xl">
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft size={16} /> Back to candidates
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Candidate info — left */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              {candidate.photo ? (
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="w-full aspect-[3/4] object-cover object-top"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Crown size={56} className="text-gray-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-bold border border-gold-100">
                    <Hash size={10} /> {candidateCode}
                  </span>
                </div>
                <h1 className="font-display text-xl font-bold text-gray-900 mb-1">
                  {candidate.name}
                </h1>
                {candidate.department && (
                  <p className="text-sm text-gray-500 mb-0.5">
                    {candidate.department}
                  </p>
                )}
                {candidate.level && (
                  <p className="text-xs text-gray-400">{candidate.level}</p>
                )}
                {candidate.bio && (
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-50 pt-3">
                    {candidate.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Vote stats */}
            <div className="card p-5 mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Current standing
              </p>
              <p className="text-3xl font-bold text-gray-900 font-display mb-1">
                {(candidate.totalVotes || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mb-3">votes received</p>
            </div>

            {/* Share / copy link */}
            <div className="card p-5 mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Share {candidate.name.split(" ")[0]}'s link
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Send this link to friends so they can vote for{" "}
                {candidate.name.split(" ")[0]} too.
              </p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
                <Link2 size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-600 truncate flex-1">
                  {candidateUrl}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary flex-1 text-sm py-2.5 flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Link2 size={14} /> Copy link
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          </div>

          {/* Vote form — right */}
          <div className="lg:col-span-3">
            {!votingOpen ? (
              <div className="card p-8 text-center">
                <AlertCircle size={40} className="text-gray-300 mx-auto mb-4" />
                <h2 className="font-display text-xl font-bold text-gray-700 mb-2">
                  Voting is closed
                </h2>
                <p className="text-gray-400 text-sm">
                  This event is no longer accepting votes.
                </p>
                <Link to={`/events/${eventId}`} className="btn-secondary mt-6">
                  View results
                </Link>
              </div>
            ) : (
              <div className="card p-6 sm:p-8 space-y-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-1">
                    Vote for {candidate.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fill in your details and select how many votes to cast.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your full name
                  </label>
                  <input
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    placeholder="Enter your name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={voterEmail}
                    onChange={(e) => setVoterEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your payment receipt will be sent here.
                  </p>
                </div>

                {/* Quantity selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Number of votes{" "}
                    <span className="text-gray-400 font-normal">
                      — each vote = {formatNaira(event.pricePerVote)}
                    </span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="input-field text-center font-bold text-lg w-20"
                      />
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      {[5, 10, 20, 50].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQuantity(n)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${quantity === n ? "bg-gold-500 text-white border-gold-500" : "border-gray-200 text-gray-600 hover:border-gold-300 hover:text-gold-600"}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-2xl bg-gradient-to-br from-gold-50 to-amber-50 border border-gold-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        {quantity} vote{quantity !== 1 ? "s" : ""} ×{" "}
                        {formatNaira(event.pricePerVote)}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 font-display">
                        {formatNaira(totalAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <CheckCircle
                        size={20}
                        className="text-emerald-500 mx-auto mb-1"
                      />
                      <p className="text-xs text-gray-400">
                        Secure via Paystack
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleVote}
                  disabled={processing}
                  className="btn-primary w-full py-4 text-base animate-pulse-gold flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Star size={18} className="fill-white" /> Pay{" "}
                      {formatNaira(totalAmount)} & Vote Now
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400">
                  By voting you agree to our terms. Payments powered by
                  Paystack.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
