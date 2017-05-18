'use strict';

const cluster = require('cluster');
const express = require('express');

const config = require('./../config');
const MESSAGE_EXIT = require('./consts').MESSAGE_EXIT;


class Worker {
  constructor() {
    this.id = cluster.worker.id;
    this._sockets = [];
    this.app = express();

    this.configure();
    this.start();
  }

  configure() {
    this.app.get('/', (req, res) => {
      this.log(req.method, req.url);

      res.send('Hello World!');
    });

    this.app.get('/exit', (req, res) => {
      this.log(req.method, req.url);

      res.send('Exit');

      this.notifyExit();
    });
  }

  exit() {
    if (!this.server) {
      return;
    }

    this.log('Exiting worker');

    this.server.close();
    this._sockets.forEach((socket) => socket.destroy());

    this.server = undefined;
    this._sockets = undefined;

    cluster.worker.disconnect();

    process.removeAllListeners('message');
  }

  log(...args) {
    console.log(`[Worker: ${this.id}]`, ...args);
  }

  notifyExit() {
    process.send(MESSAGE_EXIT);
  }

  start() {
    // Workers share the TCP connection in this server
    // All workers use this port
    this.server = this.app.listen(config.port);

    this.server.on('listening', this._onListening.bind(this));

    this.server.on('connection', this._onConnection.bind(this));

    process.on('message', this._onMessage.bind(this));
  }

  _onConnection(socket) {
    this.log('Got connection on port', socket.localPort);

    this._sockets.push(socket);

    socket.on('close', this._onSocketClose.bind(this, socket));
  }

  _onListening() {
    const address = this.server.address();

    this.log(
      'Server started listening',
      'IPv6' === address.family ? `[${address.address}]:${address.port}` : `${address.address}:${address.port}`
    );
  }

  _onMessage(message) {
    this.log('Got message', message);

    switch (message) {
      case MESSAGE_EXIT:
        this.exit();
        break;
    }
  }

  _onSocketClose(socket, hadError) {
    this.log('Socket closed');

    if (!this._sockets) {
      return;
    }

    this._sockets.splice(this._sockets.indexOf(socket), 1);
  }
}


module.exports = Worker;
