const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
const app = express();

// Configuratie
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Sessie configuratie met MongoDB-opslag
app.use(session({
  secret: 'jouw_geheime_sleutel',
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/mijn_database',
    ttl: 24 * 60 * 60 // 1 dag
  }),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Zet op true bij HTTPS
}));

// MongoDB verbinding
mongoose.connect('mongodb://localhost:27017/mijn_database')
  .then(() => console.log('Verbonden met MongoDB'))
  .catch(err => console.error('MongoDB-verbindingsfout:', err));

// Gebruikersmodel
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String
}));

// Routes
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ 
      $or: [{ email: req.body.email }, { username: req.body.email }]
    });

    if (user && await bcrypt.compare(req.body.password, user.password)) {
      req.session.userId = user._id;
      return res.redirect('/dashboard');
    }
    res.render('login', { error: 'Ongeldige inloggegevens' });
  } catch (error) {
    res.status(500).render('login', { error: 'Serverfout' });
  }
});

app.get('/register', (req, res) => res.render('registreren'));

app.post('/register', async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.render('registreren', { error: 'Wachtwoorden komen niet overeen' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    await user.save();
    res.redirect('/login');
  } catch (error) {
    let errorMessage = 'Registratiefout';
    if (error.code === 11000) {
      errorMessage = error.keyValue.email ? 'Email bestaat al' : 'Gebruikersnaam bestaat al';
    }
    res.render('registreren', { error: errorMessage });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Wachtwoord reset (basisimplementatie)
app.post('/resetpassword', async (req, res) => {
  // Implementeer hier e-mail verificatie en token logica
  res.render('resetpassword', { message: 'Resetlink verstuurd naar je e-mail' });
});

// Server starten
app.listen(3000, () => console.log('Server draait op http://localhost:3000'));