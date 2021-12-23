
import fetch from 'node-fetch'

export const discordAuth = async (req, res, next) => {
  const {
    code
  } = req.body

  if (code) {
    try {
      const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: '918603750057328640',
          client_secret: 'pN--N-4O-L49aKxanfIhIEIk6l1vRjxy',
          code,
          grant_type: 'authorization_code',
          redirect_uri: 'http://192.168.0.42:3000/callback',
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

      return '123'
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error;
      // it will return a 401 Unauthorized response in the try block above
      console.error(error)
    }
  }
}

export default discordAuth
