import express from 'express';
import { 
  getLeads, 
  getLead, 
  createLead, 
  updateLead, 
  deleteLead,
  updateLeadScore,
  updateLeadStatus,
  convertLeadToCustomer
} from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('ADMIN'), deleteLead);

router.put('/:id/score', updateLeadScore);
router.put('/:id/status', updateLeadStatus);
router.post('/:id/convert', convertLeadToCustomer);

export default router;
