import { WebSocket } from "ws";
import { configDotenv } from "dotenv";
configDotenv();
import { retrieveRoomByJoinCode } from "../utils/dbutils";
import { generateRandomEmoji } from "../utils/roomUtils";
import { Ask, Room, ROOMS } from "../types/Base";
import { JoinNotifyPayload, JoinPingPayload, WsMessage } from "../types/Messages";
import { Notify, Ping } from "../utils/commonUtils";
import { verifyRoom } from "../utils/userAuth";

export async function joinRoom(socket: WebSocket, id: string, ROOMS: ROOMS, joinCode: string) {
    console.log('id: ', id);
    const room = await verifyRoom(joinCode, socket);
    console.log('room: ', room);
    if (!room) {
        socket.close(1008, 'Room not Found');
        return;
    }
    const speakerInDB = room.speaker?.toString();
    console.log('speakerInDB: ', speakerInDB);
    console.log("id: ", id);
    if (ROOMS[joinCode]) {
        if (speakerInDB === id){
            socket.close(1008, 'Room is Inactive');
            return;
        }
        ROOMS[joinCode].attendees.push({
            socket,
            id
        })
    } else {
        if (speakerInDB === id) {
            console.log("Creating in ROOMs")
            ROOMS[joinCode] = {
                id: room._id.toString(),
                speaker: {
                    socket: socket,
                    id: speakerInDB as string
                },
                attendees: [],
                asks: []
            }
        }
        else {
            socket.close(1008, 'Room not Found');
            return;
        }
    }
    console.log('ROOMS[joinCode]: ', ROOMS[joinCode]);
    const joinPingMessage: WsMessage<JoinPingPayload> = {
        type: "joinPing",
        payload: {
            attendees: ROOMS[joinCode].attendees.length
        }
    }
    Ping(joinPingMessage, ROOMS[joinCode]);
    const joinNotifyMessage: WsMessage<JoinNotifyPayload> = {
        type: "joinNotify",
        payload: {
            message: "You have joined the Room",
            asks: ROOMS[joinCode].asks
        }
    }
    Notify(joinNotifyMessage, socket);
}

export default joinRoom;