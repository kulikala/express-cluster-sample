'use strict';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const MESSAGE_EXIT = require('./consts').MESSAGE_EXIT;


class Master {
  constructor() {
    this.start();
  }

  exit() {
    for (const id in cluster.workers) {
      cluster.workers[id].send(MESSAGE_EXIT);
    }
  }

  log(...args) {
    console.log('[Master]', ...args);
  }

  start() {
    for (let i = 0; i < numCPUs; i++) {
      // Create a worker
      cluster.fork();
    }

    cluster.on('message', this._onMessage.bind(this));
  }

  _onMessage(worker, message, handle) {
    if (1 === arguments.length) {
      [message, handle] = Array.from(arguments);
    }

    this.log('Got message', message, 'from Worker', worker && worker.id);

    switch (message) {
      case MESSAGE_EXIT:
        this.exit();
        break;
    }
  }
}


module.exports = Master;
