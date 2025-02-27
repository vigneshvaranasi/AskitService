import WebSocket from "ws";
import { configDotenv } from "dotenv";
import connectToDB from "./config/db";
import { authenticateUser } from "./utils/userAuth";
import joinRoom from "./controllers/joinRoom";
import ask from "./controllers/ask";
import upvote from "./controllers/upvote";
import markAsAnswered from "./controllers/markAsAnswered";
import endRoom from "./controllers/endRoom";
import leaveRoom from "./controllers/leaveRoom";
import { ROOMS } from "./types/Base";
import mongoose from "mongoose";
import { userModel } from "./models/User";
import { findUserRoom } from "./utils/commonUtils";
configDotenv();
connectToDB();

const MODE = process.env.MODE || "dev";
const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocket.Server({ port: PORT as number });

let ROOMS: ROOMS = {};

// setInterval(() => {
//   console.log("ROOMS: ", ROOMS);
// }, 4000);

wss.on("connection", async (socket, req) => {
  // const tempIdSpeaker = "677eb68aa829c1bd4b084270"
  // const tempIdAttendee = "677eb68fa829c1bd4b084274"
  // const tempIdAttendee2 = "67a0c7be16a4cef907e33782"

  const token = req.headers["sec-websocket-protocol"] as string;
  const user = await authenticateUser(token);
  const userId = user?._id.toString();
  if (!user) {
    socket.close(1008, "Unauthorized");
    return;
  }

  socket.on("message", async (message) => {
    // on Message 
    console.log(`Received: ${message}`);
    try {
      const parsedMessage = JSON.parse(message.toString());
      const type = parsedMessage.type;
      const joinCode = parsedMessage.payload.joinCode;
      
      // Testing join
      if (type === "join") {
        await joinRoom(socket, userId as string, ROOMS, joinCode);
      }
      // if (type === "joinn") {
      //   await joinRoom(socket, tempIdAttendee, ROOMS, joinCode);
      // }
      // if (type === "joinee") {
      //   await joinRoom(socket, tempIdAttendee2, ROOMS, joinCode);
      // }

      // Testing ask
      if (type === "ask") {
        await ask(socket, joinCode, ROOMS, parsedMessage.payload, userId as string);
      }
      // if (type === "askk") {
      //   await ask(socket, joinCode, ROOMS, parsedMessage.payload, tempIdAttendee2 as string);
      // }

      // Testing Upvote
      if (type === "upvote") {
        const upv = parsedMessage.payload.upvote;
        const askId = parsedMessage.payload.askId;
        await upvote(socket, joinCode, ROOMS, askId, upv, userId as string);
      }

      // Testing Mark as Answered
      if (type === "answered") {
        const askId = parsedMessage.payload.askId;
        await markAsAnswered(socket, joinCode, ROOMS, askId);
      }

      // Testing Leave
      if (type === "leave") {
        await leaveRoom(socket, joinCode, ROOMS);
      }

      // Testing End Room
      if (type === "end") {
        await endRoom(socket, joinCode, ROOMS);
      }
    } catch (e) {
      console.error(e);
      socket.close(1008, "Invalid Message");
    }
  });

  socket.on("close", async () => {
    const userData = findUserRoom(socket, ROOMS);
    if (!userData) return;

    const { joinCode, room, role } = userData;

    if (role === "speaker") {
      await endRoom(socket, joinCode, ROOMS);
    } else {
      await leaveRoom(socket, joinCode, ROOMS);
    }
  });
});