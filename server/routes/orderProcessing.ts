import express from 'express';
import { 
  initializeProjectFromOrder, 
  getProjectTimeline, 
  updateProjectProgress, 
  getProjectBudgetStatus 
} from '../controllers/orderProcessingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Order processing routes
router.post('/:id/initialize-project', authenticate, initializeProjectFromOrder);

// Project management routes
router.get('/projects/:id/timeline', authenticate, getProjectTimeline);
router.post('/projects/:id/progress-update', authenticate, updateProjectProgress);
router.get('/projects/:id/budget-status', authenticate, getProjectBudgetStatus);

export default router;
