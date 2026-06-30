import { Router } from 'express';
import { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate } from '../controllers/candidate.controller.js';
import { protect, requireOrganizer } from '../middleware/auth.middleware.js';
import { uploadCandidate }            from '../middleware/upload.middleware.js';

const router = Router({ mergeParams: true });

// Public - anyone can view candidates
router.get('/:eventId/candidates',              getCandidates);
router.get('/:eventId/candidates/:candidateId', getCandidate);

// Protected - admin OR organizer (controller checks event ownership for organizers)
router.post('/:eventId/candidates',                protect, requireOrganizer, uploadCandidate.single('photo'), createCandidate);
router.put('/:eventId/candidates/:candidateId',    protect, requireOrganizer, uploadCandidate.single('photo'), updateCandidate);
router.delete('/:eventId/candidates/:candidateId', protect, requireOrganizer, deleteCandidate);

export default router;
