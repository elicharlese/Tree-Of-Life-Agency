import express from 'express';
import { register, login, logout, forgotPassword, resetPassword, getMe, connectWallet, verifyWalletSignature } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);

export default router;

// ThirdWeb Wallet Authentication
router.post('/connect-wallet', connectWallet);
router.post('/verify-signature', verifyWalletSignature);
