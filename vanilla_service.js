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

const config = fs.readFileSync("config.txt", "utf8");

var options = {
	index : "index.html"
};

app.use(express.static('public', options));

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
  debug    : "true",
  multipleStatements : "true"
});

connection.connect(function (err) {
	if (err) throw err;
	console.log("Connected!");

});

// Server the index page
app.get('/', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");

	//res.redirect('index.html');

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

	var sql_query = "SELECT * FROM item_template i WHERE i.name LIKE '" + "%" + search + "%" + "' ORDER BY i.Quality DESC, i.name ASC; SELECT c.Entry, c.Name, c.MinLevel, c.MaxLevel, c.CreatureType FROM creature_template c WHERE c.name LIKE '" + "%" + search + "%" + "' ORDER BY c.name ASC; SELECT q.Title, q.entry, q.MinLevel, q.QuestLevel, q.RequiredRaces FROM quest_template q WHERE q.Title LIKE '" + "%" + search + "%" + "' ORDER BY q.QuestLevel ASC";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["items"] = result[0];
		json["creatures"] = result[1];
		json["quests"] = result[2];
		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});

/*
	var creatures = connection.query(creatures_sql_query, function(err, result, fields) {
		if (err) throw err;
		json["creatures"] = creatures;
	});

	var quests = connection.query(quests_sql_query, function(err, result, fields) {
		if (err) throw err;
		json["quests"] = quests;
		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
*/
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

/***************************************************************************
get/creature
Queries the database for information on a specific creature.
***************************************************************************/
app.get('/npc', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const npc_id = req.query.npc_id;
	var json = {};

	var sql_query = "SELECT * FROM creature_template c WHERE c.Entry = '" + npc_id + "'";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["result"] = result;
		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
})

/***************************************************************************
get/creature
Queries the database for information on a specific creature.
***************************************************************************/
app.get('/quest', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	const quest_id = req.query.quest_id;
	var json = {};

	var sql_query = "SELECT * FROM quest_template q WHERE q.entry = '" + quest_id + "'";

	var result = connection.query(sql_query, function(err, result, fields) {
		if (err) throw err;
		json["result"] = result;
    json["zones"] = findZones();
		console.log("Sent JSON to client");
		res.send(JSON.stringify(json));
	});
})

/***************************************************************************
get/creature
Queries the database for information on a specific creature.
***************************************************************************/
app.get('/prev_quest', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  const prev_quest_id = req.query.prev_quest_id;
  var json = {};

  var sql_query = "SELECT q.Title, q.Entry FROM quest_template q WHERE q.entry = '" + prev_quest_id + "'";

  var result = connection.query(sql_query, function(err, result, fields) {
    if (err) throw err;
    json["result"] = result;
    console.log("Sent JSON to client");
    res.send(JSON.stringify(json));
  });
})

/***************************************************************************
get/creature
Queries the database for information on a specific creature.
***************************************************************************/
app.get('/itemlink', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  const item_id1 = req.query.item_id1;
  const item_id2 = req.query.item_id2;
  const item_id3 = req.query.item_id3;
  const item_id4 = req.query.item_id4;
  const item_id5 = req.query.item_id5;
  const item_id6 = req.query.item_id6;

  var json = {};

  var sql_query = "";
  if (item_id2 == "0") {
    sql_query = "SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id1 + "'";
  } else if (item_id3 == "0") {
    sql_query = "SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id1 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id2 + "'";
  } else if (item_id4 == "0") {
    sql_query = "SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id1 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id2 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id3 + "'";
  } else if (item_id5 == "0") {
    sql_query = "SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id1 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id2 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id3 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id4 + "'";
  } else if (item_id6 == "0") {
    sql_query = "SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id1 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id2 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id3 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id4 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id5 + "'";
  } else {
    sql_query = "SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id1 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id2 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id3 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id4 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id5 + "'; SELECT i.name, i.entry, i.Quality FROM item_template i WHERE i.entry = '" + item_id6 + "'";
  }

  var result = connection.query(sql_query, function(err, result, fields) {
    if (err) throw err;

    if (result[0]) {
      json["item1"] = result[0];
    }

    if (result[1]) {
      json["item2"] = result[1];
    }

    if (result[2]) {
      json["item3"] = result[2];
    }

    if (result[3]) {
      json["item4"] = result[3];
    }

    if (result[4]) {
      json["item5"] = result[4];
    }

    if (result[5]) {
      json["item6"] = result[5];
    }

    console.log("Sent JSON to client");
    res.send(JSON.stringify(json));
  });
})

function findZones() {
  let zones = {};

  // go through file and find books 
  let file = fs.readFileSync("files/zones_vanilla.txt", 'utf8');
  let lines = file.split("\n");

  for (var line of lines) {
      var new_line = line.split(", ");
      var values = [];
      values.push(new_line[1]);
      values.push(new_line[2]);
      values.push(new_line[3]);
      zones[new_line[0]] = values;
    }
    return zones;
  }

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




app.listen(process.env.PORT || 3000);
