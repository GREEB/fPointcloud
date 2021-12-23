import dotenv from 'dotenv'
import express from 'express'
import authRouter from './routers/authRouter'
import { db } from './config/db.config'
import { httpServer } from './listeners/socketServer'
import udpServer from './listeners/udpServer'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.json())
authRouter(app)

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

db.sync()

udpServer.bind(5300)

udpServer.on('listening', () => {
  const address = udpServer.address()
  console.log(`udpServer listening on ${address.address}:${address.port}`)
})

app.listen(3002, () => {
  console.log('Api listening on 3002')
})

export default app
