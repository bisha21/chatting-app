import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";
import { prisma } from "../prisma/prismaClient";
export const isUserLogin= async(req:Request, res:Response, next:NextFunction) =>{
    const rawToken= req.headers.authorization;
    let token: string | undefined;
    if(rawToken?.startsWith('Bearer'))
    {
         token = rawToken.split(' ')[1];
    }
    else if(req.cookies?.authToken){
        token= req.cookies.authToken

    }
    if(!token)
    {
        res.status(401).json({message:'Unauthorized'})
        return  
    }

    try{
        const decodedToken = jwt.verify(
        token,
        envConfig.JWT_SECRET!
      ) as jwt.JwtPayload & { id: number };

        const userData= await  prisma.user.findUnique({where:{id:decodedToken.id}, select:{id:true,email:true,fullName:true,bio:true,profileImage:true,createdAt:true,updatedAt:true}});
        if(!userData)
        {
            res.status(401).json({message:'Unauthorized'})
            return
        }
        // @ts-ignore
        req.user= {
            id:userData.id,
            email:userData.email,
        }
        next();
    }catch(error){
        res.status(401).json({message:'Unauthorized'})
    }
    
}


