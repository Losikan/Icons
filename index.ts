import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import path from 'path';
import authRoutes from './routes/authRoutes';
import pageRoutes from './routes/pageRoutes';
import './models/User';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'jouw_geheime_sleutel',
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/mijn_database',
    ttl: 24 * 60 * 60
  }),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

mongoose.connect('mongodb://localhost:27017/mijn_database')
  .then(() => console.log('Verbonden met MongoDB'))
  .catch(err => console.error('MongoDB-verbindingsfout:', err));

app.use('/', pageRoutes);
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server draait op http://localhost:${PORT}`));

export default app;