import { useState, useEffect } from "react";
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
  Shield,
  Zap,
  Lock,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetCandidateQuery,
  useGetCandidatesQuery,
} from "../../store/api/candidatesApi.js";
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
  rankCandidates,
  getTotalVotes,
  calcPercent,
} from "../../utils/helpers.js";
import { PageLoader, CountdownTimer } from "../../components/ui/index.jsx";

const QUICK_AMOUNTS = [5, 10, 20, 50];
const POPULAR_AMOUNT = 20;

export default function CandidatePage() {
  const { eventId, candidateId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [voterName, setVoterName] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "confirm"

  const { data: candidate, isLoading: cLoad } = useGetCandidateQuery({
    eventId,
    candidateId,
  });
  const { data: event, isLoading: evLoad } = useGetEventQuery(eventId);
  // Same standings data the Event Details page already fetches — reused
  // here purely to compute this one candidate's rank/share, so the number
  // shown is always real and consistent with the results page.
  const { data: allCandidates = [] } = useGetCandidatesQuery(eventId);
  const [initializePayment] = useInitializePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const { initializePayment: openPaystack } = usePaystack();

  useEffect(() => {
    if (window.PaystackPop || document.getElementById("paystack-inline-js"))
      return;
    const s = document.createElement("script");
    s.id = "paystack-inline-js";
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  if (cLoad || evLoad) return <PageLoader />;
  if (!candidate || !event)
    return (
      <div className="py-20 px-5 text-center">
        <p className="text-gray-500 mb-4">Not found.</p>
        <Link to="/events" className="btn-primary">
          Back to events
        </Link>
      </div>
    );

  const votingOpen = isVotingOpen(event);
  const totalAmount = event.pricePerVote * quantity;
  const candidateUrl = `${window.location.origin}/events/${eventId}/candidates/${candidateId}`;
  const candidateCode =
    candidate.candidateCode ||
    "FASA-" + String(candidate.candidateNumber).padStart(4, "0");

  // Real standings, derived from live data — never fabricated.
  const ranked = rankCandidates(allCandidates);
  const totalEventVotes = getTotalVotes(allCandidates);
  const rankIdx = ranked.findIndex((c) => c._id === candidateId);
  const rank = rankIdx >= 0 ? rankIdx + 1 : null;
  const sharePct =
    totalEventVotes > 0
      ? calcPercent(candidate.totalVotes, totalEventVotes).toFixed(1)
      : null;
  const isLeading = rank === 1 && (candidate.totalVotes || 0) > 0;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(candidateUrl);
      setCopied(true);
      toast.success("Link copied! Share so others can vote too.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Long-press to copy manually.");
    }
  };

  const handleShare = () => {
    const text = `Vote for ${candidate.name} in ${event.title} — FASA Awards 2026! 🏆`;
    if (navigator.share) {
      navigator.share({ title: text, text, url: candidateUrl }).catch(() => {});
    } else handleCopyLink();
  };

  const handleProceed = () => {
    if (!voterName.trim()) return toast.error("Enter your name.");
    if (!voterEmail.trim() || !voterEmail.includes("@"))
      return toast.error("Enter a valid email.");
    if (!votingOpen) return toast.error("Voting is closed.");
    setStep("confirm");
  };

  const handleVote = async () => {
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
          const successParams = new URLSearchParams({
            ref: reference,
            candidate: candidate.name,
            votes: String(quantity),
            event: event.title,
          });

          try {
            await verifyPayment(reference).unwrap();
            toast.success("Vote confirmed! Thank you! 🎉");
          } catch (err) {
            successParams.set("pending", "true");
            toast.info(
              "Payment received — confirming your vote, this can take a moment.",
            );
          } finally {
            setProcessing(false);
            navigate(`/vote/success?${successParams.toString()}`);
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

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      {/* ── Sticky top bar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          to={`/events/${eventId}`}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-gray-900 truncate">
            {candidate.name}
          </p>
          <p className="text-[11px] text-gray-400 truncate">{event.title}</p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <Share2 size={15} />
        </button>
      </div>

      {/* ── Desktop: two-column layout. Mobile: single stacked column. ──
          lg:grid-cols-[1fr_1.15fr] gives the form column slightly more
          room since it holds the denser content (inputs, quantity, total). */}
      <div className="max-w-[1100px] mx-auto pb-24 lg:pb-16 lg:pt-8 lg:px-6">
        <div className="lg:grid lg:grid-cols-[1fr_1.15fr] lg:gap-8 lg:items-start">
          {/* ══════════════ LEFT: candidate panel (sticky on desktop) ══ */}
          <div className="lg:sticky lg:top-24">
            <div className="lg:rounded-3xl lg:overflow-hidden lg:card lg:p-0">
              {/* Hero photo */}
              <div className="relative overflow-hidden">
                {candidate.photo ? (
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-full h-[min(75vw,450px)] lg:h-[480px] object-cover object-top block"
                  />
                ) : (
                  <div className="w-full h-[min(65vw,320px)] lg:h-[480px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                    <Crown size={56} className="text-gold-400/40" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                  <Hash size={11} /> {candidateCode}
                </div>

                {rank && (
                  <div
                    className={`absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 backdrop-blur-sm rounded-full text-xs font-bold ${
                      isLeading
                        ? "bg-gold-400 text-black"
                        : "bg-black/50 text-white"
                    }`}
                  >
                    {isLeading ? <Crown size={11} /> : <TrendingUp size={11} />}
                    {isLeading ? "Leading" : `#${rank}`}
                    {sharePct && ` · ${sharePct}%`}
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 p-5">
                  <h1 className="font-body text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1">
                    {candidate.name}
                  </h1>
                  {candidate.department && (
                    <p className="text-[13px] text-white/70">
                      {candidate.department}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 bg-white border-b border-gray-100">
                {[
                  {
                    label: "Category",
                    value:
                      event.category?.split(" ").slice(0, 2).join(" ") ||
                      "Award",
                  },
                  { label: "Per vote", value: formatNaira(event.pricePerVote) },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`py-3.5 px-2.5 text-center ${i === 0 ? "border-r border-gray-100" : ""}`}
                  >
                    <p className="text-[15px] font-extrabold text-gray-900 leading-none mb-0.5">
                      {value}
                    </p>
                    <p className="text-[11px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              {candidate.bio && (
                <div className="px-4.5 py-4 bg-white border-b border-gray-100 lg:border-b-0">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {candidate.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Share card — desktop only, sits under the sticky panel */}
            <div className="hidden lg:block card p-4 pb-4.5 mt-4">
              <ShareBlock
                candidate={candidate}
                candidateUrl={candidateUrl}
                copied={copied}
                onCopy={handleCopyLink}
                onShare={handleShare}
              />
            </div>
          </div>

          {/* ══════════════ RIGHT: countdown, form, actions ═══════════ */}
          <div className="lg:pt-0">
            {votingOpen && (
              <div className="px-4.5 py-4 lg:px-0 lg:pt-0 lg:pb-4 bg-white lg:bg-transparent border-b border-gray-100 lg:border-b-0">
                <CountdownTimer
                  targetDate={event.endDate}
                  label="Voting closes in"
                />
              </div>
            )}

            {!votingOpen && (
              <div className="m-4 lg:mx-0 lg:mt-0 p-7 bg-red-50 border border-red-200 rounded-2xl text-center">
                <AlertCircle
                  size={32}
                  className="text-red-400 mx-auto mb-2.5"
                />
                <h2 className="text-[17px] font-bold text-red-800 mb-1.5">
                  Voting is closed
                </h2>
                <p className="text-[13px] text-red-600 mb-4">
                  This event is no longer accepting votes.
                </p>
                <Link
                  to={`/events/${eventId}`}
                  className="btn-secondary inline-flex"
                >
                  View results
                </Link>
              </div>
            )}

            {votingOpen && step === "form" && (
              <div className="mx-3.5 lg:mx-0 mt-3 lg:mt-0 flex flex-col gap-3">
                <div className="card p-4 pb-4.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Your full name
                  </label>
                  <input
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field"
                    autoComplete="name"
                  />
                </div>

                <div className="card p-4 pb-4.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={voterEmail}
                    onChange={(e) => setVoterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    autoComplete="email"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Receipt will be sent here
                  </p>
                </div>

                <div className="card p-4 pb-4.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Number of votes · {formatNaira(event.pricePerVote)} each
                  </label>

                  <div className="flex items-center gap-3 mb-3.5">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-[42px] h-[42px] rounded-xl border-[1.5px] border-gray-200 bg-gray-50 flex items-center justify-center text-gray-700 font-bold flex-shrink-0 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="flex-1 text-center text-2xl font-extrabold text-gray-900 border-[1.5px] border-gray-200 rounded-xl py-2 outline-none bg-white focus:border-gold-400 no-spinner"
                    />
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-[42px] h-[42px] rounded-xl border-[1.5px] border-gray-200 bg-gray-50 flex items-center justify-center text-gray-700 font-bold flex-shrink-0 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setQuantity(n)}
                        className={`relative py-2.5 px-1 rounded-xl text-[13px] font-bold text-center border-[1.5px] transition-all ${
                          quantity === n
                            ? "bg-gold-500 text-white border-gold-500"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {n === POPULAR_AMOUNT && (
                          <span
                            className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              quantity === n
                                ? "bg-white text-gold-600"
                                : "bg-gold-500 text-white"
                            }`}
                          >
                            POPULAR
                          </span>
                        )}
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total summary */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-[1.5px] border-amber-200 rounded-2xl p-[18px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-800 mb-1">
                        {quantity} vote{quantity !== 1 ? "s" : ""} ×{" "}
                        {formatNaira(event.pricePerVote)}
                      </p>
                      <p className="text-[26px] font-extrabold text-amber-900 leading-none">
                        {formatNaira(totalAmount)}
                      </p>
                    </div>
                    <div className="text-center">
                      <Shield
                        size={22}
                        className="text-emerald-500 mx-auto mb-1"
                      />
                      <p className="text-[10px] text-gray-500 font-semibold leading-tight">
                        Secured by
                        <br />
                        Paystack
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop proceed button (mobile uses the fixed bar instead) */}
                <button
                  onClick={handleProceed}
                  className="hidden lg:flex btn-primary w-full py-4 text-base rounded-2xl tracking-tight"
                >
                  <Star size={18} className="fill-white" /> Continue to pay{" "}
                  {formatNaira(totalAmount)}
                </button>

                {/* Trust row — real, non-fabricated claims about the checkout itself */}
                <div className="flex items-center justify-center gap-5 py-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <Lock size={12} className="text-gray-400" /> Encrypted
                    checkout
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <Zap size={12} className="text-gray-400" /> Instant
                    confirmation
                  </span>
                </div>

                <p className="text-[11px] text-center text-gray-400 px-4 lg:hidden">
                  By voting you agree to our terms. Votes are final and
                  non-refundable.
                </p>
              </div>
            )}

            {votingOpen && step === "confirm" && (
              <div className="mx-3.5 lg:mx-0 mt-3 lg:mt-0 flex flex-col gap-3">
                <div className="card overflow-hidden">
                  <div className="px-4.5 py-4 border-b border-gray-50 bg-amber-50">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">
                      Confirm your vote
                    </p>
                    <p className="text-[13px] text-gray-500">
                      Double-check before paying
                    </p>
                  </div>

                  {[
                    ["Voting for", candidate.name],
                    ["Candidate #", candidateCode],
                    ["Event", event.title],
                    ["Your name", voterName],
                    ["Email", voterEmail],
                    ["Votes", `${quantity} vote${quantity > 1 ? "s" : ""}`],
                    ["Amount", formatNaira(totalAmount)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between items-start gap-3 px-4.5 py-3 border-b border-gray-50 last:border-b-0"
                    >
                      <span className="text-[13px] text-gray-400 flex-shrink-0">
                        {label}
                      </span>
                      <span
                        className={`text-[13px] font-semibold text-right break-words ${
                          label === "Amount"
                            ? "text-amber-600"
                            : "text-gray-900"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 items-start">
                  <AlertCircle
                    size={15}
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Votes are final.</strong> Refunds and reversals are
                    not allowed once your payment is confirmed.
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_2fr] gap-2.5">
                  <button
                    onClick={() => setStep("form")}
                    className="btn-secondary rounded-2xl py-[15px]"
                    disabled={processing}
                  >
                    Go back
                  </button>
                  <button
                    onClick={handleVote}
                    className="btn-primary rounded-2xl py-[15px] text-[15px]"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                        Verifying…
                      </>
                    ) : (
                      <>
                        <CheckCircle size={17} /> Pay {formatNaira(totalAmount)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Share card — mobile only (desktop version lives under the
                sticky left panel instead) */}
            <div className="card p-4 pb-4.5 mx-3.5 mt-4 lg:hidden">
              <ShareBlock
                candidate={candidate}
                candidateUrl={candidateUrl}
                copied={copied}
                onCopy={handleCopyLink}
                onShare={handleShare}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed bottom CTA (mobile only, form step) ─────────────────── */}
      {votingOpen && step === "form" && (
        <div className="fixed bottom-0 inset-x-0 z-40 px-3.5 pb-5 pt-3 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden">
          <div className="max-w-[680px] mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">
                {quantity} vote{quantity !== 1 ? "s" : ""}
              </p>
              <p className="text-lg font-extrabold text-gray-900 leading-none">
                {formatNaira(totalAmount)}
              </p>
            </div>
            <button
              onClick={handleProceed}
              className="btn-primary px-6 py-[13px] text-sm rounded-xl flex-shrink-0"
            >
              <Star size={15} className="fill-white" /> Vote now
            </button>
          </div>
        </div>
      )}

      <style>{`
        .no-spinner::-webkit-inner-spin-button,
        .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinner { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}

/** Shared between the mobile share card and the desktop sticky-panel version. */
function ShareBlock({ candidate, candidateUrl, copied, onCopy, onShare }) {
  return (
    <>
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
        Share {candidate.name.split(" ")[0]}'s link
      </p>
      <p className="text-xs text-gray-400 mb-3">
        Send this to friends so they can also vote for{" "}
        {candidate.name.split(" ")[0]}.
      </p>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-2.5 overflow-hidden">
        <Link2 size={13} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 truncate flex-1">
          {candidateUrl}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onCopy}
          className="btn-secondary rounded-lg py-2.5 text-[13px] justify-center flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-500" /> Copied!
            </>
          ) : (
            <>
              <Link2 size={13} /> Copy link
            </>
          )}
        </button>
        <button
          onClick={onShare}
          className="btn-primary rounded-lg py-2.5 text-[13px] justify-center flex items-center gap-1.5"
        >
          <Share2 size={13} /> Share
        </button>
      </div>
    </>
  );
}
