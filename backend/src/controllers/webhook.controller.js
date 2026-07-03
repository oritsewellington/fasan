import crypto from "crypto";
import Vote from "../models/Vote.model.js";
import { creditVerifiedVote } from "./vote.controller.js";

export async function paystackWebhook(req, res) {
  try {
    const signature = req.headers["x-paystack-signature"];

    const expected = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.rawBody)
      .digest("hex");

    if (!signature || signature !== expected) {
      return res.status(401).send("Invalid signature.");
    }

    res.sendStatus(200);

    const event = req.body;
    if (event.event !== "charge.success") return;

    const { reference, amount, status } = event.data;
    if (status !== "success") return;

    const vote = await Vote.findOne({ reference });
    if (!vote) return;
    if (vote.status === "verified") return;

    if (amount !== vote.amount) {
      vote.status = "failed";
      await vote.save();
      console.error(`Webhook amount mismatch for reference ${reference}`);
      return;
    }

    await creditVerifiedVote(vote);
  } catch (error) {
    console.error("Error processing Paystack Webhook event:", error);
  }
}
