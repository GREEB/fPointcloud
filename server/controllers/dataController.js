import throttle from 'lodash.throttle'
import { io } from '../listeners/socketServer'
import { users, lastSeen, idFromIp } from './userController.js' // Mongo Model

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
export const throttledWrite = (x, y, z, surface, flying, ip, size) => {
  const userId = idFromIp(ip)
  /**
   * Check users object to see if we want this data
   * 
   * save data to db
   * 
   * send data to user if online and global room
   * 
   */

  
  //console.log(users[userId]);
}
