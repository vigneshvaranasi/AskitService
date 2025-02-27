import { WebSocket } from 'ws';
import { ROOMS } from '../types/Base';
import { Notify, Ping } from '../utils/commonUtils';
import { EndRoomNotifyPayload,EndRoomPingPayload, WsMessage } from '../types/Messages';
import { CloseRoom } from '../utils/commonUtils';
import { endRoomDB } from '../utils/dbutils';
export async function endRoom(socket:WebSocket, joinCode:string, ROOMS:ROOMS){
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
    const endRoomPing:WsMessage<EndRoomPingPayload> = {
        type: "endRoomPing",
        payload: {
            message: "Room has been ended by the speaker"
        }
    }
    Ping(endRoomPing, ROOMS[joinCode]);
    const endRoomNotify:WsMessage<EndRoomNotifyPayload> = {
        type: "endRoomNotify",
        payload: {
            message: "Room has been ended"
        }
    }
    Notify(endRoomNotify, socket);
    

    await CloseRoom(ROOMS[joinCode])
    await endRoomDB(joinCode);

    delete ROOMS[joinCode];
}
export default endRoom;