export const AWARD_CATEGORIES = [
  { id: 1, name: "Most Handsome FASA", group: "Popularity", emoji: "😎" },
  { id: 2, name: "Most Beautiful FASA", group: "Popularity", emoji: "💃" },
  { id: 3, name: "Most Popular FASA (Male)", group: "Popularity", emoji: "⭐" },
  {
    id: 4,
    name: "Most Popular FASA (Female)",
    group: "Popularity",
    emoji: "⭐",
  },
  { id: 5, name: "Most Social Male", group: "Social", emoji: "🤝" },
  { id: 6, name: "Most Social Female", group: "Social", emoji: "🤝" },
  {
    id: 7,
    name: "Most Influential FASA (Male)",
    group: "Leadership",
    emoji: "👑",
  },
  {
    id: 8,
    name: "Most Influential FASA (Female)",
    group: "Leadership",
    emoji: "👑",
  },
  {
    id: 9,
    name: "Fashion Icon of the Year (Male)",
    group: "Fashion",
    emoji: "👔",
  },
  {
    id: 10,
    name: "Fashion Icon of the Year (Female)",
    group: "Fashion",
    emoji: "👗",
  },
  { id: 11, name: "Clique of the Year", group: "Social", emoji: "👯" },
  { id: 12, name: "Most Creative FASA", group: "Creative", emoji: "🎨" },
  { id: 13, name: "Most Talented FASA", group: "Creative", emoji: "🎵" },
  {
    id: 14,
    name: "Content Creator of the Year",
    group: "Creative",
    emoji: "🎥",
  },
  { id: 15, name: "Artist of the Year", group: "Creative", emoji: "🎤" },
  { id: 16, name: "Brand of the Year", group: "Business", emoji: "🏅" },
  { id: 17, name: "Entrepreneur of the Year", group: "Business", emoji: "⚡" },
  {
    id: 18,
    name: "Course Representative of the Year",
    group: "Leadership",
    emoji: "📚",
  },
  { id: 19, name: "Senator of the Year", group: "Leadership", emoji: "🏛️" },
  {
    id: 20,
    name: "Parliamentarian of the Year",
    group: "Leadership",
    emoji: "⚖️",
  },
  {
    id: 21,
    name: "Departmental President of the Year",
    group: "Leadership",
    emoji: "🏛️",
  },
  { id: 22, name: "Executive of the Year", group: "Business", emoji: "💼" },
  {
    id: 23,
    name: "Political Personality of the Year (Male)",
    group: "Leadership",
    emoji: "🏳️",
  },
  {
    id: 24,
    name: "Political Personality of the Year (Female)",
    group: "Leadership",
    emoji: "🏳️",
  },
  {
    id: 25,
    name: "Academic Excellence Award (Male)",
    group: "Academic",
    emoji: "📖",
  },
  {
    id: 26,
    name: "Academic Excellence Award (Female)",
    group: "Academic",
    emoji: "📖",
  },
  { id: 27, name: "Sportsman of the Year", group: "Sports", emoji: "🏆" },
  { id: 28, name: "Sportswoman of the Year", group: "Sports", emoji: "🏆" },
  { id: 29, name: "Most Active Fresher", group: "General", emoji: "✨" },
  { id: 30, name: "Department of the Year", group: "General", emoji: "🏢" },
];

export const CATEGORY_GROUPS = [
  ...new Set(AWARD_CATEGORIES.map((c) => c.group)),
];
export const getCategoryById = (id) =>
  AWARD_CATEGORIES.find((c) => c.id === id);
export const getCategoryByName = (name) =>
  AWARD_CATEGORIES.find((c) => c.name === name);
