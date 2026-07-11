import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

/**
 * Handle Google Login ID Token verification and user upsert
 * @route POST /api/auth/google
 */
export const googleLogin = async (req, res, next) => {
  const { credential, isMock } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Credential token is required' });
  }

  try {
    let email, name, picture, googleId;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Decoupled bypass for local developers who haven't set up credentials yet
    if (isMock || !clientId || credential === 'mock-google-token') {
      console.log('[Auth Controller] Authenticating via Mock Dev Mode...');
      googleId = 'mock_google_id_12345';
      email = 'demo.user@taskpulse.ai';
      name = 'Demo User';
      picture = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    } else {
      console.log('[Auth Controller] Verifying Google ID Token...');
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    // Bypass database lookup ONLY if database connection is offline
    if (!isDbConnected) {
      console.log('[Auth Controller] Bypassing MongoDB (Database offline).');
      const mockUserId = '507f1f77bcf86cd799439011'; // Static mock ObjectId
      const token = jwt.sign(
        { id: mockUserId, email },
        process.env.JWT_SECRET || 'fallback_jwt_secret',
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        token,
        user: {
          id: mockUserId,
          email,
          name,
          picture
        }
      });
    }

    // 1. Search by Google ID
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // 2. Search by Email to merge accounts
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (picture) user.picture = picture;
        await user.save();
      } else {
        // 3. Register brand new user
        user = await User.create({
          googleId,
          email,
          name,
          picture
        });
        console.log(`[Auth Controller] Registered new user: ${email}`);
      }
    } else {
      // Sync names/profile photos if updated
      let detailsUpdated = false;
      if (picture && user.picture !== picture) {
        user.picture = picture;
        detailsUpdated = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        detailsUpdated = true;
      }
      if (detailsUpdated) {
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Login failed:', error.message);
    res.status(401).json({ message: `Authentication failed: ${error.message}` });
  }
};
