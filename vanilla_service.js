/***************************************************************************
vanilla_service.js

Web service that largely executes SQL queries to the database and returns
the JSON back to the client.

Created by: Mark Hardy
Last Updated: 4/24/2019
***************************************************************************/

"use strict";

const express = require("express");
const app = express();
//const fs = require('fs');
var http = require('http');
var pug = require('pug');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mysql = require('mysql');
const BnetStrategy = require('passport-bnet').Strategy;
const BNET_ID = "8060d2f0f7894639b5738ea875f95fb1";
const BNET_SECRET = "NOY9SPJooNxocG2IFeSYDv917bNShNNl";

app.use(express.static('public'));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers",
	"Origin, X-Requested-With, Content-Type, Accept");
	next();
});

console.log("web service started");

// Use the BnetStrategy within Passport.
passport.use(new BnetStrategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: "https://wikivanilla.herokuapp.com/auth/bnet/callback",
    region: "us"
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

/***************************************************************************
*************************** MySQL Configuration ****************************
***************************************************************************/

const connection = mysql.createConnection({

  host     : '35.184.40.74',
  user     : 'root',
  password : 'A66056504',
  database : 'mangos0',
  debug    : "true"
});

connection.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");

});

/**************************************************************************/

/***************************************************************************
****************************** Blizzard  API *******************************
***************************************************************************/
/*app.get('/auth/bnet',
    passport.authenticate('bnet'));

app.get('/auth/bnet/callback',
    passport.authenticate('bnet', { failureRedirect: '/' }),
    function(req, res){
        res.redirect('/authenticated');
    });*/

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/' }),
        function(req, res){
          res.redirect('/');
        });

app.get('/auth/bnet',
        passport.authenticate('bnet'));

app.get('/auth/bnet/callback',
        passport.authenticate('bnet', { failureRedirect: '/' }),
        function(req, res){
          res.redirect('/');
        });

app.get('/oauthtest', function(req, res) {
  if(req.isAuthenticated()) {
    var output = '<h1>Express OAuth Test</h1>' + req.user.id + '<br>';
    if(req.user.battletag) {
      output += req.user.battletag + '<br>';
    }
    output += '<a href="/logout">Logout</a>';
    res.send(output);
  } else {
    res.send('<h1>Express OAuth Test</h1>' +
             '<a href="/auth/github">Login with Github</a><br>' +
             '<a href="/auth/bnet">Login with Bnet</a>');
  }
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

/**************************************************************************/


// Not used
app.get('/', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");

	res.redirect('index.html');

});


/***************************************************************************
get/loot
Queries the database for information on a creature that drops and item
if applicable.
***************************************************************************/
app.get('/loot', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const item_id = req.query.item_id;
	var json = {};

	var sql_query = "SELECT c.Name, c.MinLevel, c.MaxLevel, l.ChanceOrQuestChance FROM creature_template c INNER JOIN creature_loot_template l WHERE l.item = '" + item_id + "' AND c.Entry = l.entry ORDER BY l.ChanceOrQuestChance ASC";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["result"] = result;

		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
})

app.get('/pvp', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const character = req.query.character;
	const realm = req.query.realm;

	var json = {};

	var sql_query = "SELECT c.Name, c.MinLevel, c.MaxLevel, l.ChanceOrQuestChance FROM creature_template c INNER JOIN creature_loot_template l WHERE l.item = '" + item_id + "' AND c.Entry = l.entry ORDER BY l.ChanceOrQuestChance ASC";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["result"] = result;

		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
})


/***************************************************************************
get/search
Searches the database for items the user may be looking for.
***************************************************************************/
app.get('/search', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const search = req.query.search;
	var json = {};

	var sql_query = "SELECT * FROM item_template i WHERE i.name = '" + search + "' ORDER BY i.Quality DESC, i.name ASC";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["result"] = result;
		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
})

/***************************************************************************
get/search
Searches the database for items the user may be looking for.
***************************************************************************/
app.get('/npcsearch', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const search = req.query.search;
	var json = {};

	var sql_query = "SELECT c.Entry, c.Name, c.MinLevel, c.MaxLevel, c.CreatureType FROM creature_template c WHERE c.name = '" + search + "' ORDER BY c.name ASC";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["result"] = result;
		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
})

/***************************************************************************
get/item
Queries the database for information on a specific item.
***************************************************************************/
app.get('/item', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const item_id = req.query.item_id;
	var json = {};

	var sql_query = "SELECT * FROM item_template i WHERE i.entry = '" + item_id + "'";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["result"] = result;
		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
})


app.listen(process.env.PORT);
