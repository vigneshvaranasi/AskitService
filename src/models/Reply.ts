import { Schema, model, Types } from 'mongoose'

export const ReplySchema = new Schema({
  repliedTo: {
    type: Types.ObjectId,
    required: true,
    ref: 'Ask'
  },
  user: {
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
export const replyModel = model('Reply', ReplySchema)
