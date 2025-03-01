import { userModel } from '../models/User'
import { roomModel } from '../models/Room'
import { askModel } from '../models/Ask'
export async function retrieveUserByEmail(email: string) {
  let user = await userModel.findOne({
    email: email
  })
  return user
}
export async function retrieveUserById(id: string) {
  let user = await userModel.findOne({
    userId: id
  })
  return user
}
export async function createUser(user: any) {
  let newUser = await userModel.create(user)
  return newUser
}

export async function retriveRoomById(joinCode: string) {
  let room = await roomModel.findOne({
    joinCode: joinCode
  })
  return room
}
export async function retrieveRoomByJoinCode(joinCode: string) {
  let room = await roomModel.findOne({
    joinCode: joinCode,
    activeStatus: true
  })
  return room
}

export async function createRoomInDB(room: any) {
  let newRoom = await roomModel.create(room)
  return newRoom
}

export async function joinRoominDB(user: any, joinCode: string) {
  let room = await roomModel.findOne({
    joinCode: joinCode
  })
  let userId = user._id
  if (room) {
    await roomModel.updateOne(
      {
        joinCode: joinCode
      },
      {
        $addToSet: {
          attendees: userId
        }
      }
    )
    room = await roomModel.findOne({ joinCode: joinCode })
    return {
      error: false,
      room: room
    }
  }
  return {
    error: true,
    message: 'Room not found'
  }
}


// Add in ask Collection
// Add that Id to RoomsModel.asks
export async function newAsk(ask: any,joinCode:string) {
  try {
    let newAsk = await askModel.create(ask)
    let room = await retrieveRoomByJoinCode(joinCode)
    if(!room){
      return null
    }
    room.asks.addToSet(newAsk._id)
    await room.save()
    return newAsk
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error creating Ask: ", err.message);
    } else {
      console.error("Error creating Ask: ", err);
    }
    return null;
  }
}

export async function endRoomDB(joinCode: string) {
  try {
    let fulRoom = await roomModel.findOneAndUpdate(
      { joinCode: joinCode },
      { activeStatus: false },
      { new: true }
    );
    if (!fulRoom) 
      return;
    // If no asks exist, delete the room and update attendees
    if (!fulRoom.asks || fulRoom.asks.length === 0) {
      await roomModel.deleteOne({ joinCode: joinCode });

      await Promise.all(
        fulRoom.attendees.map(attendeeId =>
          userModel.updateOne({ _id: attendeeId }, { $pull: { rooms: fulRoom._id } })
        )
      );
    }
  } catch (err) {
    console.error("Error ending Room: ", err instanceof Error ? err.message : err);
  }
}