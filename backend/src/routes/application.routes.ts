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

// CRUD routes
router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

// AI parse route — must be before /:id to avoid conflict
router.post('/parse', parseApplication);

export default router;
