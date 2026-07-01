import crypto from "crypto";
import Vote from "../models/Vote.model.js";
import { creditVerifiedVote } from "./vote.controller.js";

/**
 * POST /api/webhooks/paystack
 *
 * Paystack calls this directly from their servers — no browser involved.
 * This is what actually credits a vote if the payer closes the tab
 * right after paying and the /verify callback never fires.
 *
 * Security: the ONLY thing that makes this endpoint safe to leave public
 * is verifying the x-paystack-signature header. Never trust the body of
 * a webhook request without checking this first — anyone could otherwise
 * POST a fake "charge.success" event and get free votes.
 */
export async function paystackWebhook(req, res) {
  const signature = req.headers["x-paystack-signature"];

  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody) // raw bytes — see app.js, must match exactly what Paystack signed
    .digest("hex");

  if (!signature || signature !== expected) {
    // Don't leak details about why — just reject.
    return res.status(401).send("Invalid signature.");
  }

  // Acknowledge receipt immediately; Paystack retries on non-2xx or timeout.
  res.sendStatus(200);

  const event = req.body;
  if (event.event !== "charge.success") return;

  const { reference, amount, status } = event.data;
  if (status !== "success") return;

  const vote = await Vote.findOne({ reference });
  if (!vote) return; // unknown reference — nothing to credit
  if (vote.status === "verified") return; // already credited via the callback path

  if (amount !== vote.amount) {
    vote.status = "failed";
    await vote.save();
    console.error(`Webhook amount mismatch for reference ${reference}`);
    return;
  }

  await creditVerifiedVote(vote);
}
