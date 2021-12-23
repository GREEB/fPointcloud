import Sequelize from 'sequelize'

const db = new Sequelize(process.env.POSTGRES)

export { db, Sequelize }
