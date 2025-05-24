import session from 'express-session';
import MongoStore from 'connect-mongo';

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI!,
    ttl: 24 * 60 * 60 // 1 dag
  }),
  cookie: { secure: false }
});
