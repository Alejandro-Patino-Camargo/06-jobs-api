/* module set-up  */
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const connectDB = require('./db/connect')

/* extra security packages */
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

/*  middleware to authenticate user */
const authenticateUser = require('./middleware/authentication')

/* Routers */
const authRouter = require('./routes/auth');
const songsRouter = require('./routes/songs');

/* error handler */
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

/* extra packages */
app.set('trust proxy', 1);
app.use(rateLimiter({
  windowsMs: 15 * 60 * 100, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

/* routes */
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, songsRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
