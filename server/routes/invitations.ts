import express from 'express';
import {
  sendInvitation,
  getInvitations,
  getInvitationByToken,
  acceptInvitation,
  resendInvitation,
  revokeInvitation,
  getInvitationStats
} from '../controllers/invitationController';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireFeature } from '../middleware/permissions';
import { rateLimitGeneral, rateLimitAuth } from '../middleware/rateLimiter';

const router = express.Router();

// Public routes
router.get('/token/:token', getInvitationByToken);
router.post('/accept', rateLimitAuth, acceptInvitation);

// Protected admin routes
router.use(authenticate); // All routes below require authentication

router.post('/', 
  requireAdmin, 
  requireFeature('invitation_management'),
  rateLimitAuth,
  sendInvitation
);

router.get('/', 
  requireAdmin,
  requireFeature('invitation_management'),
  getInvitations
);

router.get('/stats', 
  requireAdmin,
  requireFeature('invitation_management'),
  getInvitationStats
);

router.post('/:id/resend', 
  requireAdmin,
  requireFeature('invitation_management'),
  rateLimitAuth,
  resendInvitation
);

router.delete('/:id/revoke', 
  requireAdmin,
  requireFeature('invitation_management'),
  revokeInvitation
);

export default router;
