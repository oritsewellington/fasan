import path from "path";
import Candidate from "../models/Candidate.model.js";
import Event from "../models/Event.model.js";
import {
  buildUrl,
  deleteFile,
  resizeAndConvert,
} from "../middleware/upload.middleware.js";

// GET /api/events/:eventId/candidates
export async function getCandidates(req, res) {
  const candidates = await Candidate.find({ event: req.params.eventId }).sort(
    "candidateNumber",
  );
  res.json(candidates);
}

// GET /api/events/:eventId/candidates/:candidateId
export async function getCandidate(req, res) {
  const candidate = await Candidate.findOne({
    _id: req.params.candidateId,
    event: req.params.eventId,
  });
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found." });
  res.json(candidate);
}

// POST /api/events/:eventId/candidates  (any admin or staff)
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
    photoFilename = "";
  if (req.file) {
    const inputPath = req.file.path;
    const outputName = req.file.filename.replace(/\.[^.]+$/, ".webp");
    const outputPath = path.join(path.dirname(inputPath), outputName);
    await resizeAndConvert(inputPath, outputPath, 600, 750, "cover");
    photo = buildUrl(req, "candidates", outputName);
    photoFilename = outputName;
  }

  const candidate = await Candidate.create({
    name: name.trim(),
    bio: bio?.trim() || "",
    department: department?.trim() || "",
    level: level?.trim() || "",
    photo,
    photoFilename,
    candidateNumber: num,
    candidateCode: "FASA-" + String(num).padStart(4, "0"),
    event: event._id,
  });

  res.status(201).json(candidate);
}

// PUT /api/events/:eventId/candidates/:candidateId  (any admin or staff)
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
    if (candidate.photoFilename) deleteFile(candidate.photo);
    const inputPath = req.file.path;
    const outputName = req.file.filename.replace(/\.[^.]+$/, ".webp");
    const outputPath = path.join(path.dirname(inputPath), outputName);
    await resizeAndConvert(inputPath, outputPath, 600, 750, "cover");
    candidate.photo = buildUrl(req, "candidates", outputName);
    candidate.photoFilename = outputName;
  }

  await candidate.save();
  res.json(candidate);
}

// DELETE /api/events/:eventId/candidates/:candidateId  (any admin or staff)
export async function deleteCandidate(req, res) {
  const candidate = await Candidate.findOne({
    _id: req.params.candidateId,
    event: req.params.eventId,
  });
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found." });

  deleteFile(candidate.photo);
  await candidate.deleteOne();
  res.json({ message: "Candidate removed." });
}
