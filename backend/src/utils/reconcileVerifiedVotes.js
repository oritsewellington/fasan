import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

import Vote from "../models/Vote.model.js";

dotenv.config();

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

    const verifiedVotes = await Vote.find({
      status: "verified",
    }).sort("createdAt");

    console.log(
      `Checking ${verifiedVotes.length} verified vote(s) against Paystack...\n`,
    );

    const problems = [];

    let dbTotal = 0;
    let confirmedTotal = 0;
    let repairedCount = 0;

    for (const vote of verifiedVotes) {
      dbTotal += vote.amount;

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
        const realAmount = real?.amount;

        // Payment not actually successful
        if (!data.status || realStatus !== "success") {
          await Vote.findByIdAndUpdate(vote._id, {
            status: "failed",
          });

          repairedCount++;

          console.log(
            `✔ Marked ${vote.reference} as FAILED (Paystack status: ${realStatus})`,
          );

          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: `Paystack status is "${realStatus}"`,
            dbAmount: vote.amount,
            paystackAmount: realAmount ?? "N/A",
            voterEmail: vote.voterEmail,
            candidateName: vote.candidateName,
          });

          continue;
        }

        // Successful payment but amount differs
        if (realAmount !== vote.amount) {
          await Vote.findByIdAndUpdate(vote._id, {
            status: "failed",
          });

          repairedCount++;

          console.log(`✔ Marked ${vote.reference} as FAILED (Amount mismatch)`);

          problems.push({
            voteId: vote._id,
            reference: vote.reference,
            issue: "Amount mismatch",
            dbAmount: vote.amount,
            paystackAmount: realAmount,
            voterEmail: vote.voterEmail,
            candidateName: vote.candidateName,
          });

          continue;
        }

        confirmedTotal += vote.amount;
      } catch (err) {
        await Vote.findByIdAndUpdate(vote._id, {
          status: "failed",
        });

        repairedCount++;

        console.log(
          `✔ Marked ${vote.reference} as FAILED (Could not verify with Paystack)`,
        );

        problems.push({
          voteId: vote._id,
          reference: vote.reference,
          issue:
            err.response?.data?.message ||
            err.response?.statusText ||
            err.message,
          dbAmount: vote.amount,
          paystackAmount: "N/A",
          voterEmail: vote.voterEmail,
          candidateName: vote.candidateName,
        });
      }

      await sleep(150);
    }

    console.log("\n========== SUMMARY ==========");
    console.log(`Verified votes checked:     ${verifiedVotes.length}`);
    console.log(`Confirmed good:             ₦${confirmedTotal / 100}`);
    console.log(`Database total:             ₦${dbTotal / 100}`);
    console.log(`Votes repaired:             ${repairedCount}`);
    console.log(`Problem records:            ${problems.length}`);
    console.log("=============================\n");

    if (problems.length) {
      console.log("Problem records:\n");

      problems.forEach((p) => {
        console.log("----------------------------------------");
        console.log(`Vote ID:          ${p.voteId}`);
        console.log(`Reference:        ${p.reference}`);
        console.log(`Issue:            ${p.issue}`);
        console.log(`DB Amount:        ₦${p.dbAmount / 100}`);
        console.log(
          `Paystack Amount:  ${
            p.paystackAmount === "N/A" ? "N/A" : "₦" + p.paystackAmount / 100
          }`,
        );
        console.log(`Candidate:        ${p.candidateName}`);
        console.log(`Email:            ${p.voterEmail}`);
      });

      console.log("----------------------------------------");
    } else {
      console.log("Everything matches Paystack.");
    }

    console.log(
      "\nNext step:\n" +
        "1. Run repairCandidateVotes.js\n" +
        "2. Run repairEventVotes.js\n" +
        "3. Candidate/Event totals will now match Paystack.",
    );

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reconcile();
