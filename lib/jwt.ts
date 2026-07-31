import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-jwt-refresh-key";

export const signAccessToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const signRefreshToken = (payload: any) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
