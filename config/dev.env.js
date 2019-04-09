var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  WS_HOST: '"https://127.0.0.1:3001"',
  STUN_HOST: '"stun:192.168.20.209:5349"',
  TURN_HOST: '"turn:192.168.20.209:3478"',
  TURN_USERNAME: '"mytest"',
  TURN_CREDENTIAL: '"123456"'
})
