import Candidate from "../models/Candidate.model.js";
import Event from "../models/Event.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/upload.middleware.js";

export async function getCandidates(req, res) {
  const candidates = await Candidate.find({ event: req.params.eventId }).sort(
    "candidateNumber",
  );
  res.json(candidates);
}

export async function getCandidate(req, res) {
  const candidate = await Candidate.findOne({
    _id: req.params.candidateId,
    event: req.params.eventId,
  });
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found." });
  res.json(candidate);
}

export async function createCandidate(req, res) {
  const { name, bio, department, level } = req.body;
  if (!name?.trim())
    return res.status(400).json({ message: "Candidate name is required." });

  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ message: "Event not found." });

  const lastCandidate = await Candidate.findOne({ event: event._id }).sort(
    "-candidateNumber",
  );
  const num = lastCandidate ? lastCandidate.candidateNumber + 1 : 1;

  let photo = "",
    photoPublicId = "";
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "fasa/candidates",
      width: 600,
      height: 750,
    });
    photo = result.url;
    photoPublicId = result.publicId;
  }

  const candidate = await Candidate.create({
    name: name.trim(),
    bio: bio?.trim() || "",
    department: department?.trim() || "",
    level: level?.trim() || "",
    photo,
    photoPublicId,
    candidateNumber: num,
    candidateCode: "FASA-" + String(num).padStart(4, "0"),
    event: event._id,
  });

  res.status(201).json(candidate);
}

export async function updateCandidate(req, res) {
  const candidate = await Candidate.findOne({
    _id: req.params.candidateId,
    event: req.params.eventId,
  });
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found." });

  if (req.body.name) candidate.name = req.body.name.trim();
  if (req.body.bio !== undefined) candidate.bio = req.body.bio.trim();
  if (req.body.department) candidate.department = req.body.department.trim();
  if (req.body.level) candidate.level = req.body.level.trim();

  if (req.file) {
    // delete old image first (best-effort, don't block on failure)
    if (candidate.photoPublicId)
      await deleteFromCloudinary(candidate.photoPublicId);

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "fasa/candidates",
      width: 600,
      height: 750,
    });
    candidate.photo = result.url;
    candidate.photoPublicId = result.publicId;
  }

  await candidate.save();
  res.json(candidate);
}

export async function deleteCandidate(req, res) {
  const candidate = await Candidate.findOne({
    _id: req.params.candidateId,
    event: req.params.eventId,
  });
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found." });

  await deleteFromCloudinary(candidate.photoPublicId);
  await candidate.deleteOne();
  res.json({ message: "Candidate removed." });
}
