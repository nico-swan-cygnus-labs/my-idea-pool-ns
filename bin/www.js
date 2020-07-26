#!/usr/bin/env node
/**
 * Module dependencies.
 */

import expressSwagger from 'express-swagger-generator';
import { createServer } from 'http';
import { default as morgan } from 'morgan';
import path from 'path';
import { default as rfs } from 'rotating-file-stream';
import app from '../app.js';
import Database from '../src/persistence/mongodb/database.js';
import { NotFound } from '../src/services/errors/request.js';

/** 
 * Setup database connection
 */
let db = new Database(app);
db.connect();

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(path.resolve(), 'log')
})

// setup the logger
//app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('combined'));
// Set not found, must be before swagger docs
app.use((req, res, next) => {
  if (req.path.indexOf('api-docs') == -1) {
    res.status(404);
    const notFoundError = new NotFound(req);
    res.send(notFoundError.toJson(req.xDebugShowStackTrace));
  } else {
    next()
  }
});
/**
 * Get port from environment and store in Express.
 */

const port = process.env.PORT || '3300';
app.set('port', port);

const hostName = process.env.DOMAIN_NAME || 'localhost';
app.set('hostName', hostName);

const options = app.get('swaggerOptions');
options.host = `${hostName}`;
expressSwagger(app)(options);

/**
 * Create HTTP server.
 */

let server = createServer(app);

/**
 * Listeners.
 */
server.on('listening', onListening);
server.on('error', onError);
app.on('event:db-connected', onDBConnected)
process.on('SIGTERM', onClose);

/**
 * 
 * On Database connection set app db
 */
function onDBConnected(db) {
  console.log('Database connected');
  app.set('db', db);
  server.listen(port);
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  console.log('Application started');
}
/**
 * Event listener for when application is shutting down.
 */
function onClose() {

  server.close(function () {
    console.log("Closed out remaining connections.");
    let db = app.get('db');
    db.close();
  });

  setTimeout(function () {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 30 * 1000);

}
