import { db, Sequelize } from '../config/db.config'
import User from './userModel'
import RefreshToken from './refreshTokenModel'
import Position from './positionModel'
import Udp from './udpModel'

const models = {}
models.db = db
models.sq = Sequelize

models.user = User
models.refreshToken = RefreshToken
models.position = Position
models.udp = Udp

// Client <-> User
models.user.hasOne(models.udp, {
  foreignKey: 'userId',
  tragetKey: 'id'
})
models.udp.belongsTo(models.user, {
  foreignKey: 'userId',
  tragetKey: 'id'
})

// User <-> Pos
models.position.belongsTo(models.user, {
  foreignKey: 'userId',
  tragetKey: 'id'
})
models.user.hasMany(models.position, {
  foreignKey: 'userId',
  tragetKey: 'id'
})

// Auth
models.refreshToken.belongsTo(models.user, {
  foreignKey: 'userId',
  tragetKey: 'id'
})
models.user.hasOne(models.refreshToken, {
  foreignKey: 'userId',
  tragetKey: 'id'
})

// OLD
// const games = [
//   {
//     id: 1,
//     name: 'Forza Horizon 5'
//   },
//   {
//     id: 2,
//     name: 'Forza Horizon 4'
//   },
//   {
//     id: 3,
//     name: 'Forza Motorsport 7'
//   }

// ]
// console.log(games)
// // for each game in list do logic
// games.forEach(async (a) => {
//   const findGame = await Game.findOne({ where: { name: a.name } })
//   if (findGame === null) {
//     console.log('Not found!')
//     const newGame = await Game.create({ name: a.name })
//     console.log(newGame)
//   } else {
//     console.log(findGame) // true
//   }
//   // const findGame = await Game.findOne({
//   //   where: {
//   //     name: a.name
//   //   }
//   // })
//   // if (findGame) {
//   //   console.log(findGame)
//   // } else {
//   //   not found create
//   //   // TODO: Get min max xyz and add to map
//   //   const newGame = await Game.create({
//   //     name: a.name
//   //   })
//   //   console.log(newGame)
//   // }
// })

export default models
