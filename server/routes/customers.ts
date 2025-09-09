import express from 'express';
import { 
  getCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerProjects,
  getCustomerActivities 
} from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize('ADMIN'), deleteCustomer);

router.get('/:id/projects', getCustomerProjects);
router.get('/:id/activities', getCustomerActivities);

export default router;
