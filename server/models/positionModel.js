import { db, Sequelize } from '../config/db.config'

const Position = db.define('position', {
  x: { type: Sequelize.STRING },
  y: { type: Sequelize.STRING },
  z: { type: Sequelize.STRING }
})

export default Position
