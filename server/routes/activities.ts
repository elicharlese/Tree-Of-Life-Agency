import express from 'express';
import { 
  getActivities, 
  getActivity, 
  createActivity, 
  updateActivity, 
  deleteActivity,
  getEntityActivities
} from '../controllers/activityController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.route('/:id')
  .get(getActivity)
  .put(updateActivity)
  .delete(authorize('ADMIN'), deleteActivity);

router.get('/:entityType/:entityId', getEntityActivities);

export default router;
