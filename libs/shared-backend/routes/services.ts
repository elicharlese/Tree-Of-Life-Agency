import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getAgentServices
} from '../controllers/serviceController';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected routes (Agents only)
router.post('/', authenticate, createService);
router.put('/:id', authenticate, updateService);
router.delete('/:id', authenticate, deleteService);

// Agent-specific routes
router.get('/agent/:agentId', getAgentServices);

export default router;
