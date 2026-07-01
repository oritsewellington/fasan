import dotenv from "dotenv";
import { connectDB } from "../utils/db.js";
import Category from "../models/Category.model.js";
import Event from "../models/Event.model.js";
import User from "../models/User.model.js";

dotenv.config();

// ---------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------
const SEED_USERS = [
  {
    name: "Zondo",
    email: "zondo@gmail.com",
    password: "zondo2031",
    role: "admin",
  },
  {
    name: "Fasan Staff 1",
    email: "fasan1@gmail.com",
    password: "fasan2031",
    role: "staff",
  },
  {
    name: "Fasan Staff 2",
    email: "fasan@gmail.com",
    password: "fasan2031",
    role: "staff",
  },
];

// ---------------------------------------------------------------------
// Event defaults — adjust these to match what you actually want to
// charge / how long voting should run. Voting starts immediately
// (now) and I've defaulted the window to 30 days; change EVENT_DURATION_DAYS
// if that's wrong.
// ---------------------------------------------------------------------
const ORGANIZATION_NAME = "FASA — Faculty of Arts Students' Association";
const PRICE_PER_VOTE_KOBO = 10000; // ₦100 per vote
const EVENT_DURATION_DAYS = 14;

const SEED_CATEGORIES = [
  {
    name: "Most Handsome FASA",
    group: "Popularity",
    emoji: "😎",
    description:
      "Honors the male student whose style, grooming, and overall presence have made him stand out across the faculty this academic year.",
  },
  {
    name: "Most Beautiful FASA",
    group: "Popularity",
    emoji: "💃",
    description:
      "Celebrates the female student recognized by her peers for her elegance, confidence, and standout presence on campus.",
  },
  {
    name: "Most Popular FASA (Male)",
    group: "Popularity",
    emoji: "⭐",
    description:
      "Awarded to the male student with the widest recognition and following across departments, known by name throughout the faculty.",
  },
  {
    name: "Most Popular FASA (Female)",
    group: "Popularity",
    emoji: "⭐",
    description:
      "Awarded to the female student with the widest recognition and following across departments, known by name throughout the faculty.",
  },
  {
    name: "Most Social Male",
    group: "Social",
    emoji: "🤝",
    description:
      "Recognizes the male student whose warmth, approachability, and active presence at events have made him a fixture of campus social life.",
  },
  {
    name: "Most Social Female",
    group: "Social",
    emoji: "🤝",
    description:
      "Recognizes the female student whose warmth, approachability, and active presence at events have made her a fixture of campus social life.",
  },
  {
    name: "Most Influential FASA (Male)",
    group: "Leadership",
    emoji: "👑",
    description:
      "Honors the male student whose opinions, actions, and initiatives have meaningfully shaped conversations and decisions within the faculty.",
  },
  {
    name: "Most Influential FASA (Female)",
    group: "Leadership",
    emoji: "👑",
    description:
      "Honors the female student whose opinions, actions, and initiatives have meaningfully shaped conversations and decisions within the faculty.",
  },
  {
    name: "Fashion Icon of the Year (Male)",
    group: "Fashion",
    emoji: "👔",
    description:
      "Celebrates the male student whose personal style consistently sets trends and inspires others across campus.",
  },
  {
    name: "Fashion Icon of the Year (Female)",
    group: "Fashion",
    emoji: "👗",
    description:
      "Celebrates the female student whose personal style consistently sets trends and inspires others across campus.",
  },
  {
    name: "Clique of the Year",
    group: "Social",
    emoji: "👯",
    description:
      "Recognizes the friend group or squad best known across the faculty for their bond, visibility, and positive presence at events.",
  },
  {
    name: "Most Creative FASA",
    group: "Creative",
    emoji: "🎨",
    description:
      "Awarded to the student whose original ideas and artistic expression have brought fresh creativity to faculty life.",
  },
  {
    name: "Most Talented FASA",
    group: "Creative",
    emoji: "🎵",
    description:
      "Honors the all-round student whose skill in performance, craft, or art form has impressed audiences within and beyond the faculty.",
  },
  {
    name: "Content Creator of the Year",
    group: "Creative",
    emoji: "🎥",
    description:
      "Recognizes the student producing the most engaging and consistent content online, representing the faculty's voice on social media.",
  },
  {
    name: "Artist of the Year",
    group: "Creative",
    emoji: "🎤",
    description:
      "Celebrates the student whose musical or performing talent has earned recognition through live performances or original work.",
  },
  {
    name: "Brand of the Year",
    group: "Business",
    emoji: "🏅",
    description:
      "Honors the student-run brand or business that has shown the strongest growth, quality, and recognition within the academic year.",
  },
  {
    name: "Entrepreneur of the Year",
    group: "Business",
    emoji: "⚡",
    description:
      "Recognizes the student entrepreneur who has demonstrated innovation, resilience, and measurable success in building a venture.",
  },
  {
    name: "Course Representative of the Year",
    group: "Leadership",
    emoji: "📚",
    description:
      "Awarded to the course representative who has gone beyond the call of duty in serving, organizing, and advocating for their classmates.",
  },
  {
    name: "Senator of the Year",
    group: "Leadership",
    emoji: "🏛️",
    description:
      "Honors the student senator whose representation and legislative contributions have had the greatest positive impact on student affairs.",
  },
  {
    name: "Parliamentarian of the Year",
    group: "Leadership",
    emoji: "⚖️",
    description:
      "Recognizes the parliamentarian whose diligence, fairness, and procedural leadership strengthened faculty governance this year.",
  },
  {
    name: "Departmental President of the Year",
    group: "Leadership",
    emoji: "🏛️",
    description:
      "Celebrates the departmental president whose leadership delivered the most impactful initiatives and unity within their department.",
  },
  {
    name: "Executive of the Year",
    group: "Business",
    emoji: "💼",
    description:
      "Honors the student association executive whose management, vision, and execution stood out across the faculty's organizational bodies.",
  },
  {
    name: "Political Personality of the Year (Male)",
    group: "Leadership",
    emoji: "🏳️",
    description:
      "Recognizes the male student whose involvement in campus politics has shown integrity, vision, and measurable impact on student governance.",
  },
  {
    name: "Political Personality of the Year (Female)",
    group: "Leadership",
    emoji: "🏳️",
    description:
      "Recognizes the female student whose involvement in campus politics has shown integrity, vision, and measurable impact on student governance.",
  },
  {
    name: "Academic Excellence Award (Male)",
    group: "Academic",
    emoji: "📖",
    description:
      "Awarded to the male student with an outstanding academic record, recognizing consistent excellence in scholarship and performance.",
  },
  {
    name: "Academic Excellence Award (Female)",
    group: "Academic",
    emoji: "📖",
    description:
      "Awarded to the female student with an outstanding academic record, recognizing consistent excellence in scholarship and performance.",
  },
  {
    name: "Sportsman of the Year",
    group: "Sports",
    emoji: "🏆",
    description:
      "Honors the male student-athlete whose performance, sportsmanship, and dedication brought distinction to the faculty in sporting competitions.",
  },
  {
    name: "Sportswoman of the Year",
    group: "Sports",
    emoji: "🏆",
    description:
      "Honors the female student-athlete whose performance, sportsmanship, and dedication brought distinction to the faculty in sporting competitions.",
  },
  {
    name: "Most Active Fresher",
    group: "General",
    emoji: "✨",
    description:
      "Celebrates the first-year student who has made the strongest early impression through participation, energy, and visibility on campus.",
  },
  {
    name: "Department of the Year",
    group: "General",
    emoji: "🏢",
    description:
      "Recognizes the department that has demonstrated the strongest unity, achievement, and overall excellence across the academic year.",
  },
  {
    name: "Miss FASA",
    group: "Popularity",
    emoji: "👸",
    description:
      "The faculty's top honor for a female student, recognizing the complete package of grace, intelligence, and influence.",
  },
  {
    name: "Mr. FASA",
    group: "Popularity",
    emoji: "🤵",
    description:
      "The faculty's top honor for a male student, recognizing the complete package of character, achievement, and influence.",
  },
];

async function seedUsers() {
  let created = 0,
    skipped = 0;
  const usersByEmail = {};

  for (const u of SEED_USERS) {
    let user = await User.findOne({ email: u.email });
    if (user) {
      skipped++;
    } else {
      // Password gets hashed automatically by the User model's pre-save hook
      user = await User.create({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
      });
      created++;
    }
    usersByEmail[u.email] = user;
  }

  console.log(`Users — ${created} created, ${skipped} already existed.`);
  return usersByEmail;
}

async function seedCategoriesAndEvents(admin) {
  const now = new Date();
  const endDate = new Date(
    now.getTime() + EVENT_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  let catsCreated = 0,
    catsSkipped = 0,
    eventsCreated = 0,
    eventsSkipped = 0;

  for (const cat of SEED_CATEGORIES) {
    let category = await Category.findOne({ name: cat.name }).collation({
      locale: "en",
      strength: 2,
    });

    if (category) {
      catsSkipped++;
      if (!category.description && cat.description) {
        category.description = cat.description;
        await category.save();
      }
    } else {
      category = await Category.create({ ...cat, createdBy: admin?._id });
      catsCreated++;
    }

    // One event per category — carries the category's own name + description
    const existingEvent = await Event.findOne({ categoryId: category._id });
    if (existingEvent) {
      eventsSkipped++;
      continue;
    }

    await Event.create({
      title: category.name,
      description: category.description,
      organization: ORGANIZATION_NAME,
      category: category.name,
      categoryId: category._id,
      startDate: now,
      endDate,
      isOpen: true,
      pricePerVote: PRICE_PER_VOTE_KOBO,
      createdBy: admin?._id,
    });
    eventsCreated++;
  }

  console.log(
    `Categories — ${catsCreated} created, ${catsSkipped} already existed.`,
  );
  console.log(
    `Events — ${eventsCreated} created, ${eventsSkipped} already had an event.`,
  );
}

async function seed() {
  await connectDB();

  const usersByEmail = await seedUsers();
  const admin = usersByEmail["zondo@gmail.com"];

  await seedCategoriesAndEvents(admin);

  console.log("\nLogins:");
  SEED_USERS.forEach((u) =>
    console.log(`  ${u.role.padEnd(6)} — ${u.email} / ${u.password}`),
  );

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
