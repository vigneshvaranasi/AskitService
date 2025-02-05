import WebSocket from "ws";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { ObjectId } from "mongoose";
import { authenticateUser } from "./utils/userAuth";
import { attendeesType, replyType, asksType, roomType, createRoomType } from "./types";
import { RoomSchema } from "./models/Room";
configDotenv();
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error(err);
  });
const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocket.Server({port:PORT as number});

const rooms = [] as roomType[];

wss.on("connection",async (socket, req)=>{
    // on Clients Connection
    const token= req.headers["sec-websocket-protocol"] as string;

    const user = await authenticateUser(token);

    
    if(!user){
        socket.close(401, "Unauthorized");
    }
    
    
    socket.on("message", (message)=>{
        // on Message 
        console.log(`Received: ${message}`);
        socket.send(`you sent: ${message}`);

        const parsedMessage = JSON.parse(message.toString());

        
    });
})