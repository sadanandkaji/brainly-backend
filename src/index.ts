import express from "express"
import jwt from "jsonwebtoken"
import {string, z} from "zod"
import bcrypt, { hash } from "bcrypt"
import {usermodel,contentmodel, linkmodel} from "./db"
import cors from "cors"

const app=express();

app.use(cors())
app.use(express.json());

import {JWT_SECRET } from "./config"
import { middleware } from "./middleware"
import { random } from "./util"

// @ts-ignore

app.post("/api/v1/signup", async (req, res) => {
  const requiredbody = z.object({
    username: z.string().min(3).max(10),
    password: z
      .string()
      .min(8)
      .max(20)
      .refine(
        (value) =>
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /\d/.test(value) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(value),
        { message: "Password must contain lowercase, uppercase, digit, and special character." }
      ),
  });

  const requireddata = requiredbody.safeParse(req.body);

  if (!requireddata.success) {
    return res.status(400).json({
      message: "Incorrect format",
      errors: requireddata.error.errors,
    });
  }

  const { username, password } = req.body;

  try {
    const hashedpassword = await bcrypt.hash(password, 10);
    await usermodel.create({ username, password: hashedpassword });

    res.status(201).json({ message: "Signed up successfully" });
  } catch (e) {
    // @ts-ignore
    if (e.code === "P2002") { // Example: Handle unique constraint errors (e.g., Prisma)
      res.status(409).json({ message: "User already exists" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});


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
     console.log(token)
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
app.post("/api/v1/brain/share",middleware,async (req,res)=>{
  const share=req.body.share;
  if(share){
    await  linkmodel.create({
      //@ts-ignore
     userid: req.userid,
     //@ts-ignore
  hash: random(10),
    })
  }else{
   await linkmodel.deleteOne({
      //@ts-ignore
      userid:req.userid
    })
  }

  res.json({
    message:hash
  })

})

app.get("/api/v1/brain/:sharelink",async (req,res)=>{
  const hashed=req.params.sharelink
  const linku=await linkmodel.findOne({
    hash: hashed
  })
  

  if(!linku){
    res.status(404).json({
      message:"wrong link"
    })
       return;
  }

  
  const user= await usermodel.findOne({
    //@ts-ignore
    _id:linku.userid
  })
  if(!user){
    res.json({
      message:"qwe"
    })
  }
  
  const content= await contentmodel.findOne({
    //@ts-ignore
      userid:linku.userid
  })
  if(!content){
    res.json({
      message:"content not found"
    })
    return;
  }
  
  res.json({
    //@ts-ignore
    username:user.username,
    content:content
  })
  
})


app.listen(4000);