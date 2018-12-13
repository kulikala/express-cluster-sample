'use strict'

const cluster = require('cluster')
let instance

if (cluster.isMaster) {
  const Master = require('./lib/master')

  instance = new Master()
} else {
  const Worker = require('./lib/worker')

  instance = new Worker()
}

instance.start()
