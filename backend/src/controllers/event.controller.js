import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";
import Category from "../models/Category.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/upload.middleware.js";

export async function getEvents(req, res) {
  try {
    const filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;

    const events = await Event.find(filter)
      .sort("-createdAt")
      .populate("createdBy", "name email");
    res.json(events);
  } catch (error) {
    console.error("Error in getEvents:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );
    if (!event) return res.status(404).json({ message: "Event not found." });
    res.json(event);
  } catch (error) {
    console.error("Error in getEvent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function createEvent(req, res) {
  try {
    const {
      title,
      description,
      organization,
      startDate,
      endDate,
      pricePerVote,
      categoryId,
    } = req.body;

    if (!title || !organization || !startDate || !endDate || !pricePerVote)
      return res.status(400).json({
        message:
          "title, organization, startDate, endDate, pricePerVote are required.",
      });

    let category = null;
    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category)
        return res.status(404).json({ message: "Category not found." });
    }

    let bannerImage = "",
      bannerPublicId = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "fasa/banners",
        width: 1200,
        height: 630,
      });
      bannerImage = result.url;
      bannerPublicId = result.publicId;
    }

    const event = await Event.create({
      title,
      description,
      organization,
      startDate,
      endDate,
      pricePerVote: parseInt(pricePerVote),
      bannerImage,
      bannerPublicId,
      category: category?.name || "",
      categoryId: category?._id || null,
      createdBy: req.user._id,
    });

    await req.user.updateOne({ $inc: { totalEventsCreated: 1 } });
    res.status(201).json(event);
  } catch (error) {
    console.error("Error in createEvent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function updateEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

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
      if (event.bannerPublicId)
        await deleteFromCloudinary(event.bannerPublicId);

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "fasa/banners",
        width: 1200,
        height: 630,
      });
      event.bannerImage = result.url;
      event.bannerPublicId = result.publicId;
    }

    await event.save();
    res.json(event);
  } catch (error) {
    console.error("Error in updateEvent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    if (event.bannerPublicId) {
      await deleteFromCloudinary(event.bannerPublicId);
    }
    await Candidate.deleteMany({ event: event._id });
    await event.deleteOne();
    res.json({ message: "Event deleted." });
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function toggleEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    event.isOpen = !event.isOpen;
    await event.save();
    res.json(event);
  } catch (error) {
    console.error("Error in toggleEvent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
