import { Request,Response,NextFunction} from "express"
import jwt from "jsonwebtoken"
import {JWT_SECRET} from "./config"




export function middleware(req:Request,res:Response,next:NextFunction){
    const token=req.headers["authorization"];
    //@ts-ignore
    const decode=jwt.verify(token as string,JWT_SECRET);

    if(decode){
        // @ts-ignore
        req.userid=decode.id
        next();
    }else{
        res.status(403).json({
            message:"you have not logged in"
        })
    }
    

}                   


