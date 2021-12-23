import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import fetch from 'node-fetch'
import RefreshToken from '../models/refreshTokenModel.js'
import config from '../config/auth.config'
import User from '../models/userModel'

const createToken = async (user) => {
  const expiredAt = new Date()
  expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration)

  const _token = uuidv4()
  const refreshToken = await RefreshToken.create({
    token: _token,
    userId: user.id,
    expiryDate: expiredAt.getTime()
  })
  return refreshToken.token
}

let user
let token

export const postLogin = async (req, res, next) => {
  try {
    // Get Discord Data
    const {
      code
    } = req.body

    if (code) {
      const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: process.env.DISCORDID,
          client_secret: process.env.DISCORDSECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:3000/callback',
          scope: 'identify'
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      const oauthData = await oauthResult.json()
      if (oauthData.error) {
        return res.status(401).json({
          error: 'Invalid Token'
        })
      }
      const userResult = await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`
        }
      })
      const userData = await userResult.json()
      const email = userData.email
      const username = userData.username
      const did = userData.id
      const avatar = userData.avatar
      if (userData.error) {
        return res.status(401).json({
          error: 'Invalid Token'
        })
      }
      user = await User.findOne({
        where: {
          email
        }
      })
      if (!user) {
        user = await User.create({
          did,
          username,
          email,
          avatar
        })
      }
      token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration
      })
      const refreshToken = await createToken(user)
      res.status(200).json({
        token,
        refresh_token: refreshToken
      })
    }
  } catch (err) {
    throw new Error(err)
  }
}

export const postRefreshToken = async (req, res, next) => {
  const { refresh_token: requestToken } = req.body

  try {
    if (!requestToken) {
      return res.status(403).json({ message: 'Refresh Token is required!' })
    }
    const refreshToken = await RefreshToken.findOne({
      where: { token: requestToken }
    })
    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token does not exist!' })
    }
    if (refreshToken.expiryDate.getTime() < new Date().getTime()) {
      await RefreshToken.destroy({ where: { id: refreshToken.id } })

      return res.status(403).json({
        message: 'Refresh token was expired. Please login again!'
      })
    }
    console.log(refreshToken)
    const user = await refreshToken.getUser()
    const newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration
    })
    return res.status(200).json({
      token: newAccessToken,
      refresh_token: refreshToken.token
    })
  } catch (err) {
    throw new Error(err)
  }
}
export const getUser = (req, res, next) => {
  res.status(200).json({
    user: {
      id: user.id,
      did: user.did,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    }
  })
}

export const getAllUsers = async (req, res, next) => {
  const users = await User.findAll({
    attributes: ['username']
  })
  res.status(200).json({ users })
}
