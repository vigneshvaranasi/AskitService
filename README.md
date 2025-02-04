
## DB Schema
User { id, name, email, password, ask[],reply[], room[](created & joined)}

Ask { id, question, user_id (ref), timestamp, upvote, reply[](replyRefs), roomRef }

Reply { id, repliedTo[ask | reply]ref , userRef, reply, timestamp, upvote }

Room {id,joinCode, title, desc,  speakerName (UserRef), Attendees[] (Psuedonym<-userRefs), Asks[] (askRefs)}

# Websocket Design


## Connection
1. Client sends the Sec-Websocket-Protocol Header, containing token.
2. Token is Decrypted, and we get {_id, email} of the use who is seeking a connection.
3. We check in the Database that the User is valid. If not, closing Socket.
4. Now we have user {_id, email} and socket


## Join
1. Client sends message
    ```json
    {
        "type":"join",
        "payload":{
            "joinCode":123456,
        }
    }
    ```
2. Check for the Room in DB(verifyRoom), if not there, close the socket.
3. Checking if the room with joinCode already exists in ROOMS
4. If YES:
    1. Push the socket of this user into the ROOMS.attendee[]
5. If NO:
    1. If the Socket belong to room.speaker === user._id
        1. Init Room.speaker = {socket, id};
        2. push into ROOMS
    2. Else push the user's socket into ROOMS[joinCode].attendee
6. Sends the JoinPing to all the sockets
    ```json
    {
        "type":"joinPing",
        "payload":{
            "attendees":109
        }
    }
    ```
7. Send Notify User
    ```json
    {
        "type":"joinNotify",
        "payload":{
            "message":"You have joined the Room",
            "asks": []
        }
    }
    ```

## Ask
1. User send the message
    ```json
    {
        "type":"ask",
        "payload":{
            "question":"What is DAPP?",
            "joinCode":"0000000",
        }
    }
    ```
2. ROOMS.filter(joinCode), check if that room exists, if NOT => socket.close().
3. If that socket is not present in the ROOMS[joinCode].attendee, socket.close().
4. Push the ask in the ROOMS
    ```json
    {
        "ROOMS" : [
            "123456": {
                "speaker":{
                    "socket":"SOCKET",
                    "_id":"ID"
                },
                "attendees":[
                    {
                        "socket":"SOCKET",
                        "_id":"ID"
                    },
                    {
                        "socket":"SOCKET",
                        "_id":"ID"
                    }
                ],
                "asks":[
                    {
                        "ask":"What is DAPP",
                        "upvote":0,
                        "answered": false
                    }
                ]
            }
        ]
    }
    ```
5. BroadCast Ask into the Attendees and speaker
    ```json
    {
        "type":"askPing",
        "payload":{
            "ask":"What is DAPP?",
            "id":"LENGTH OF ASK ARRAY - 1"
            "upvote":"0"
        }
    }
    ```
6. Push the Ask into the DB.Ask

## Upvote
1. User send the message
    ```json
    {
        "type":"upvote",
        "payload":{
            "askId":"1",
            "joinCode":"0000000",
            "upvote":"1 OR -1"
        }
    }
    ```
2. ROOMS.filter(joinCode), check if that room exists, if NOT => socket.close().
3. If that socket is not present in the ROOMS[joinCode].attendee, socket.close().
4. Filter the Ask based on the askID and add the upvote in the ask object.
5. Ping all the Attendees and Speaker with Ask:
    ```json
    {
        "type":"upvotePing",
        "payload":{
            "id":"ASKID"
            "upvote":"1"
        }
    }
    ```

## Mark as Answered
1. User send the message
    ```json
    {
        "type":"answered",
        "payload":{
            "askId":"1",
            "joinCode":"0000000"
        }
    }
    ```
2. ROOMS.filter(joinCode), check if that room exists, if NOT => socket.close().
3. If that socket is not present in the ROOMS[joinCode].attendee, socket.close().
4. Filter the Ask based on the askID and answered!=answered
4. Ping all the Attendees and Speaker with Ask:
    ```json
    {
        "type":"answeredPing",
        "payload":{
            "id":"ASKID"
        }
    }
    ```

## End Room
1. Host asks to end room
    ```json
    {
        "type":"endRoom",
        "payload":{
            "joinCode":"0000000"
        }
    }
2. ROOMS.filter(joinCode), check if that room exists, if NOT => socket.close().
3. If that socket is not present in the ROOMS[joinCode].attendee, socket.close().
4. If the socket is not the speaker, socket.close().
5. Remove the Room from the ROOMS
6. Notify all the Attendees and Speaker
    ```json
    {
        "type":"endRoomNotify",
        "payload":{
            "message":"Room has been Ended by the Speaker"
        }
    }
    ```
7. Notify the Speaker
    ```json
    {
        "type":"endRoomNotify",
        "payload":{
            "message":"Room has been Ended"
        }
    }
    ```
8. Close the Socket


## Leave
1. User send the message
    ```json
    {
        "type":"leave",
        "payload":{
            "joinCode":"0000000"
        }
    }
2. ROOMS.filter(joinCode), check if that room exists, if NOT => socket.close().
3. If that socket is not present in the ROOMS[joinCode].attendee, socket.close().
4. Remove the socket from the ROOMS[joinCode].attendee
5. Ping all the Attendees and Speaker
    ```json
    {
        "type":"leavePing",
        "payload":{
            "message":"User has left the Room",
            "attendees":108
        }
    }
    ```
6. Close the Socket

