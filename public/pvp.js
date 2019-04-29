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

		if (character_json["name"]) {
			const char_name = document.createElement("h1");
			char_name.innerHTML = character_json["name"];
			results.appendChild(char_name);
		}

		if (character_json["realm"]) {
			const realm_name = document.createElement("p");
			realm_name.innerHTML = character_json["realm"];
			results.appendChild(realm_name);
		}

		if (character_json["level"]) {
			const level = document.createElement("p");
			level.innerHTML = character_json["level"];
			results.appendChild(level);
		}

		if (character_json["achievementPoints"]) {
			const achievement_points = document.createElement("p");
			achievement_points.innerHTML = character_json["achievementPoints"];
			results.appendChild(achievement_points);
		}

		if (items["averageItemLevel"]) {
			const avg_item_level = document.createElement("p");
			avg_item_level.innerHTML = items["averageItemLevel"];
			results.appendChild(avg_item_level);
		}

		if (items["head"]) {
			const head = document.createElement("p");
			const item = document.createElement("p");
			head.innerHTML = "Head: ";
			item.innerHTML = items["head"]["name"];
			item.classList += findItemQuality(items["head"]["quality"]);
			results.appendChild(head);
			results.appendChild(item);
		}

		if (items["neck"]) {
			const neck = document.createElement("p");
			const item = document.createElement("p");
			neck.innerHTML = "Neck: ";
			item.innerHTML = items["neck"]["name"];
			item.classList += findItemQuality(items["neck"]["quality"]);
			results.appendChild(neck);
			results.appendChild(item);
		}

		if (items["shoulder"]) {
			const shoulder = document.createElement("p");
			shoulder.innerHTML = "Shoulder: " + items["shoulder"]["name"];
			results.appendChild(shoulder);
		}

		if (items["back"]) {
			const back = document.createElement("p");
			back.innerHTML = "Back: " + items["back"]["name"];
			results.appendChild(back);
		}

		if (items["chest"]) {
			const chest = document.createElement("p");
			chest.innerHTML = "Chest: " + items["chest"]["name"];
			results.appendChild(chest);
		}

		if (items["wrist"]) {
			const wrist = document.createElement("p");
			wrist.innerHTML = "Wrist: " + items["wrist"]["name"];
			results.appendChild(wrist);
		}

		if (items["hands"]) {
			const hands = document.createElement("p");
			hands.innerHTML = "Hands: " + items["hands"]["name"];
			results.appendChild(hands);
		}

		if (items["waist"]) {
			const waist = document.createElement("p");
			waist.innerHTML = "Waist: " + items["waist"]["name"];
			results.appendChild(waist);
		}

		if (items["legs"]) {
			const legs = document.createElement("p");
			legs.innerHTML = "Legs: " + items["legs"]["name"];
			results.appendChild(legs);
		}

		if (items["feet"]) {
			const feet = document.createElement("p");
			feet.innerHTML = "Feet: " + items["feet"]["name"];
			results.appendChild(feet);
		}

		if (items["finger1"]) {
			const finger1 = document.createElement("p");
			finger1.innerHTML = "Ring: " + items["finger1"]["name"];
			results.appendChild(finger1);
		}

		if (items["finger2"]) {
			const finger2 = document.createElement("p");
			finger2.innerHTML = "Ring: " + items["finger2"]["name"];
			results.appendChild(finger2);
		}

		if (items["trinket1"]) {
			const trinket1 = document.createElement("p");
			trinket1.innerHTML = "Trinket: " + items["trinket1"]["name"];
			results.appendChild(trinket1);
		}

		if (items["trinket2"]) {
			const trinket2 = document.createElement("p");
			trinket2.innerHTML = "Trinket: " + items["trinket2"]["name"];
			results.appendChild(trinket2);
		}

		if (items["mainHand"]) {
			const mainhand = document.createElement("p");
			mainhand.innerHTML = "Main Hand: " + items["mainHand"]["name"];
			results.appendChild(mainhand);
		}

		if (items["offHand"]) {
			const offhand = document.createElement("p");
			offhand.innerHTML = "Off Hand: " + items["offHand"]["name"];
			results.appendChild(offhand);
		}
	}

	function findItemQuality(quality) {
		var item_quality = "";
		switch (quality) {
			case 0:
				item_quality = "poor";
				break;
			case 1:
				item_quality = "common";
				break;
			case 2:
				item_quality = "uncommon";
				break;
			case 3:
				item_quality = "rare";
				break;
			case 4:
				item_quality = "epic";
				break;
			case 5:
				item_quality = "legendary";
				break;
			case 6:
				item_quality = "artifact";
				break;
			default:
				item_quality = "poor";
		}
		return item_quality;
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