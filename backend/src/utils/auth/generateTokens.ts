import jwt from 'jsonwebtoken';


const generateAccessToken= (userId: string) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '15m',
  });
}
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: '7d',
  });
}
export { generateAccessToken, generateRefreshToken };