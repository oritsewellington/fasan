import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

import Vote from "../models/Vote.model.js";

dotenv.config();

// 🚨 SET THIS TO false WHEN YOU ARE READY TO PERMANENTLY UPDATE THE DATABASE
const DRY_RUN = false;

const PAYSTACK_BASE = "https://api.paystack.co";

const paystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function reconcile() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    if (DRY_RUN) {
      console.log(
        "🧪 RUNNING IN DRY-RUN MODE (No database records will be changed)\n",
      );
    }

    // Find all votes currently marked as 'verified'
    const verifiedVotes = await Vote.find({ status: "verified" }).sort(
      "createdAt",
    );

    console.log(
      `Checking ${verifiedVotes.length} vote(s) starting with FASA_ against Paystack...\n`,
    );

    const problems = [];
    let dbTotal = 0;
    let confirmedTotal = 0;
    let repairedCount = 0;

    for (const vote of verifiedVotes) {
      dbTotal += vote.amount;

      // Skip non-FASA references if any exist
      if (!vote.reference || !vote.reference.startsWith("FASA_")) {
        console.log(`⚠️ Skipping non-matching reference: ${vote.reference}`);
        continue;
      }

      try {
        const { data } = await axios.get(
          `${PAYSTACK_BASE}/transaction/verify/${vote.reference}`,
          {
            headers: paystackHeaders(),
            timeout: 10000,
          },
        );

        const real = data?.data;
        const realStatus = real?.status;
        const realAmount = real?.amount; // In Kobo

        // Paystack says transaction was NOT successful
        if (!data.status || realStatus !== "success") {
          if (!DRY_RUN) {
            await Vote.findByIdAndUpdate(vote._id, { status: "failed" });
          }
          repairedCount++;
          console.log(
            `❌ Marked ${vote.reference} as FAILED (Paystack status: ${realStatus})`,
          );

          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: `Paystack status is "${realStatus}"`,
            dbAmount: vote.amount,
            paystackAmount: realAmount ?? "N/A",
          });
          continue;
        }

        // Amount mismatch check (Paystack amount vs DB amount)
        if (realAmount !== vote.amount) {
          if (!DRY_RUN) {
            await Vote.findByIdAndUpdate(vote._id, { status: "failed" });
          }
          repairedCount++;
          console.log(
            `❌ Marked ${vote.reference} as FAILED (Amount mismatch: DB=${vote.amount}, Paystack=${realAmount})`,
          );

          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: "Amount mismatch",
            dbAmount: vote.amount,
            paystackAmount: realAmount,
          });
          continue;
        }

        // Payment confirmed!
        confirmedTotal += vote.amount;
      } catch (err) {
        const statusCode = err.response?.status;

        // If Paystack returns 404, the transaction reference doesn't exist on Paystack
        if (statusCode === 404) {
          if (!DRY_RUN) {
            await Vote.findByIdAndUpdate(vote._id, { status: "failed" });
          }
          repairedCount++;
          console.log(
            `❌ Marked ${vote.reference} as FAILED (Transaction reference not found on Paystack)`,
          );

          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: "Reference not found on Paystack (404)",
            dbAmount: vote.amount,
            paystackAmount: "N/A",
          });
        } else {
          // SAFEGUARD: Network error, rate limits (429), or invalid key.
          // DO NOT CHANGE DATABASE STATUS HERE.
          console.log(
            `⚠️ SKIPPED ${vote.reference} due to API Error: ${err.message}`,
          );

          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: `API Error (Not modified): ${err.message}`,
            dbAmount: vote.amount,
            paystackAmount: "N/A",
          });
        }
      }

      // Pause to avoid Paystack rate limits
      await sleep(200);
    }

    console.log("\n========== RECONCILIATION SUMMARY ==========");
    console.log(
      `Mode:                     ${DRY_RUN ? "DRY RUN (Simulation)" : "LIVE REPAIR"}`,
    );
    console.log(`Total verified checked:   ${verifiedVotes.length}`);
    console.log(
      `Confirmed valid:          ₦${(confirmedTotal / 100).toLocaleString()}`,
    );
    console.log(
      `Previous DB Total:        ₦${(dbTotal / 100).toLocaleString()}`,
    );
    console.log(`Flagged/Repaired Count:   ${repairedCount}`);
    console.log("============================================\n");

    if (DRY_RUN) {
      console.log(
        "👉 If the numbers above look good, set `const DRY_RUN = false;` in the script and re-run.",
      );
    } else {
      console.log(
        "✅ Reconciliation finished. Now run candidate and event repair scripts.",
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("Fatal Script Error:", err);
    process.exit(1);
  }
}

reconcile();
