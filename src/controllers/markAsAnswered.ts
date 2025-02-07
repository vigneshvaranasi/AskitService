import WebSocket from "ws";
import { ROOMS, Ask } from '../types/Base';
import { AnsweredPingPayload, WsMessage} from "../types/Messages";
import { Ping } from "../utils/commonUtils";
export async function markAsAnswered(socket: WebSocket, joinCode: string, ROOMS: ROOMS, askId: number) {
    if (!ROOMS[joinCode]) {
        socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
        socket.close(1008, 'Room Not Found');
        return;
    }
    if (socket!= ROOMS[joinCode].speaker.socket) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid user" }));
        socket.close(1008, 'Unauthorized');
        return;
    }
    let isAskAvailable = false;
    // console.log(ROOMS[joinCode].asks);
    for (let ask of ROOMS[joinCode].asks) {
        if (ask.id === askId) {
            ask.answered = ! ask.answered;
            isAskAvailable = true;
            break;
        }
    }
    if (!isAskAvailable) {
        socket.send(JSON.stringify({ type: "error", message: "Ask not found" }));
        socket.close(1008, 'Ask Not Found');
        return;
    }
    const answeredPing : WsMessage<AnsweredPingPayload> = {
        type:"answeredPing",
        payload:{
            id: askId
        }
    }
    Ping(answeredPing, ROOMS[joinCode]);
}

export default markAsAnswered;