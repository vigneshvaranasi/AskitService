import { WebSocket } from "ws";
import mongoose, { ObjectId } from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();
import { retrieveRoomByJoinCode } from "./dbutils";
import { attendeesType, replyType, asksType, roomType, createRoomType } from "../types";
import { generateRandomEmoji } from "./roomUtils";

async function verifyRoom(joinCode:string, socket:WebSocket){
    try{
        const room = await retrieveRoomByJoinCode(joinCode);
        if(room){
            return room;
        }else{
            socket.close(404, 'Room not Found');
        }
    }catch(err){
        console.log("Error verifying room", err)
        socket.close(404, 'Room not Found'); 
    } 
}

export async function joinRoom(socket:WebSocket,title: string,id:ObjectId,rooms:roomType[],joinCode:string){
    const room = await verifyRoom(joinCode,socket);
    if(!room){
        return;
    }
    const speaker = room.speaker;
    if(speaker===id){
        if(room){
            rooms.push({
                joinCode,
                title,
                speaker:{
                    id,
                    socket
                },
                attendees:[],
                asks:[]
            })
        }
        socket.send(JSON.stringify({
            type:'speaker',
            room:room,
            message:"Room is Live"
        }))
    }
    else{
        if(room){
            let attendees = room.attendees;
            let index = attendees.find((att)=>att.id===id);
            const emoji = generateRandomEmoji();
            if(index){
                attendees.push({
                    id,
                    socket,
                    emoji
                })
            }
            socket.send(
                JSON.stringify({
                    type:'attendee',
                    emoji,
                    message:'Room is Live',
                    room:room
                })
            )
        }
    }
    
}