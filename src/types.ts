import { ObjectId } from 'mongoose';
import { WebSocket } from 'ws';
type attendeesType = {
    id:ObjectId,
    socket:WebSocket,
    emoji:string
}

type speakerType = {
    id: ObjectId,
    socket: WebSocket
}

type replyType = {
    repliedTo:ObjectId,
    repliedToModel:string,
    userRef:ObjectId,
    reply:string,
    timestamp:Date
}

type asksType = {
    question:string,
    userId:ObjectId,
    timestamp:Date,
    replies:ObjectId[],
    room:ObjectId,
    answered:boolean
}

type roomType = {
    joinCode: string,
    title: string,
    speaker: speakerType,
    attendees: attendeesType[],
    asks: asksType[]
}

type createRoomType = {
    ws: WebSocket,
    name: string,
    id:ObjectId,
    rooms: roomType[]
}

type Message = {
    type: 'create'|'join'|'leave'| 'ask',
    payload : {
        joinCode : string,
        title: string,
    }
}

export { attendeesType, replyType, asksType, roomType, createRoomType }