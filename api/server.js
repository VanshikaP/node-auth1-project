const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session');
const knexStore = require('connect-session-knex')(session);

const usersRouter = require("../users/users-router.js");
const authRouter = require('../auth/auth-router.js');
const restricted = require('../auth/restricted-middleware.js');
const knex = require('../data/db-config.js');

const server = express();

const sessionConfig = {
  name: 'cookie monster',
  secret: 'keep it secret, keep it safe!',
  cookie: {
    maxAge:  1000 * 60 * 10,
    secure: false, // true in prod to send only over https
    httpOnly: true, // true means no access from JS
  },
  resave: false,
  saveUninitialized: true, // GDPR laws require to check with client
  store: new knexStore({
      knex,
      tablename: 'sessions',
      createtable: true,
      sidfieldname: 'sid',
      clearInterval: 1000 * 60 * 15
  })
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/users", restricted, usersRouter);
server.use('/api/auth', authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
