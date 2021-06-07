const express = require('express');
const notificationsRouter = express.Router();

module.exports = function(io) {

  notificationsRouter.post('/', function(req, res) {
    io.emit('DRAW-GEOMETRY', req.body.data)
    res.status(201).json(req.body);
  });

  return notificationsRouter;
}