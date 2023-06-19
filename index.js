const { query } = require("express");
const express = require("express");
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));

const mysql = require('mysql');
const connect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nitrocol.bdd",
})

app.set('view engine', "ejs");
app.set('views', "./views");

app.listen(8083, () => {
    console.log("Le serveur tourne sur la page http://127.0.0.1:8083");
});

app.use(express.json());

connect.connect((err) => {
    if (err) throw err;
    console.log("Oui ça fonctionne");
    connect.query("SELECT * FROM users;", function (err, result) {
        if (err) throw (err);
        console.log(result);
    })
})

app.post('/dashboard', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    
    if (username && password) {
        connect.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (error, result) {
            if (error) throw error;
            
            if (result.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                
                connect.query("SELECT * FROM produits;", function (err, produitsResult) {
                    if (err) throw err;
                    
                    connect.query("SELECT * FROM users;", function (err, usersResult) {
                        if (err) throw err;
                        
                        response.render("dashboard", { user: result, produit: produitsResult, userList: usersResult });
                    });
                });
            } else {
                response.send('Identifiant ou mot de passe incorrect');
            }
        });
    } else {
        response.send('Veuillez entrer un identifiant et un mot de passe');
    }
});




app.get("/", (request, response) => {
    response.render("login")
})


//add
app.post("/addUser", (request, response) => {
    const querys = "INSERT INTO users (username , password , f_name , l_name , img) VALUES ('" + request.body.username + "', '" + request.body.password + "', '" + request.body.f_name + "', '" + request.body.l_name + "', '" + request.body.img + "')"
    console.log(querys);
    connect.query(querys, function (err, result) {
        if (err) throw err;
        console.log(result);
        response.redirect('/dashboard')
    })
});

app.post("/addProduct", (request, response) => {
    const querys = "INSERT INTO produits (titre, descriptions , img , dates , avis , prix) VALUES ('" + request.body.titre + "', '" + request.body.description + "', '" + request.body.img + "', '" + request.body.dates + "', '" + request.body.avis + "', '" + request.body.prix + "')"
    console.log(querys);
    connect.query(querys, function (err, result) {
        if (err) throw err;
        console.log(result);
        response.redirect('/dashboard')
    })
});

