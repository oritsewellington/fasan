import path from "path";
import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";
import User from "../models/User.model.js";
import Category from "../models/Category.model.js";
import {
  buildUrl,
  deleteFile,
  resizeAndConvert,
} from "../middleware/upload.middleware.js";

// GET /api/events
export async function getEvents(req, res) {
  const filter = {};
  if (req.query.mine === "true" && req.user?.role === "organizer") {
    filter.organizer = req.user._id;
  }
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;

  const events = await Event.find(filter)
    .sort("-createdAt")
    .populate("organizer", "name email platformCommission");
  res.json(events);
}

// GET /api/events/:id
export async function getEvent(req, res) {
  const event = await Event.findById(req.params.id).populate(
    "organizer",
    "name email platformCommission",
  );
  if (!event) return res.status(404).json({ message: "Event not found." });
  res.json(event);
}

// POST /api/events  (admin OR organizer, multipart/form-data)
export async function createEvent(req, res) {
  const {
    title,
    description,
    organization,
    startDate,
    endDate,
    pricePerVote,
    categoryId,
  } = req.body;

  // Organizers can only create events for themselves — ignore any organizerId they send
  let organizerId = req.body.organizerId;
  if (req.user.role === "organizer") {
    organizerId = req.user._id.toString();
  }

  if (
    !title ||
    !organization ||
    !startDate ||
    !endDate ||
    !pricePerVote ||
    !organizerId
  )
    return res.status(400).json({
      message:
        "title, organization, startDate, endDate, pricePerVote, organizerId are required.",
    });

  const organizer = await User.findById(organizerId);
  if (!organizer)
    return res.status(404).json({ message: "Organizer not found." });

  let category = null;
  if (categoryId) {
    category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found." });
  }

  let bannerImage = "",
    bannerFilename = "";
  if (req.file) {
    const inputPath = req.file.path;
    const outputName = req.file.filename.replace(/\.[^.]+$/, ".webp");
    const outputPath = path.join(path.dirname(inputPath), outputName);
    await resizeAndConvert(inputPath, outputPath, 1200, 630, "cover");
    bannerImage = buildUrl(req, "banners", outputName);
    bannerFilename = outputName;
  }

  const event = await Event.create({
    title,
    description,
    organization,
    startDate,
    endDate,
    pricePerVote: parseInt(pricePerVote),
    platformCommission: organizer.platformCommission,
    organizer: organizer._id,
    organizerId: organizer._id,
    bannerImage,
    bannerFilename,
    category: category?.name || "",
    categoryId: category?._id || null,
  });

  await User.findByIdAndUpdate(organizer._id, { $inc: { totalEvents: 1 } });
  res.status(201).json(event);
}

// PUT /api/events/:id  (admin OR the event's owning organizer)
export async function updateEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });

  if (req.user.role === "organizer") {
    const ownerId = (event.organizer || event.organizerId)?.toString();
    if (ownerId !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You can only edit your own events." });
  }

  const fields = [
    "title",
    "description",
    "organization",
    "startDate",
    "endDate",
  ];
  fields.forEach((k) => {
    if (req.body[k] !== undefined) event[k] = req.body[k];
  });
  if (req.body.pricePerVote)
    event.pricePerVote = parseInt(req.body.pricePerVote);

  if (req.body.categoryId !== undefined) {
    if (req.body.categoryId) {
      const category = await Category.findById(req.body.categoryId);
      if (!category)
        return res.status(404).json({ message: "Category not found." });
      event.categoryId = category._id;
      event.category = category.name;
    } else {
      event.categoryId = null;
      event.category = "";
    }
  }

  if (req.file) {
    if (event.bannerFilename) deleteFile(event.bannerImage);
    const inputPath = req.file.path;
    const outputName = req.file.filename.replace(/\.[^.]+$/, ".webp");
    const outputPath = path.join(path.dirname(inputPath), outputName);
    await resizeAndConvert(inputPath, outputPath, 1200, 630, "cover");
    event.bannerImage = buildUrl(req, "banners", outputName);
    event.bannerFilename = outputName;
  }

  await event.save();
  res.json(event);
}

// DELETE /api/events/:id  (admin OR the event's owning organizer)
export async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });

  if (req.user.role === "organizer") {
    const ownerId = (event.organizer || event.organizerId)?.toString();
    if (ownerId !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You can only delete your own events." });
  }

  deleteFile(event.bannerImage);
  await Candidate.deleteMany({ event: event._id });
  await event.deleteOne();
  res.json({ message: "Event deleted." });
}

// PATCH /api/events/:id/toggle  (admin OR the event's owning organizer)
export async function toggleEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });

  if (req.user.role === "organizer") {
    const ownerId = (event.organizer || event.organizerId)?.toString();
    if (ownerId !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "You can only toggle your own events." });
  }

  event.isOpen = !event.isOpen;
  await event.save();
  res.json(event);
}
