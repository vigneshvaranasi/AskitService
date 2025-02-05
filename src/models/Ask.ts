import { Schema, model, Types } from "mongoose";

export const AskSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    userId: {
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    replies:[{
        type: Types.ObjectId,
        ref: 'Reply'
    }],
    room:{
        type:Types.ObjectId,
        ref:'Room'
    },
    answered:{
        type:Boolean,
        default:false
    }
})

export const askModel = model('Ask', AskSchema);