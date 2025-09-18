import express from 'express';
import { 
  login, 
  register, 
  logout, 
  refreshToken, 
  getCurrentUser 
} from '../controllers/authController';
import { 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  validateResetToken 
} from '../controllers/passwordResetController';
import { 
  generateMfaSecret, 
  enableMfa, 
  verifyMfa, 
  disableMfa, 
  getMfaStatus, 
  generateBackupCodes 
} from '../controllers/mfaController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/permissions';

const router = express.Router();

// Basic authentication routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticateToken, getCurrentUser);

// Password management routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticateToken, changePassword);
router.get('/validate-reset-token/:token', validateResetToken);

// MFA routes
router.get('/mfa/status', authenticateToken, getMfaStatus);
router.post('/mfa/generate-secret', authenticateToken, generateMfaSecret);
router.post('/mfa/enable', authenticateToken, enableMfa);
router.post('/mfa/verify', authenticateToken, verifyMfa);
router.post('/mfa/disable', authenticateToken, disableMfa);
router.post('/mfa/backup-codes', authenticateToken, generateBackupCodes);

export default router;
