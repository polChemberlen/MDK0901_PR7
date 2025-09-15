import express from "express";
import session from "express-session";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));


let users = [];

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    //проверка уникальность имени пользователя
    if (users.find(user => user.username === username)) {
        return res.send('Имя уже занято');
    }

    //добавление нового пользователя в массив
    users.push({ username, password });
    res.redirect('/login');

});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = users.find(user => username === user.username && user.password === password);

    if (user) {
        req.session.user = user; // Сохранение юзера в сессии
        res.redirect('/profile');
    } else {
        res.send('Неверное имя пользователя или пароль');
    }
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/logout', (req,res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/', (req,res) => {
    if (req.session.user) {
        res.redirect('/profile');
    } else {
        res.redirect('/register');
    }
});

try {
    app.listen(PORT, () => console.log('ыть ' + PORT));
} catch (e) {
    console.log(e.message)
};