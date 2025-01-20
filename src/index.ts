import express from "express"
import jwt from "jsonwebtoken"
import {string, z} from "zod"
import bcrypt from "bcrypt"
import {usermodel,contentmodel} from "./db"


const app=express();
app.use(express.json());
import {JWT_SECRET } from "./config"
import { middleware } from "./middleware"



app.post("/api/v1/signup", async (req,res)=>{
 const requiredbody=z.object({
    username:z.string().min(3).max(10),
    password:z.string().min(8).max(20)
    .refine((value)=> /[a-z]/.test(value) &&
   /[A-Z]/.test(value) && /\d/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value))
 })

 const requireddata=requiredbody.safeParse(req.body)

 if(!requireddata.success){
  res.status(400).json({
    message:"incorrct format",
    error:requireddata.error.errors
    
  })
}
 
const  {username,password}=req.body

let errorthrown=false
try{
  const hashedpassword=await bcrypt.hash(password,2)

  await usermodel.create({
    username:username,
    password:hashedpassword
  })
}catch(e){
  res.json({
    message:"user already exits"
  })
  errorthrown=true;
}

if (!errorthrown){
  res.status(200).json({
    message:"signed up successfully"
  })
}

}

)

app.post("/api/v1/signin", async (req,res)=>{

const username=req.body.username;
const password=req.body.password;
 
   
  const users=await usermodel.findOne({
    username
  
  });

  if(!users){
    res.status(403).json({
      message:"user not found"
    })
  }
  // @ts-ignore
  const passwordmatch= await bcrypt.compare(password,users.password);

  if(passwordmatch){
     const token=jwt.sign({
      // @ts-ignore
          id:users._id.toString()
          //@ts-ignore
     },JWT_SECRET);
     res.json({
       token:token
      })
    }else{
      res.json({
        message:"passsword incorrect"
      })
    }

})

app.post("/api/v1/content",middleware,async (req,res)=>{

  const type=req.body.type;
  const link=req.body.link;
  await contentmodel.create({
       type,
       link,
       // @ts-ignore
       userid:req.userid,
       tag:[]
  })

  res.json({
    message:"content added"
  })


})


app.get("/api/v1/content",middleware, async (req,res)=>{
  // @ts-ignore 
  const userid=req.userid;
  const content= await contentmodel.find({
    userid:userid
  }).populate("userid" ,"username")

  res.json({
    content:content
  })


})
app.delete("/api/v1/content", middleware,async (req,res)=>{
  const contentid=req.body.contentid;
   await contentmodel.deleteMany({
    contentid:contentid,
    // @ts-ignore
    userid :req.userid
  })
  res.json({
    message:contentid
  })


})
app.post("/api/v1/brain/share",middleware,(req,res)=>{
  

})

app.post("/api/v1/brain/:sharelink",(req,res)=>{



})

app.listen(3000);