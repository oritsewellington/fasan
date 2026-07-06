// scripts/seedCandidates.js
//
// Safe to rerun: matches events by category name (case-insensitive),
// and skips any candidate whose name already exists under that event —
// so you can paste more WhatsApp batches later without duplicating
// anyone. photo and level are left blank on purpose since they haven't
// been sent yet; update those individually later via the admin
// dashboard or a follow-up script once you have them.

import dotenv from "dotenv";
import { connectDB } from "../utils/db.js";
import Category from "../models/Category.model.js";
import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

dotenv.config();

const CANDIDATES_BY_CATEGORY = {
  "Most Handsome FASA": [
    { name: "Oyamenda Ephraim Osaetin", department: "THR" },
    { name: "Victor Ojeagha Ataokhaime", department: "ENL" },
    { name: "Idubor Osamuyime Peter", department: "HIS" },
    { name: "Anonyuo Prosper Bernard", department: "HIS" },
    { name: "Justice Chima", department: "ISD" },
  ],

  "Parliamentarian of the Year": [
    { name: "Rt. Hon. Precious Paul Ibiabor", department: "ENL" },
    { name: "Rt. Hon. Ugiagbe Christopher", department: "HIS" },
    { name: "Rt. Hon. Amasowomwan Aiwansosa Prosper", department: "THR" },
    { name: "Hon. Osagie Esther", department: "Philosophy" },
    { name: "Hon. Obianuka Neche", department: "ISD" },
    { name: "Hon. Destiny Omorogbe", department: "" },
    { name: "RT. Hon. Israel Igunma Nosa", department: "" },
  ],

  "Brand of the Year": [
    { name: "Omi's Snacks", department: "ENL" },
    { name: "Emenike, Merit Chiderah", department: "ENL" },
    { name: "Jossy Empire", department: "FOL" },
    { name: "Osarenkhoe Esosa (Weo's Lux Craft)", department: "REL" },
    { name: "Gudy's Accessories", department: "HIS" },
    { name: "Toria's Treat", department: "Philosophy" },
    { name: "Eby's Kitchen", department: "Music Department" },
    { name: "CUTE CLAWS NG", department: "ISD" },
    { name: "D'Cake Nurse", department: "ISD" },
    { name: "Estarz Cake", department: "PHL" },
    { name: "CEO JOJO IMAGERY", department: "LIN" },
    { name: "AIGBOGUN OSARETINMWEN NKEM", department: "HIS" },
  ],

  "Departmental President of the Year": [
    { name: "Comr. Adorolo Oluchi", department: "ENL" },
    { name: "Eyanohonre Lucky Oghenetanure", department: "FOL" },
    { name: "Isreal Ehriga Onosumogho", department: "THR" },
    { name: "Ororho Destiny Ogheneochuko", department: "REL" },
    { name: "Edjere Kelvin", department: "Philosophy" },
    { name: "Joy", department: "Music" },
  ],

  "Clique of the Year": [
    { name: "5ive", department: "HIS" },
    { name: "PJS", department: "THR" },
    { name: "DY,STAN & NUEL", department: "LIN" },
    { name: "Amunzy X Marvenchy", department: "THR" },
  ],

  "Political Personality of the Year (Female)": [
    { name: "Enubuzor Hope Lucy", department: "ENL" },
    { name: "Comr. Adorolo Oluchi", department: "ENL" },
    { name: "Happy Osuware", department: "THR" },
    { name: "Ogala Priscilla", department: "HIS" },
    { name: "Esiegbe Favour", department: "PHL" },
    { name: "Chinoyelum Ethe", department: "ISD" },
    { name: "Omamofe EyiTuoyo", department: "ISD" },
  ],

  "Fashion Icon of the Year (Male)": [
    { name: "IMARHAYI E. ELOGHOSA", department: "ENL" },
    { name: "Babayem Uchayeka", department: "ENL" },
    { name: "Yisa Sunday Tomiwa", department: "REL" },
    { name: "Eyanohonre Lucky Oghenetanure", department: "FOL" },
    { name: "Emmanuel Oshioke Onyenye", department: "THR" },
    { name: "Oyamenda Ephriam Osaetin", department: "THR" },
    { name: "Sirbass", department: "HIS" },
    { name: "Kamal Abubakar", department: "Philosophy" },
    { name: "Pob", department: "Music Department" },
    { name: "ALUYI EFOSA DIVINE", department: "ISD" },
  ],

  "Political Personality of the Year (Male)": [
    { name: "Isreal Ehriga Onosumogho", department: "THR" },
    { name: "Ahonsi Godwin Ohiorenua (Photogee)", department: "HIS" },
    { name: "Emmanuel Eric", department: "Philosophy" },
    { name: "Emmanuel", department: "Music Department" },
    { name: "Jerry 'emenyoenu", department: "FOL" },
    { name: "Uwatse Oritstematosan", department: "ISD" },
    { name: "Edeh Emmanuel", department: "PHL" },
    { name: "Comr. Cosmas Silas Chidubem", department: "" },
  ],

  "Entrepreneur of the Year": [
    { name: "Uduak Ben Isaac", department: "REL" },
    { name: "Olajide Taiye Tamilore", department: "ENL" },
    { name: "Umeh Faith Oluchukwu", department: "FOL" },
    { name: "Omenai Emmanuel", department: "HIS" },
    { name: "Ebiye Daniella", department: "PHL" },
    { name: "Osadolor", department: "ISD" },
    { name: "Edith Iguma", department: "THR" },
  ],

  "Course Representative of the Year": [
    { name: "Racheal Eloho Okeoghene", department: "ENL" },
    { name: "Joseph Abu Francis", department: "THR" },
    { name: "Eyanohonre Lucky Oghenetanure", department: "FOL" },
    { name: "Nwokolo Donald", department: "HIS" },
    { name: "Okechukwu Anointed", department: "HIS" },
    { name: "Emmanuel Eric", department: "Philosophy" },
    { name: "Emmanuel", department: "Music Department" },
    { name: "Omolongbe Moses", department: "ISD" },
    { name: "Success Olise", department: "THR" },
    { name: "Emmanuel", department: "MUSIC" },
  ],

  "Most Talented FASA": [
    { name: "Michael Kayode Emehinola", department: "ENL" },
    { name: "Eyanohonre Lucky Oghenetanure", department: "FOL" },
    { name: "Emmi Sax", department: "Music Department" },
    { name: "Pascal", department: "Music Department" },
    { name: "Ivie Allyssia Okungbowa", department: "" },
  ],

  "Fashion Icon of the Year (Female)": [
    { name: "Agape Oluchi Oraegbu", department: "THR" },
    { name: "Ogala Priscilla", department: "HIS" },
    { name: "Esiegbe Favour", department: "Philosophy" },
    { name: "Osagie Esther", department: "Philosophy" },
    { name: "Itsisemhomhe Precious Faith", department: "Music" },
    { name: "Jessica", department: "Music Department" },
    { name: "Iruobe kikelomo Isabella", department: "FOL" },
    { name: "Adama Divine", department: "ISD" },
    { name: "Idehen Oghogho", department: "THR" },
    { name: "Eniyemamwen Praise (Empress)", department: "LIN" },
    { name: "AYE-EHIOSU STEPHANIE AIYOZE", department: "ISD" },
  ],

  "Most Social Female": [
    { name: "Esther Omghebele", department: "THR" },
    { name: "Oviawa Success", department: "Philosophy" },
    { name: "Rotana", department: "Music Department" },
    { name: "Oni Adesuwa", department: "ISD" },
    { name: "Eniyemamwen Praise (Empress)", department: "LIN" },
  ],

  "Most Influential FASA (Female)": [
    { name: "Hon. Omogui Tessy", department: "ENL" },
    { name: "Happy Osuware", department: "THR" },
    { name: "Ogala Priscilla", department: "HIS" },
    { name: "Usiomofo Constance", department: "PHIL" },
    { name: "Joy", department: "MUS" },
    { name: "Oghenemahro", department: "ISD" },
    { name: "Annabelle Ibhazobe", department: "PHL" },
    { name: "Eniyemamwen Praise (Empress)", department: "LIN" },
  ],

  "Most Popular FASA (Female)": [
    { name: "Ileso Oghoghosa Princess", department: "Religion" },
    { name: "Enubuzor Hope Lucy", department: "ENL" },
    { name: "Agape Oluchi Oraegbu", department: "THR" },
    { name: "Enoyoze Happiness", department: "Philosophy" },
    { name: "Joy", department: "Music" },
    { name: "Osamgbi Chinonyelum Ethel", department: "" },
    { name: "ODION OSAKPOLOR NICHOLAS", department: "" },
    { name: "Eniyemamwen Praise (Empress)", department: "LIN" },
  ],

  "Content Creator of the Year": [
    { name: "Mmesoma Okeke-Mikky", department: "ENL" },
    { name: "Magege Faith", department: "FOL" },
    { name: "Emmanuel M. Nwaebichi (Bobo)", department: "THR" },
    { name: "King Ololo", department: "Philosophy" },
    { name: "Ese Gold", department: "Philosophy" },
    { name: "Victor", department: "Music Department" },
    { name: "Otto", department: "ISD" },
    { name: "Princewill", department: "ISD" },
    { name: "Diva of uniben", department: "" },
  ],

  "Artist of the Year": [
    { name: "Destiny Osakhunmen Osagie (Derek More)", department: "THR" },
    { name: "Famous Asemota", department: "ENL" },
    { name: "Trust Alemenzohu", department: "Philosophy" },
    { name: "Monxta Boy", department: "Music Department" },
    { name: "Afokhai Afojeare Emmanuel", department: "LIN" },
    { name: "Omolongbe Moses", department: "ISD" },
    { name: "2 Sniky", department: "ISD" },
    { name: "Boi Teggz", department: "" },
  ],

  "Most Popular FASA (Male)": [
    { name: "Rt. Hon. Isreal Igunma", department: "REL" },
    { name: "COMR. Emmanuel M. Nwaebichi", department: "THR" },
    { name: "Ahonsi Godwin Ohiorenua (Photogee)", department: "HIS" },
    { name: "Elughaiwe Clement God'sgift (Mazi)", department: "HIS" },
    { name: "King Ololo", department: "Philosophy" },
    { name: "Emmanuel Eric", department: "Philosophy" },
    { name: "Emmanuel", department: "Music Department" },
    { name: "Uwatse Oritsematosan", department: "ISD" },
  ],

  "Academic Excellence Award (Male)": [
    { name: "Obovwodephia Oghenevwarhe Samuel", department: "REL" },
    { name: "Godwin Imolemen Favour", department: "FOL" },
    { name: "Obebe Oluwarantimi Emmanuel", department: "ENL" },
    { name: "Agbotaen God'stime", department: "THR" },
    { name: "Abiodun Bright", department: "THR" },
    { name: "Ogburie Shedrack Chisom", department: "HIS" },
    { name: "Samuel", department: "HIS" },
    { name: "Izogie Etinosa", department: "ISD" },
  ],

  "Most Creative FASA": [
    { name: "Michael Kayode Emehinola", department: "ENL" },
    { name: "Osarobo Kelvin Osazee", department: "THR" },
    { name: "Joel Tongo", department: "THR" },
    { name: "Ruth Ugbaka", department: "Philosophy" },
    { name: "King of Uniben", department: "Philosophy" },
    { name: "Prosperous Sax", department: "Music Department" },
    { name: "Emmi Sax", department: "Music Department" },
    { name: "Moses Bassey Emmanuel", department: "ISD" },
  ],
};

async function seedCandidatesForCategory(categoryName, nominees) {
  const category = await Category.findOne({ name: categoryName }).collation({
    locale: "en",
    strength: 2,
  });

  if (!category) {
    console.log(`  ⚠ Skipped "${categoryName}" — no matching category found.`);
    return { created: 0, skipped: 0, missing: true };
  }

  const event = await Event.findOne({ categoryId: category._id });
  if (!event) {
    console.log(
      `  ⚠ Skipped "${categoryName}" — category exists but has no event.`,
    );
    return { created: 0, skipped: 0, missing: true };
  }

  // Existing names under this event — case-insensitive, trimmed — so
  // rerunning with more pasted batches never creates duplicates.
  const existing = await Candidate.find({ event: event._id }, "name");
  const existingNames = new Set(
    existing.map((c) => c.name.trim().toLowerCase()),
  );

  // Highest candidateNumber already used under this event, so new
  // candidates continue the sequence instead of colliding with the
  // schema's unique { event, candidateNumber } index on a rerun.
  const lastCandidate = await Candidate.findOne({ event: event._id })
    .sort({ candidateNumber: -1 })
    .select("candidateNumber");
  let nextNumber = (lastCandidate?.candidateNumber || 0) + 1;

  let created = 0,
    skipped = 0;

  for (const nominee of nominees) {
    const key = nominee.name.trim().toLowerCase();
    if (existingNames.has(key)) {
      skipped++;
      continue;
    }

    await Candidate.create({
      name: nominee.name.trim(),
      department: nominee.department?.trim() || "",
      level: "", // not sent yet — to be added manually later
      photo: "", // not sent yet — to be added manually later
      candidateNumber: nextNumber,
      // candidateCode intentionally omitted — the model's pre("save")
      // hook auto-generates "FASA-XXXX" from candidateNumber.
      event: event._id,
      totalVotes: 0,
    });

    existingNames.add(key); // guard against exact dupes within the same paste
    nextNumber++;
    created++;
  }

  console.log(
    `  ✓ ${categoryName}: ${created} created, ${skipped} already existed.`,
  );
  return { created, skipped, missing: false };
}

async function seedCandidates() {
  await connectDB();

  console.log("Seeding candidates...\n");

  let totalCreated = 0,
    totalSkipped = 0;
  const missingCategories = [];

  for (const [categoryName, nominees] of Object.entries(
    CANDIDATES_BY_CATEGORY,
  )) {
    const result = await seedCandidatesForCategory(categoryName, nominees);
    totalCreated += result.created;
    totalSkipped += result.skipped;
    if (result.missing) missingCategories.push(categoryName);
  }

  console.log(
    `\nDone — ${totalCreated} candidates created, ${totalSkipped} already existed.`,
  );

  if (missingCategories.length) {
    console.log(
      `\n⚠ These category names didn't match any seeded category/event — check spelling:\n  ${missingCategories.join("\n  ")}`,
    );
  }

  process.exit(0);
}

seedCandidates().catch((err) => {
  console.error("Candidate seed failed:", err);
  process.exit(1);
});
