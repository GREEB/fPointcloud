import { Router } from 'express'
import isAuth from '../middleware/isAuth'
import { postLogin, postRefreshToken, getAllUsers, getUser } from '../controllers/authController.js'

export default function (app) {
  const authRouter = Router()

  authRouter.post('/login', postLogin)
  authRouter.post('/refresh-token', postRefreshToken)
  authRouter.post('/users', isAuth, getAllUsers) // you should add isAuth for those routes that you gonna protect them

  authRouter.get('/user', getUser)

  app.use('/api/auth/', authRouter)
}
