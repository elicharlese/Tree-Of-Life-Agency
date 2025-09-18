import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  deleteUser,
  bulkUserActions,
  getUserActivity,
  getUserStats
} from '../controllers/userManagementController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';

const router = express.Router();

// User management routes (admin only)
router.get('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), getUsers);
router.get('/stats', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), getUserStats);
router.post('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), createUser);
router.post('/bulk-actions', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), bulkUserActions);

// Individual user routes
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'DEVELOPER']), deleteUser);
router.get('/:id/activity', authenticateToken, getUserActivity);

// Profile management (self)
router.put('/profile/me', authenticateToken, updateProfile);

export default router;
