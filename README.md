# express-cluster-sample

Sample Express application using Cluster.

This sample app uses [Express] to serve HTTP server,
and spawns multiple child processes (workers) using [Node.js Cluster module].
With this sample app, the master process will spawn `os.cpus().length` workers.

All workers send and receive messages to and from the master process respectively with IPC channels.
When one of workers gets `/exit` request, the worker sends a `EXIT` message to the master process.
When the master process receives `EXIT` message, it spreads the message to all workers.
Finally, when workers receive `EXIT` message, they discard connections they have, disconnect its IPC channel, and remove event listeners.
In this way, all worker processes will eventually cease running.

## Installation

``` bash
$ git clone https://github.com/kulikala/express-cluster-sample.git
$ cd express-cluster-sample
$ npm install
```

## Usage

``` bash
$ npm start
```

Access `http://localhost:8080/` to serve initial page.

Access `http://localhost:8080/exit` to discard all connections on each cluster workers.
The master process will eventually cease running.

[Express]: http://expressjs.com/
[Node.js Cluster module]: https://nodejs.org/api/cluster.html
