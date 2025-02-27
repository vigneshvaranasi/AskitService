import jwt from 'jsonwebtoken';
import { userModel } from '../models/User';
import { retrieveRoomByJoinCode } from './dbutils';
import WebSocket from 'ws';
type decoded = {
    _id:string;
    email:string;
}

export async function authenticateUser(token:string) {
    try{
        if(!token) throw new Error("No Token provided");
        const secret = process.env.JWT_SECRET;
        const decodedUser = jwt.verify(token, secret as string) as decoded;

        const user = await userModel.findOne({email: decodedUser.email});
        if(!user) throw new Error("User not found");
        return user;
    }catch(err: any){
        console.error("Authentication Failed: ", err.message);
        return null;
    }
}

export async function verifyRoom(joinCode: string, socket: WebSocket) {
    try {
        const room = await retrieveRoomByJoinCode(joinCode);        
        if (room) {
            return room;
        } else {
            socket.close(1008, 'Room not Found');
            return null;
        }
    } catch (err) {
        console.error("Error verifying room", err);
        socket.close(1011, 'Internal Server Error');
    }
}
