import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
}

const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "1m",
  });
};
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
};
export { generateAccessToken, generateRefreshToken };
