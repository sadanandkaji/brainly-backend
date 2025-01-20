import mongoose, {model ,Schema} from "mongoose";
import dotenv from "dotenv"
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


export const usermodel=model("user",userschema)
 export const contentmodel=model("content",contentschema)

