import express from 'express';
import { getUsers, getUser, updateUser, deleteUser, updateUserRole } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.route('/')
  .get(authorize('ADMIN'), getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('ADMIN'), deleteUser);

router.put('/:id/role', authorize('ADMIN'), updateUserRole);

export default router;
