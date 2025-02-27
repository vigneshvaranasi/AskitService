import { Schema, model, Types } from "mongoose"

export const ReplySchema = new Schema({
    repliedTo: {
        type: Types.ObjectId,
        required: true,
        refPath: 'repliedToModel'
    },
    repliedToModel: {
        type: String,
        required: true,
        enum: ['Ask', 'Reply']
    },
    userRef: {
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    },
    reply: {
        type: String,
        required: true
    },
    timeSpamp: {
        type: Date,
        default: Date.now
    }
})
export const replyModel = model('Reply',ReplySchema)