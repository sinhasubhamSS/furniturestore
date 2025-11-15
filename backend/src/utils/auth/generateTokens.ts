// utils/auth/generateTokens.ts
import jwt from "jsonwebtoken";

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

// Ensure secrets exist at runtime
if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("Missing ACCESS_TOKEN_SECRET env variable");
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("Missing REFRESH_TOKEN_SECRET env variable");
}

// Cast secrets to jwt.Secret (this helps TS pick correct overload)
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as unknown as jwt.Secret;
const REFRESH_SECRET = process.env
  .REFRESH_TOKEN_SECRET as unknown as jwt.Secret;

export const generateAccessToken = (userId: string) => {
  // Build options and cast to SignOptions to avoid overload confusion
  const opts = { expiresIn: ACCESS_TTL } as unknown as jwt.SignOptions;
  return jwt.sign({ userId }, ACCESS_SECRET, opts);
};

export const generateRefreshToken = (userId: string) => {
  const opts = { expiresIn: REFRESH_TTL } as unknown as jwt.SignOptions;
  return jwt.sign({ userId }, REFRESH_SECRET, opts);
};
