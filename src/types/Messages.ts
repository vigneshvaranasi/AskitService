import { Ask } from "./Base";

export type WsEvent =
      "join"
    | "joinPing"
    | "joinNotify"
    | "ask"
    | "askPing"
    | "upvote"
    | "upvotePing"
    | "answered"
    | "answeredPing"
    | "endRoom"
    | "endRoomPing"
    | "endRoomNotify"
    | "leave"
    | "leavePing"
    | "leaveNotify"
    | "error";
export interface WsMessage<T = any> {
    type: WsEvent;
    payload: T;
}
export interface ConnectionPayload {
    token: string;
}
export interface JoinPayload {
    joinCode: string;
}
export interface JoinPingPayload {
    attendees: number;
}
export interface JoinNotifyPayload {
    message: string;
    asks: Ask[];
}
export interface AskPayload {
    question: string;
    joinCode: string;
}
export interface AskPingPayload {
    ask: string;
    id: number;
    upvote: number;
}
export interface UpvotePayload {
    askId: string;
    joinCode: string;
    upvote: 1 | -1;
}
export interface UpvotePingPayload {
    id: number;
    upvote: number;
}
export interface AnsweredPayload {
    askId: string;
    joinCode: string;
}
export interface AnsweredPingPayload {
    id: number;
}
export interface EndRoomPingPayload {
    message: string;
}
export interface EndRoomNotifyPayload {
    message: string;
}
export interface LeavePayload {
    joinCode: string;
}
export interface LeavePingPayload {
    attendees: number;
}
export interface LeaveNotifyPayload {
    message: string;
}