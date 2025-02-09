import { WebSocket } from 'ws';
export type Ask = {
    id: number;
    question: string;
    upvotes: number;
    answered: boolean;
    upvotedBy: string[];
}
export type Room = {
    id:string;
    speaker: {
        socket: WebSocket,
        id: string
    };
    attendees: {
        socket: WebSocket,
        id: string
    }[];
    asks: Ask[];
}
export type ROOMS = Record<string, Room>;