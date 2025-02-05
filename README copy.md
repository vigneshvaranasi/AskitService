
## DB Schema
User { id, name, email, password, ask[],reply[], room[](created & joined)}

Ask { id, question, user_id (ref), timestamp, upvote, reply[](replyRefs), roomRef }

Reply { id, repliedTo[ask | reply]ref , userRef, reply, timestamp, upvote }

Room {id,joinCode, title, desc,  speakerName (UserRef), Attendees[] (Psuedonym<-userRefs), Asks[] (askRefs)}

## CreateRoom Logic:
1. User's Data is taken ={ _id, Name, Email } 
2. CreateRooom Message
    ```json
    {
        "type":"create",
        "payload":{
            "title":"Bitcon & its Impact",
            "desc":"Bitcon is v mfdvmsdv aknsfncsdc",
            "userId":"_id"
        }
    }
    ```
3. Randomise the 6 didgit code and make it joinCode.
4. Push the roomConfig to Rooms (Global)
    ```json
    "joinCode" : {
        "joinCode":"000000",
        "title":"Bitcon & its Impact",
        "desc":"Bitcon is v mfdvmsdv aknsfncsdc",
        "creator":{
            // Creator's Data
        },
        "attendees":[ ],
    }
    ```
5. Push the Data into the DB Rooms Collection
6. Send the Creator the message:
    ```json
    {
        "type":"roomCreated",
        "payload":{
            "joinCode":"000000",
            "title":"Bitcon & its Impact",
            "desc":"Bitcon is v mfdvmsdv aknsfncsdc"
        }
    }
    ```
7. Join the Creator into the Room passing joinCode


## Join into Room (userData, joinCode)
1. Check if the room is active or not, if active add the attendee to the room
    - If the room doesnot exist:
        ```json
        {
            "type":"error",
            "payload":{
                "message":"Room is Not Active or Doesnot Exist"
            }
        }
        ```
2. Check if the user exists in the Database Users
    - If the user doensot exist in the Users:
        ```json
        {
            "type":"error",
            "payload":{
                "message":"Signin to Join"
            }
        }
        ```
3. Put the user into Rooms.attendeee in DB
4. Push the user into the Global Socket Rooms.attendees
5. User Data Stored
    ```json
    "user":{
        "name":"user Name",
        "emoji":"😂",
        "email":"useremaol@gmail.com",
        "id":"_id"
    }
    ```
6. Get the Size of the Room.attendees 
7. Notify the Clients
    ```json
    {
        "type":"attendeeNotify",
        "payload":{
            "attendees":"size"
        }
    }
    ```

# In the Room
## 1. Ask (By Attendee)
1. Send the message:
    ```json
    {
        "type":"ask",
        "payload":{
            "question":"What is DAPP?",
            "id":"_id",
            "joinCode":"0000000",
        }
    }
    ```
2. Add the Ask into DB.Asks mapped to Room, User
3. Notify all the Attendees & Creator in the room with the message:
    ```json
    {
        "type":"askNotification",
        "payload":{
            "ask":"What is DApp?",
            "emoji":"😂",
            "askId":"Auto Icrement",
            "upvotes":0,
            "isAnswered":false
        }
    }
    ```
## 2. Upvote (By Attendee)
1. Upvote Question
    ```json
    {
        "type":"upvote",
        "payload":{
            "askId":1,
            "joinCode":"JoinCode",
            "upvote":"-1",
            "userId":"_id"
        }
    }
2. Validate joinCode and userId.
3. Notify the Clients with message
    ```json
    {
        "type":"upvoteNotify",
        "payload":{
            "askId":1,
            "upvote":"-1"
        }
    }
    ```
## 3. Leave Room  (By Attendee)
1. Leave Message form user:
    ```json
    {
        "type":"leaveRoom",
        "payload":{
            "joinCode":"000000",
            "userId":"_id"
        }
    }
    ```
2. Validate the User in the room
3. Pop the user off the Global Room.attendees
4. Get the Size of the Room.attendees 
5. Notify the Clients
    ```json
    {
        "type":"attendeeNotify",
        "payload":{
            "attendees":"size"
        }
    }
    ```

## A. End Room (By Creator)
1. Get the message from the Creator
    ```json
    {
        "type":"endRoom",
        "payload":{
            "joinCode":"000000",
            "useId":"_id"
        }
    }
    ```
2. Validate the Creator
3. Update the status of room in the DB.Room
4. Notify the Attendees
    ```json
    {
        "type":"endRoomNotify",
        "payload":{
            "message":"Room has been Ended by the Speaker",
        }
    }
    ```
5. Notify the Creator
6. Notify the Attendees
    ```json
    {
        "type":"endRoomNotify",
        "payload":{
            "message":"Room has been Ended",
        }
    }
    ```
7. in the client handler add the prompt for archiving the room
8. Pop off the Room with joinCode from the Global Room

## B. Mark as Answered (By Creator)
1. Get the message from the Creator
    ```json
    {
        "type":"markAsAnswered",
        "payload":{
            "askId":1,
            "joinCode":"000000",
            "userId":"_id"
        }
    }
    ```
2. Validate the Creator
3. Update the status of the Ask in the DB.Ask
4. Notify the Attendees
    ```json
    {
        "type":"markAsAnsweredNotify",
        "payload":{
            "askId":1,
            "message":"Question has been Answered by the Speaker",
        }
    }
    ```

# Questions Archive
1. Dispaly all the Questions asked in the session & give tage if it is answered or not