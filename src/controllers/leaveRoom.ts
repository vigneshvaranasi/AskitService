import { WebSocket } from 'ws';
import { ROOMS } from '../types/Base';
import { Notify, Ping } from '../utils/commonUtils';
import { LeaveNotifyPayload, LeavePingPayload, WsMessage } from '../types/Messages';
import { CloseRoom } from '../utils/commonUtils';

export async function leaveRoom(socket:WebSocket, joinCode:string, ROOMS:ROOMS){
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
    ROOMS[joinCode].attendees = ROOMS[joinCode].attendees.filter((attendee)=>attendee.socket!==socket)
    const leaveRoomPing:WsMessage<LeavePingPayload> = {
        type: "leavePing",
        payload: {
            attendees: ROOMS[joinCode].attendees.length
        }
    }
    Ping(leaveRoomPing, ROOMS[joinCode]);
    const leaveRoomNotify:WsMessage<LeaveNotifyPayload> = {
        type: "leaveNotify",
        payload: {
            message: "You left the Room"
        }
    }
    Notify(leaveRoomNotify, socket);
    socket.close(1000, 'Room Left');
}

export default leaveRoom;