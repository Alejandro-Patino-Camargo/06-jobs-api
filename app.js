/* module set-up  */
require('dotenv').config();
const express = require('express');
require('express-async-errors');
const session = require('express-session');
const MongoDBStore = require("connect-mongodb-session")(session);

/* extra security packages */
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

/* Routers */
const authRouter = require('./routes/auth');
const songsRouter = require('./routes/songs');

/* error handler */
const authenticateUser = require('./middleware/authentication');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const connectDB = require("./db/connect");
const app = express();

/* database connection */
const url = process.env.MONGO_URI;
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

/* session set-up - proxies and cookies*/
// const session_parms = {
//   secret: process.env.SESSION_SECRET,
//   resave: true,
//   saveUninitialized: true,
//   store: store,
//   cookie: { secure: false, sameSite: "strict" },
// };
if (app.get("env") === "production") {
  //SECURITY
  app.set("trust proxy", 1);
  session_parms.cookie.secure = true;
}
// app.use(session(session_parms));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./public'))
app.use(express.json());

/* server protection - request overload */
app.use(
  rateLimiter({
    windowMs: 60 * 1000, // 15 minutes
    max: 60, // each IP is limited to make 100 requests per windowMs
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js",
          "'unsafe-inline'",
        ],
        objectSrc: ["'none'"],
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css",
          "'unsafe-inline'",
        ],
        upgradeInsecureRequests: null,
      },
    },
  })
);
//
app.use(cors());
app.use(xss());

/* routes */
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/songs', authenticateUser, songsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

/** port config */
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();