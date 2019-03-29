var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  WS_HOST: '"https://127.0.0.1:3001"',
  ICE_HOST: '"turn:192.168.20.209:3478"',
  ICE_username: '"mytest"',
  ICE_credential: '"123456"',
})
