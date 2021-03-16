// setting up server with express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const userRouter = require('./routes/userRoutes');
const routeRouter = require('./routes/routeRoutes');

const AppError = require('./services/appError');
const errorHandler = require('./services/errorHandler');

const server = express();

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.JWK}`,
    }),
    audience: `${process.env.aud}`,
    issuer: `${process.env.issuer}`,
    algorithms: [`${process.env.algo}`],
});

// middlware
if (process.env.NODE_ENV === 'development') {
    server.use(morgan('dev'));
}
server.use(cors());
server.use(jwtCheck);
server.use(express.json());

// routes
server.use('/api/v1/users', userRouter);
server.use('/api/v1/routes', routeRouter);

// NO MATCHED ROUTES CATCHER(must be at bottom), .all = all http verbs, * is like uni selector but for routes
server.all('*', (req, resp, next) => {
    next(new AppError(`Cannot find route for URL-PATH: ${req.originalUrl}`, 404));
});

// 4 params tells express that this is a error handling middleware
server.use(errorHandler);

module.exports = server;
