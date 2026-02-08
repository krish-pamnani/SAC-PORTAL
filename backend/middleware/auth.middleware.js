import authService from '../services/auth.service.js';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user is a student
 */
export const isStudent = (req, res, next) => {
  if (req.user.userType !== 'student') {
    return res.status(403).json({ error: 'Access denied. Students only.' });
  }
  next();
};

/**
 * Middleware to check if user is an entity
 */
export const isEntity = (req, res, next) => {
  if (req.user.userType !== 'entity') {
    return res.status(403).json({ error: 'Access denied. Entities only.' });
  }
  next();
};

/**
 * Middleware to check if user is treasury
 */
export const isTreasury = (req, res, next) => {
  if (req.user.userType !== 'treasury') {
    return res.status(403).json({ error: 'Access denied. Treasury only.' });
  }
  next();
};

/**
 * Middleware to check if user is either entity or treasury
 */
export const isEntityOrTreasury = (req, res, next) => {
  if (req.user.userType !== 'entity' && req.user.userType !== 'treasury') {
    return res.status(403).json({ error: 'Access denied.' });
  }
  next();
};
