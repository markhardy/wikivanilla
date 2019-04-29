/***************************************************************************
pvp.js

When a user searches for a character and realm, this file connect to the 
Blizzard API and returns data on that character's PvP performance.

Created by: Mark Hardy
Last Updated: 4/26/2019
***************************************************************************/

"use strict";

(function(){

	/***************************************************************************
	get()
	Sends a search request to the web server and passes the results to be
	displayed to the client.
	***************************************************************************/
	function getCharacter() {
		// Removing < and > to prevent SQL injections
		var char_search = document.getElementById("character").value.replace("<", "");
		var realm_search = document.getElementById("realm").value.replace("<", "");
		const character = char_search.replace(">", "");
		const realm = realm_search.replace(">", "");

		var url = "https://wikivanilla.herokuapp.com/character?characterName=" + character + "&realmName=" + realm;
		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				displayCharacter(json);
			})

			.catch(function(error) {
			});
	}

	function displayCharacter(character_json) {
		const items = character_json["items"];
		const results = document.getElementById("results");
		const char_name = document.createElement("h1");
		const realm_name = document.createElement("p");
		const level = document.createElement("p");
		const achievement_points = document.createElement("p");
		const avg_item_level = document.createElement("p");
		const head = document.createElement("p");
		const neck = document.createElement("p");
		const shoulder = document.createElement("p");
		const back = document.createElement("p");
		const chest = document.createElement("p");
		const wrist = document.createElement("p");
		const hands = document.createElement("p");
		const waist = document.createElement("p");
		const legs = document.createElement("p");
		const feet = document.createElement("p");
		const finger1 = document.createElement("p");
		const finger2 = document.createElement("p");
		const trinket1 = document.createElement("p");
		const trinket2 = document.createElement("p");
		const mainhand = document.createElement("p");
		const offhand = document.createElement("p");
		const ranged = document.createElement("p");

		char_name.innerHTML = character_json["name"];
		realm_name.innerHTML = character_json["realm"];
		level.innerHTML = character_json["level"];
		achievement_points.innerHTML = character_json["achievementPoints"];
		avg_item_level.innerHTML = character_json["averageItemLevel"];

		// Here's where it gets complicated. items holds the dictionary of all
		// items the character has equipped and each item slot eg helm has a
		// dictionary of the item's attributes..

		head.innerHTML = "Head: " + items["head"]["name"];
		neck.innerHTML = "Neck: " + items["neck"]["name"];
		shoulder.innerHTML = "Shoulder: " + items["shoulder"]["name"];
		back.innerHTML = "Back: " + items["back"]["name"];
		chest.innerHTML = "Chest: " + items["chest"]["name"];
		wrist.innerHTML = "Wrist: " + items["wrist"]["name"];
		hands.innerHTML = "Hands: " + items["hands"]["name"];
		waist.innerHTML = "Waist: " + items["waist"]["name"];
		legs.innerHTML = "Legs: " + items["legs"]["name"];
		feet.innerHTML = "Feet: " + items["feet"]["name"];
		finger1.innerHTML = "Ring: " + items["finger1"]["name"];
		finger2.innerHTML = "Ring: " + items["finger2"]["name"];
		trinket1.innerHTML = "Trinket: " + items["trinket1"]["name"];
		trinket2.innerHTML = "Trinket: " + items["trinket2"]["name"];
		mainhand.innerHTML = "Main Hand: " + items["mainHand"]["name"];
		offhand.innerHTML = "Off Hand: " + items["offHand"]["name"];
		//ranged.innerHTML = "Ranged: " + items["ranged"]["name"];



		results.appendChild(char_name);
		results.appendChild(realm_name);
		results.appendChild(level);
		results.appendChild(head);
		results.appendChild(neck);
		results.appendChild(shoulder);
		results.appendChild(back);
		results.appendChild(chest);
		results.appendChild(wrists);
		results.appendChild(hands);
		results.appendChild(waist);
		results.appendChild(legs);
		results.appendChild(feet);
		results.appendChild(finger1);
		results.appendChild(finger2);
		results.appendChild(trinket1);
		results.appendChild(trinket2);
		results.appendChild(mainhand);
		results.appendChild(offhand);
		//results.appendChild(ranged);
	}

	/***************************************************************************
	checkStatus(response)
	This method checks the status of the server during a query and either 
	allows our program to continue or reports an error and handles the promise.

	Parameter 1: response - The reply from the service
	Returns a rejection of the promise with a reason or a thumbs up
	***************************************************************************/
	function checkStatus(response) { 
	    if (response.status >= 200 && response.status < 300) {  
	        return response.text();
	    // special reject message for page not found
	    } else if(response.status == 404) {
	    	return Promise.reject(new Error("sorry we do not have any data"));
	    } else {  
	        return Promise.reject(new Error(response.status+": "+response.statusText)); 
	    } 
	}

	window.onload = function() {
		var search_btn = document.getElementById("search_btn");
		search_btn.onclick = getCharacter;
	}

}());