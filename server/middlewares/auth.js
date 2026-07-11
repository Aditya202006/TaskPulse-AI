import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Express middleware to guard routes.
 * Authenticates requests using Clerk JWT or local mock session JWTs.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const isMockToken = token === 'mock-google-token' || token.startsWith('mock-');
    const hasSecretKey = !!process.env.CLERK_SECRET_KEY;

    // 1. Bypass database lookup/Clerk lookup if MongoDB is offline or Clerk keys are missing or mock token is present
    if (!isDbConnected || isMockToken || !hasSecretKey) {
      console.log('[Auth Middleware] Bypassing Clerk/DB validation (Mock Dev Mode or Database offline).');
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        id: '507f1f77bcf86cd799439011',
        email: 'demo.user@taskpulse.ai',
        name: 'Demo User'
      };
      return next();
    }

    // 2. Validate token (try local JWT first for local mock session redirects)
    try {
      try {
        const decodedLocal = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
        if (decodedLocal && decodedLocal.id) {
          const user = await User.findById(decodedLocal.id).select('-googleId');
          if (user) {
            req.user = user;
            return next();
          }
        }
      } catch (jwtErr) {
        // Not a local signed JWT, proceed to verify through Clerk
      }

      // Verify token via Clerk SDK
      console.log('[Auth Middleware] Verifying token with Clerk...');
      const decodedClerk = await clerkClient.verifyToken(token, {
        clockSkewInMs: 60000 // 60 seconds tolerance for client-server clock skew
      });
      const clerkUserId = decodedClerk.sub;

      // Fetch user profile from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Clerk User';
      const picture = clerkUser.imageUrl;

      // Sync Clerk profile to Mongoose Database
      let user = await User.findOne({ googleId: clerkUserId });
      if (!user) {
        // Fallback search by email
        user = await User.findOne({ email });
        if (user) {
          user.googleId = clerkUserId;
          if (picture) user.picture = picture;
          await user.save();
        } else {
          // Register Clerk user in local DB
          user = await User.create({
            googleId: clerkUserId,
            email,
            name,
            picture
          });
          console.log(`[Auth Middleware] Registered new Clerk user: ${email}`);
        }
      }

      req.user = user;
      next();
    } catch (clerkErr) {
      console.error('[Auth Middleware] Clerk token verification failed:', clerkErr.message);
      res.status(401).json({ message: 'Not authorized, Clerk token invalid' });
    }
  } catch (error) {
    console.error('[Auth Middleware] Authentication exception:', error.message);
    res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};
export default protect;
