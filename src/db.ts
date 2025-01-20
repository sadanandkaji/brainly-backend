import mongoose, {model ,Schema} from "mongoose";
import dotenv from "dotenv"
import { object } from "zod";
dotenv.config()
//@ts-ignore
mongoose.connect(process.env.MONGO_URL)
const userschema=new Schema({
    username:String,
    password:String
   
})

const contentschema=new Schema({
   type:String,
   linK:String,
   userid:[{type:mongoose.Types.ObjectId,ref:"user"}],
   contentid:{type:mongoose.Types.ObjectId,ref:"content"},
   tag:[{type:mongoose.Types.ObjectId,ref:"tag"}],
})
const linkschema=new Schema({
  hash:String,
  userid:{type:mongoose.Types.ObjectId,ref:"user",require:true,unique:true},
  
})



export const usermodel=model("user",userschema)
 export const contentmodel=model("content",contentschema)
 export const linkmodel=model("share",linkschema)

