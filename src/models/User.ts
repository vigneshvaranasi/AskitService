import {model, Schema,Types} from "mongoose";

export const UserSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    profileAvatar:{
        type:String,
        default:""
    },
    rooms:[{
        type:Types.ObjectId,
        ref:"Room"
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    lastOnlineAt:{
        type:Date,
        default:Date.now
    }
})

export const userModel = model('User',UserSchema);