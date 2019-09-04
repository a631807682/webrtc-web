var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  WS_HOST: '"https://10.66.241.12:8080"',
  STUN_HOST: '"stun:192.168.20.123:5349"',
  TURN_HOST: '"turn:192.168.20.123:3478"',
  TURN_USERNAME: '"mytest"',
  TURN_CREDENTIAL: '"123456"'
})
