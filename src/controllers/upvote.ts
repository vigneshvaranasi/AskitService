import WebSocket from "ws";
import { ROOMS, Ask } from '../types/Base';
import { UpvotePingPayload, WsMessage } from "../types/Messages";
import { Ping } from "../utils/commonUtils";
export async function upvote(socket: WebSocket, joinCode: string, ROOMS: ROOMS, askId: number,upvote:number) {
    if (!ROOMS[joinCode]) {
        socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
        socket.close(1008, 'Room Not Found');
        return;
    }
    const isValidUser = ROOMS[joinCode].attendees.find(attendee => attendee.socket == socket);
    if (!isValidUser) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid user" }));
        socket.close(1008, 'Unauthorized');
        return;
    }
    if(upvote !== 1 && upvote !== -1){
        socket.send(JSON.stringify({ type: "error", message: "Invalid Upvote" }));
        socket.close(1008, 'Invalid Upvote');
        return;
    }
    let currUpVotes = null;
    for (let ask of ROOMS[joinCode].asks) {
        if (ask.id === askId) {
            ask.upvotes += upvote;
            currUpVotes = Number(ask.upvotes);
            break;
        }
    }
    if(currUpVotes === null){
        socket.send(JSON.stringify({ type: "error", message: "Invalid Ask" }));
        return;
    }

    const upvotePing : WsMessage<UpvotePingPayload> = {
        type:"upvotePing",
        payload:{
            id:askId,
            upvote:currUpVotes
        }
    }
    Ping(upvotePing, ROOMS[joinCode]);
}


export default upvote;