import WebSocket from "ws";
import { ROOMS, Ask } from '../types/Base';
// import { Filter } from "bad-words";
import { AskPayload, AskPingPayload, WsMessage } from "../types/Messages";
import { verifyRoom } from "../utils/userAuth";
import { newAsk } from "../utils/dbutils";
import { Ping } from "../utils/commonUtils";
// function levenshtein(a: string, b: string): number {
//     const m = a.length, n = b.length;
//     const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

//     for (let i = 0; i <= m; i++) dp[i][0] = i;
//     for (let j = 0; j <= n; j++) dp[0][j] = j;

//     for (let i = 1; i <= m; i++) {
//         for (let j = 1; j <= n; j++) {
//             if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
//             else dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
//         }
//     }
//     return dp[m][n];
// }

// function isSimilarSpam(asks: Ask[], question: string, threshold: number = 3): boolean {
//     return asks.some(ask => levenshtein(ask.question, question) <= threshold);
// }

function isSpam(asks: Ask[], question: string) {
    const found = asks.find(ask => ask.question === question);
    return found ? true : false;
}

// function isProfane(question: string): boolean {
//     const filter = new Filter();
//     return filter.isProfane(question);
// }

function isQuestionValid(question: string, asks: Ask[]) {
    if(question.length < 3) return "Question is too short";
    if (isSpam(asks, question)) return "Similar question already exists";
    // if (isSimilarSpam(asks, question)) return false;
    // if (isProfane(question)) return "Question is profane";
    return null;
}

export async function ask(socket: WebSocket, joinCode: string, ROOMS: ROOMS, ask: AskPayload, userId:string){
    if(!ROOMS[joinCode])
    {
        socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
        socket.close(1008, 'Room Not Found');
        return;
    }
    const isValidUser =  ROOMS[joinCode].attendees.find(attendee => attendee.socket == socket);
    if(!isValidUser)
    {
        socket.send(JSON.stringify({ type: "error", message: "Invalid user" }));
        socket.close(1008, 'Unauthorized');
        return;
    }
    const questionValidation = isQuestionValid(ask.question,ROOMS[joinCode].asks)
    if(!questionValidation===null){
        socket.send(JSON.stringify({ type: "error", message: questionValidation }));
        return;
    }
    const newask = {
        question: ask.question,
        answered: false,
        upvotes: 0,
        id: ROOMS[joinCode].asks.length+1,
    }
    ROOMS[joinCode].asks.push(newask)
    const askPingMessage: WsMessage<AskPingPayload> = {
        type: "askPing",
        payload: {
            ask: ask.question,
            id: ROOMS[joinCode].asks.length,
            upvote: 0
        }
    }
    Ping(askPingMessage, ROOMS[joinCode]);
    const newaskDB = {
        id: ROOMS[joinCode].asks.length,
        question: ask.question,
        userId:userId.toString(),
        room:ROOMS[joinCode].id.toString()
    }
    const newAskInDB = await newAsk(newaskDB);
    if(!newAskInDB){
        socket.send(JSON.stringify({ type: "error", message: "Error adding question to DB" }));
        return;
    }
}
export default ask;