import { pack } from 'msgpackr'
import { io } from '../listeners/socketServer'
import models from '../models/indexModel'
import { users, idFromIp } from './userController.js' // Mongo Model

/**
 * ThrottledWrite is the function we send udp packet to, we auth it here and send data to socket and DB
 *
 * @param  {Float} x
 * @param  {Float} y
 * @param  {Float} z
 * @param  {Float} speed
 * @param  {Float} surface
 * @param  {Float} flying
 * @param  {String} ip
 * @param  {Integer} size
 * @param  {Integer} userID
 */
export const throttledWrite = async (x, y, z, s, r, flying, ip, size, userID) => {
  const userId = idFromIp(ip)

  /**
   * TODO: Fix throttle speed by car speed
   * this doesn't really work atm we do (speed ^-2) * (2 * 10^7)
   * but that doesn't scale really well for all number especially low ones
   *
   * @const speedo This variable is the speed we should throttle at
   *
   * */

  const now = new Date()
  const speed2kmh = Math.abs(Math.round(s * 2.237)) * 1.60934
  const twenymil = 2 * Math.pow(10, 7)

  let speedo = Math.pow(speed2kmh, -2) * twenymil
  if (speedo > 250) {
    speedo = 250
  }
  if (speed2kmh < 25) {
    speedo = 1000
  }
  if (now - users[userId].udp.lastSeen >= speedo) {
    users[userId].udp.lastSeen = now
  } else {
    return
  }

  if (users[userId] === undefined || users[userId].udp.known === false || Object.keys(users[userId].udp).length === 0) { return }

  await models.position.create({
    x,
    y,
    z,
    r,
    userId: users[userId].udp.known.id
  })

  if ('socket' in users[userId]) {
    io.to(users[userId].socket.id).emit('chord', { x, y, z, s: r })
  }
  io.to('home').emit('chord', { x, y, z, s: r })
}
/**
 * @param  {Object} socket
 */
export const sendInitData = async (socket) => {
  if (socket.decoded === false) { return }
  // Global user wants all data
  if (socket.rooms.has('home')) {
    const alluserPos = await models.position.findAll({
      raw: true,
      attributes: ['x', 'y', 'z', ['r', 's']]
    })
    const serializedAsBuffer = pack({ alluserPos })
    io.to(socket.id).emit('chordPack', serializedAsBuffer)
  } else {
    console.log(socket.rooms.has('home'))
    // console.log(socket)
    const alluserPos = await models.position.findAll({
      raw: true,
      where: {
        userId: socket.decoded.id
      },
      attributes: ['x', 'y', 'z', ['r', 's']]
    })
    const serializedAsBuffer = pack({ alluserPos })
    io.to(socket.id).emit('chordPack', serializedAsBuffer)
  }

// let data = unpack(serializedAsBuffer);
  // console.log(alluserPos)
}
