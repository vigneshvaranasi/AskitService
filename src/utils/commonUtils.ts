import { Room, ROOMS } from "../types/Base";
import { WsMessage } from "../types/Messages";
import { WebSocket } from "ws";
export async function Ping(WsMessage: WsMessage, Room: Room) {
    PingAttendees(WsMessage, Room);
    PingSpeaker(WsMessage, Room);
}

export async function PingAttendees(WsMessage: WsMessage, Room: Room) {
    for (const attendee of Room.attendees) {
        attendee.socket.send(JSON.stringify(WsMessage));
    }
}

export async function PingSpeaker(WsMessage: WsMessage, Room: Room) {
    Room.speaker.socket.send(JSON.stringify(WsMessage));
}

export async function Notify(WsMessage:WsMessage,socket:WebSocket){
    socket.send(JSON.stringify(WsMessage));
}


export async function CloseRoom(Room:Room){
    for(let attendee of Room.attendees){
        attendee.socket.close(1008, 'Room Ended by Speaker');
    }
    Room.speaker.socket.close(1008, 'Room Ended');
    
}


export function findUserRoom(socket: WebSocket, ROOMS: ROOMS): { joinCode: string; room: Room; role: "speaker" | "attendee" | null } | null {
    for (const [joinCode, room] of Object.entries(ROOMS)) {
        if (room.speaker.socket === socket) {
            return { joinCode, room, role: "speaker" };
        }
        const attendeeIndex = room.attendees.findIndex(att => att.socket === socket);
        if (attendeeIndex !== -1) {
            return { joinCode, room, role: "attendee" };
        }
    }
    return null;
}