# Forza Point Cloud
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![Build Status](https://app.travis-ci.com/GREEB/ForzaPointCloud.svg?branch=master)](https://app.travis-ci.com/GREEB/fPointcloud)
[![issues](https://github.com/GREEB/ForzaPointCloud/workflows/todo2issue/badge.svg)](https://github.com/GREEB/fPointcloud/actions?query=workflow:"todo2issue")
![](https://user-images.githubusercontent.com/1221769/148322387-67a89550-77f5-4c04-80ac-af9329859144.gif)

WIP!

## Features

- [x]  Three: dynamic point cloud
- [x]  Nuxt: Discord login
- [x]  Nuxt: Simple Frontend

## Bugs

Too many atm.

## Contributing

Contributions are always welcome!

Look at issues

## Development

First make sure you copy the example.env to .env

```cp example.env .env```

Read "Enviroment Variables" below


```bash
  yarn Install
  yarn dev
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`IOPORT` Socket.io port

`URL` Url for CORS and ssl later not really implemented yet if empty defaults to localhost

`PORT` App port also for CORS and stuff

`JWTSECRET` Secret used for JWT, can be generated with:
```bash
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
#or
openssl rand 256 | base64
```

`POSTGRES` Postgres URL

`DISCORDID` Discord oAuth id

`DISCORDSECRET` Discord oAuth secret


## Acknowledgements

 - [@jonathanlurie](https://github.com/jonathanlurie)/[pointCloud](https://github.com/jonathanlurie/pointCloud)
