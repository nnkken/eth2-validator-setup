const express = require('express');
const proxy = require('express-http-proxy');
const { ENDPOINT, DEADLINE_MS } = require('./config.js');

const app = express();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.use('/', (req, res, next) => {
  req._startTime = Date.now();
  next();
}, proxy(ENDPOINT, {
  proxyReqPathResolver: () => ENDPOINT,
  userResDecorator: async (proxyReq, proxyRes, userReq, userRes) => {
    const elasped = Date.now() - userReq._startTime;
    delete userReq._startTime;
    if (elasped < DEADLINE_MS) {
      await sleep(DEADLINE_MS - elasped);
    }
    return proxyRes;
  },
}));

app.listen(8080);
