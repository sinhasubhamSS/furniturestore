import { Response } from "express";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";
import { setAuthCookies } from "./cookieHelper";

export const sendTokenResponse=(res:Response,userId:string,message:string,
    userData:{
        _id: string;
        name: string;
        email: string;
        avatar?: string;            
    }
)=>{
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
        message,
        user: {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar || "",
        },
    });
}