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
import { PageLoader, CountdownTimer } from "../../components/ui/index.jsx";

const QUICK_AMOUNTS = [5, 10, 20, 50];

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
  const [initializePayment] = useInitializePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const { initializePayment: openPaystack } = usePaystack();

  // Load Paystack inline script
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.body.appendChild(s);
    return () => {
      try {
        document.body.removeChild(s);
      } catch {}
    };
  }, []);

  if (cLoad || evLoad) return <PageLoader />;
  if (!candidate || !event)
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>Not found.</p>
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
          try {
            await verifyPayment(reference).unwrap();
            toast.success("Vote confirmed! Thank you! 🎉");
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

  return (
    <div
      className="animate-fade-in"
      style={{
        fontFamily: "Inter, sans-serif",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* ── Sticky top bar ───────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(249,250,251,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #f3f4f6",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          to={`/events/${eventId}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {candidate.name}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "#9ca3af",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {event.title}
          </p>
        </div>
        <button
          onClick={handleShare}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Share2 size={15} />
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0 80px" }}>
        {/* ── Hero photo ───────────────────────────────────────────────── */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              style={{
                width: "100%",
                height: "min(65vw, 380px)",
                objectFit: "cover",
                objectPosition: "top",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "min(65vw, 320px)",
                background: "linear-gradient(135deg,#1a0a02,#0d0603)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Crown size={56} style={{ color: "rgba(245,158,11,0.4)" }} />
            </div>
          )}
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.82), transparent)",
              pointerEvents: "none",
            }}
          />
          {/* Candidate badge */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              background: "rgba(245,158,11,0.92)",
              backdropFilter: "blur(4px)",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            <Hash size={11} /> {candidateCode}
          </div>
          {/* Name overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "20px 18px 18px",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(1.3rem, 5vw, 1.7rem)",
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 4px",
                lineHeight: 1.2,
              }}
            >
              {candidate.name}
            </h1>
            {candidate.department && (
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                }}
              >
                {candidate.department}
              </p>
            )}
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            background: "#fff",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          {[
            {
              label: "Votes",
              value: (candidate.totalVotes || 0).toLocaleString(),
            },
            {
              label: "Category",
              value:
                event.category?.split(" ").slice(0, 2).join(" ") || "Award",
            },
            { label: "Per vote", value: formatNaira(event.pricePerVote) },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                padding: "14px 10px",
                textAlign: "center",
                borderRight: "1px solid #f3f4f6",
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#111827",
                  margin: "0 0 2px",
                  lineHeight: 1,
                }}
              >
                {value}
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Bio ───────────────────────────────────────────────────────── */}
        {candidate.bio && (
          <div
            style={{
              padding: "16px 18px",
              background: "#fff",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: "#374151",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {candidate.bio}
            </p>
          </div>
        )}

        {/* ── Countdown ─────────────────────────────────────────────────── */}
        {votingOpen && (
          <div
            style={{
              padding: "16px 18px",
              background: "#fff",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <CountdownTimer
              targetDate={event.endDate}
              label="Voting closes in"
            />
          </div>
        )}

        {/* ── Voting closed state ───────────────────────────────────────── */}
        {!votingOpen && (
          <div
            style={{
              margin: 16,
              padding: "28px 20px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 16,
              textAlign: "center",
            }}
          >
            <AlertCircle
              size={32}
              style={{ color: "#f87171", margin: "0 auto 10px" }}
            />
            <h2
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#991b1b",
                margin: "0 0 6px",
              }}
            >
              Voting is closed
            </h2>
            <p style={{ fontSize: 13, color: "#b91c1c", margin: "0 0 16px" }}>
              This event is no longer accepting votes.
            </p>
            <Link
              to={`/events/${eventId}`}
              className="btn-secondary"
              style={{ display: "inline-flex" }}
            >
              View results
            </Link>
          </div>
        )}

        {/* ── Vote form ─────────────────────────────────────────────────── */}
        {votingOpen && step === "form" && (
          <div
            style={{
              margin: "12px 14px 0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Name */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f3f4f6",
                padding: "16px 16px 18px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                }}
              >
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

            {/* Email */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f3f4f6",
                padding: "16px 16px 18px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                }}
              >
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
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0" }}>
                Receipt will be sent here
              </p>
            </div>

            {/* Votes */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f3f4f6",
                padding: "16px 16px 18px",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 12,
                }}
              >
                Number of votes · {formatNaira(event.pricePerVote)} each
              </label>

              {/* Stepper */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: "1.5px solid #e5e7eb",
                    background: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    fontSize: 20,
                    color: "#374151",
                    fontWeight: 700,
                  }}
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
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#111827",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "8px 0",
                    outline: "none",
                    background: "#fff",
                    MozAppearance: "textfield",
                  }}
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: "1.5px solid #e5e7eb",
                    background: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    fontSize: 20,
                    color: "#374151",
                    fontWeight: 700,
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Quick amounts */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                }}
              >
                {QUICK_AMOUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuantity(n)}
                    style={{
                      padding: "9px 4px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1.5px solid",
                      textAlign: "center",
                      transition: "all 0.15s",
                      background: quantity === n ? "#f59e0b" : "#f9fafb",
                      color: quantity === n ? "#fff" : "#374151",
                      borderColor: quantity === n ? "#f59e0b" : "#e5e7eb",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Total summary */}
            <div
              style={{
                background: "linear-gradient(135deg,#fffbeb,#fef3c7)",
                border: "1.5px solid #fde68a",
                borderRadius: 16,
                padding: "18px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#92400e",
                      margin: "0 0 4px",
                    }}
                  >
                    {quantity} vote{quantity !== 1 ? "s" : ""} ×{" "}
                    {formatNaira(event.pricePerVote)}
                  </p>
                  <p
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#78350f",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {formatNaira(totalAmount)}
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Shield
                    size={22}
                    style={{
                      color: "#10b981",
                      display: "block",
                      margin: "0 auto 4px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    Secured by
                    <br />
                    Paystack
                  </p>
                </div>
              </div>
            </div>

            {/* Proceed button */}
            <button
              onClick={handleProceed}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 16,
                borderRadius: 14,
                letterSpacing: "0.01em",
              }}
            >
              <Star size={18} style={{ fill: "#fff" }} /> Continue to pay{" "}
              {formatNaira(totalAmount)}
            </button>

            <p
              style={{
                fontSize: 11,
                textAlign: "center",
                color: "#9ca3af",
                margin: 0,
                padding: "0 16px",
              }}
            >
              By voting you agree to our terms. Votes are final and
              non-refundable.
            </p>
          </div>
        )}

        {/* ── Confirm step ──────────────────────────────────────────────── */}
        {votingOpen && step === "confirm" && (
          <div
            style={{
              margin: "12px 14px 0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #f3f4f6",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid #f9fafb",
                  background: "#fffbeb",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#92400e",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 2px",
                  }}
                >
                  Confirm your vote
                </p>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                  Double-check before paying
                </p>
              </div>

              {/* Details */}
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 18px",
                    borderBottom: "1px solid #f9fafb",
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: "#9ca3af", flexShrink: 0 }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: label === "Amount" ? "#d97706" : "#111827",
                      textAlign: "right",
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div
              style={{
                background: "#fef9c3",
                border: "1px solid #fef08a",
                borderRadius: 12,
                padding: "13px 15px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <AlertCircle
                size={15}
                style={{ color: "#ca8a04", flexShrink: 0, marginTop: 1 }}
              />
              <p
                style={{
                  fontSize: 12,
                  color: "#713f12",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                <strong>Votes are final.</strong> Refunds and reversals are not
                allowed once your payment is confirmed.
              </p>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 10,
              }}
            >
              <button
                onClick={() => setStep("form")}
                className="btn-secondary"
                style={{ borderRadius: 14, padding: "15px 0" }}
                disabled={processing}
              >
                Go back
              </button>
              <button
                onClick={handleVote}
                className="btn-primary"
                style={{ borderRadius: 14, padding: "15px 0", fontSize: 15 }}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />{" "}
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

        {/* ── Share link ────────────────────────────────────────────────── */}
        <div
          style={{
            margin: "16px 14px 0",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #f3f4f6",
            padding: "16px 16px 18px",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 8px",
            }}
          >
            Share {candidate.name.split(" ")[0]}'s link
          </p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 12px" }}>
            Send this to friends so they can also vote for{" "}
            {candidate.name.split(" ")[0]}.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "9px 12px",
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            <Link2 size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
            <span
              style={{
                fontSize: 12,
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {candidateUrl}
            </span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <button
              onClick={handleCopyLink}
              className="btn-secondary"
              style={{
                borderRadius: 10,
                padding: "11px 0",
                fontSize: 13,
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {copied ? (
                <>
                  <Check size={14} style={{ color: "#10b981" }} /> Copied!
                </>
              ) : (
                <>
                  <Link2 size={13} /> Copy link
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="btn-primary"
              style={{
                borderRadius: 10,
                padding: "11px 0",
                fontSize: 13,
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ── Fixed bottom CTA (mobile only, form step) ─────────────────── */}
      {votingOpen && step === "form" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 14px 20px",
            background: "rgba(249,250,251,0.96)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid #e5e7eb",
            zIndex: 40,
          }}
        >
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                {quantity} vote{quantity !== 1 ? "s" : ""}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#111827",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {formatNaira(totalAmount)}
              </p>
            </div>
            <button
              onClick={handleProceed}
              className="btn-primary"
              style={{
                padding: "13px 24px",
                fontSize: 14,
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              <Star size={15} style={{ fill: "#fff" }} /> Vote now
            </button>
          </div>
        </div>
      )}

      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
