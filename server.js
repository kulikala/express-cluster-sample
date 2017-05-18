'use strict';

const cluster = require('cluster');

if (cluster.isMaster) {
  const Master = require('./lib/master');

  new Master();
} else {
  const Worker = require('./lib/worker');

  new Worker();
}
