import jwt from 'jsonwebtoken';
import { userModel } from '../models/User';
type decoded = {
    _id:string;
    email:string;
}

export async function authenticateUser(token:string) {
    try{
        if(!token) throw new Error("No Token provided");
        const secret = process.env.JWT_SECRET;
        const decodedUser = jwt.verify(token, secret as string) as decoded;

        const user = await userModel.findById(decodedUser._id);
        if(!user) throw new Error("User not found");
        return user;
    }catch(err: any){
        console.log("Authentication Failed: ", err.message);
        return null;
    }
}