import express from 'express';
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  updateOrderStatus,
  getOrderTimeline,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder)
  .put(updateOrder);

router.put('/:id/status', updateOrderStatus);
router.get('/:id/timeline', getOrderTimeline);

export default router;
