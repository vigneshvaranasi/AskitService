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
    active: true
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


export async function newAsk(ask: any) {
  try {
    let newAsk = await askModel.create(ask)
    return newAsk
  } catch (err) {
    if (err instanceof Error) {
      console.log("Error creating Ask: ", err.message);
    } else {
      console.log("Error creating Ask: ", err);
    }
    return null;
  }
}

export async function endRoomDB(joinCode: string) {
  try {
    let room = await roomModel.updateOne(
      { joinCode: joinCode },
      { active: false }
    )
  } catch (err) {
    if (err instanceof Error) {
      console.log("Error ending Room: ", err.message);
    } else {
      console.log("Error ending Room: ", err);
    }
  }
}