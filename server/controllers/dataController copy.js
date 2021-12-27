import throttle from 'lodash.throttle'
import { io } from '../listeners/socketServer'
import { users, lastSeen } from './userController.js' // Mongo Model

/**
 *
 * How to write data
 *
 * Cache is sync of db
 *
 * db syncs from cache every x seconds or x data written
 *
 * data is served from cache to user
 *
 * global users get full cache on new chord send it
 *
 */

// const twrite = (x, y, z, surface, flying, ip, size, userID) =>{
//   // Check last time we send data
//   // if (users[id].udp.lastseen > Date.now()){}else{}
//   // send data only if last was ms seconds ago

//   // when data is send update lastSeen
// }

// FIXME: Fix all of this user session logic, use something real like express-sessions
// category=Server

// const addUDPuser = async (ip) => {
//   console.log(`adding user with ip: ${ip}`)
//   createUser(ip)
// }

export const throttledWrite = throttle((x, y, z, surface, flying, ip, size, userID) => {
 
  const createPosition = await Position.create({
    x: 1,
    z: 1,
    y: 1,
    s: 1
  })

 /**
  * Look if client is regisred is users first
  * 
  * check settings from user and apply 
  * 
  * if sockets send 
  * 
  */

  // import users
  // match ip with user _id
  // maybe give socket to push from users
  if (users[userID] === undefined) { return }
  if ('ip' in users[userID]) {
    if ('socketID' in users[userID]) {
      // console.log(`${ip} also connected with sockets`);

    } else {
      // console.log(`${ip} not connected to sockets`);
    }
  } else {
    // console.log('only socket or something not good');
  }
  lastSeen(users[userID])
  if (flying === 0) { return } // Abort if flying
  if (x === 0 && y === 0 && z === 0) { return } // Abort if 000 chord
  // TODO: Save Pos with user data only if we have it
  // category=Server
  // const newPos = new Position({
  //   x,
  //   y,
  //   z,
  //   surface,
  //   user: users[userID].mongodb_id
  // })
  // newPos.save((err) => {
  //   // TODO:Nuxt.Server: Check duplicates in cache?
  //   // category=Server
  //   if (err) { console.log('DUPLICATE FIXME') }
  // })

  io.to(users[userID].socketID).emit('chord', { // send chord via sockets to invididual
    x, y, z, s: surface
  })

  // TODO:Send io to global room
  // category=Server
}, 100)
