import { Router } from 'express';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  parseApplication,
} from '../controllers/application.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes protected by JWT middleware
router.use(protect);

// AI parse route — MUST be before /:id routes to avoid Express matching
// the string "parse" as a MongoDB ObjectId parameter
router.post('/parse', parseApplication);

// CRUD routes
router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
