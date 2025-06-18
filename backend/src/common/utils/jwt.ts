import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '600m'; // 10 hour
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export const generateAccessToken = (users_id: string, status_role: string) => {
    return jwt.sign({ users_id, status_role }, process.env.JWT_SECRET!, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};

export const generateRefreshToken = (users_id: string) => {
    return jwt.sign({ users_id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            //console.log('Token has expired');
            return { expired: true };
        }
        //console.log('Token verification failed:', error);
        return null;
    }
};