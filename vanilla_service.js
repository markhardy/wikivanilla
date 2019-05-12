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
var http = require('http');
var pug = require('pug');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mysql = require('mysql');
const BnetStrategy = require('passport-bnet').Strategy;
const BNET_ID = "8060d2f0f7894639b5738ea875f95fb1";
const BNET_SECRET = "NOY9SPJooNxocG2IFeSYDv917bNShNNl";

// Dependcies for working with the Blizzard API //
//const Promise = require("bluebird");
const request = require("request");
const rp = require("request-promise");
const R = require("ramda");
const tmp = require("tmp");
const fs = require("fs");

const credentials = {
  client: {
    id: "8060d2f0f7894639b5738ea875f95fb1",
    secret: "NOY9SPJooNxocG2IFeSYDv917bNShNNl"
  },
  auth: {
    tokenHost: "https://us.battle.net"
  }
};
let token = null;

const oauth2 = require("simple-oauth2").create(credentials);

const gm = require("gm").subClass({ imageMagick: true });
// End Blizzard API Dependencies //


app.use(express.static('public'));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers",
	"Origin, X-Requested-With, Content-Type, Accept");
	next();
});

console.log("web service started");

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

// Server the index page
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

	var sql_query = "SELECT * FROM item_template i WHERE i.name LIKE '" + "%" + search + "%" + "' ORDER BY i.Quality DESC, i.name ASC";

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

	var sql_query = "SELECT c.Entry, c.Name, c.MinLevel, c.MaxLevel, c.CreatureType FROM creature_template c WHERE c.name LIKE '" + "%" + search + "%" + "' ORDER BY c.name ASC";

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
app.get('/questsearch', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const search = req.query.search;
	var json = {};

	var sql_query = "SELECT q.Title, q.entry, q.MinLevel, q.QuestLevel, q.RequiredRaces FROM quest_template q WHERE q.Title LIKE '" + "%" + search + "%" + "' ORDER BY q.QuestLevel ASC";

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

// Blizzard API //
// For use later //

const getToken = () => {
  if (token === null || token.expired()) {
    return oauth2.clientCredentials
      .getToken()
      .then(oauth2.accessToken.create)
      .then(t => {
        token = t;
        return t.token.access_token;
      });
  } else {
    return Promise.resolve(token.token.access_token);
  }
};

const getClasses = () => {
  return getToken()
    .then(token => {
      return rp.get({
        uri: `https://us.api.blizzard.com/wow/data/character/classes`,
        json: true,
        qs: {
          locale: "en_US"
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    })
    .then(classes => classes.classes)
    .then(R.map(c => R.objOf(c.id, c.name)))
    .then(R.mergeAll);
};

const getImage = character => {
  return new Promise((resolve, reject) => {
    const avatarUrl = `https://render-us.worldofwarcraft.com/character/${character.thumbnail.replace(
      "-avatar.jpg",
      "-inset.jpg"
    )}`;

    const tmpName = tmp.tmpNameSync();

    // Download avatar
    request(avatarUrl)
      .pipe(fs.createWriteStream(tmpName))
      .on("finish", () => {
        gm("./empty.png")
          .in("-page", "+2+2")
          .in(tmpName)
          .in("-page", "+0+0")
          .in(`./images/background-${character.faction}.png`)
          .mosaic()
          .font("./fonts/merriweather/Merriweather-Bold.ttf")
          .fontSize("30")
          .fill("#deaa00")
          .drawText(220, 40, character.name)
          .font("./fonts/merriweather/Merriweather-Regular.ttf")
          .fontSize("12")
          .fill("#888888")
          .drawText(
            220,
            65,
            `Level ${character.level} ${character.className} ${
              character.guild ? `of <${character.guild.name}> ` : ""
            }on ${character.realm}`
          )
          .drawText(
            220,
            85,
            `Item Level: ${character.items.averageItemLevel} (${
              character.items.averageItemLevelEquipped
            })`
          )
          .drawText(
            220,
            105,
            `Achievement Points: ${character.achievementPoints}`
          )
          .toBuffer("PNG", (err, buffer) => {
            if (err) {
              reject(err);
            } else {
              resolve(buffer);
            }

            fs.unlinkSync(tmpName);
          });
      });
  });
};

const getCharacter = (name, realm) => {
  return getToken().then(token => {
    return rp.get({
      uri: `https://us.api.blizzard.com/wow/character/${realm.toLowerCase()}/${name.toLowerCase()}`,
      json: true,
      qs: {
        fields: "guild,items",
        locale: "en_US"
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  });
};

const getSignature = (name, realm) => {
  return Promise.all([getCharacter(name, realm), getClasses()])
    .spread((character, classes) => {
      return R.assoc("className", classes[character.class], character);
    })
    .then(getImage);
};

app.get("/signature", (req, res) =>
  getSignature(req.query.characterName, req.query.realmName)
    .then(buffer => {
      res.set("Content-Type", "image/png");
      return res.send(buffer);
    })
    .catch(err => {
      res.json(err.message);
    })
);

app.get("/character", (req, res) =>
  getCharacter(req.query.characterName, req.query.realmName)
    .then(buffer => {
      //res.set("Content-Type", "image/png");
      return res.send(buffer);
    })
    .catch(err => {
      res.json(err.message);
    })
);

module.exports = app;




app.listen(process.env.PORT);
