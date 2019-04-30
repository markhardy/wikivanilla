/***************************************************************************
character.js

When a user searches for a character and realm, this file connects to the 
Blizzard API and returns data on that character.

Created by: Mark Hardy
Last Updated: 4/26/2019
***************************************************************************/

"use strict";

(function(){

	/***************************************************************************
	getCharacter()
	Sends a request to the Blizzard API asking for information on a character
	by sending the character name and realm name
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

	/***************************************************************************
	displayCharacter()
	Takes JSON data returned by the Blizzard API and uses it to display data
	on the selected character.
	***************************************************************************/
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
			realm_name.innerHTML = "Realm: " + character_json["realm"];
			results.appendChild(realm_name);
		}

		if (character_json["level"]) {
			const level = document.createElement("p");
			level.innerHTML = "Level: " + character_json["level"];
			results.appendChild(level);
		}

		if (character_json["achievementPoints"]) {
			const achievement_points = document.createElement("p");
			achievement_points.innerHTML = "Achievement Points: " + character_json["achievementPoints"];
			results.appendChild(achievement_points);
		}

		if (items["averageItemLevel"]) {
			const avg_item_level = document.createElement("p");
			avg_item_level.innerHTML = "Average Item Level: " + items["averageItemLevel"];
			results.appendChild(avg_item_level);
		}

		if (items["head"]) {
			const head = document.createElement("p");
			const item = document.createElement("p");
\			head.innerHTML = "Head: ";
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
			const item = document.createElement("p");
			shoulder.innerHTML = "Shoulder: ";
			item.innerHTML = items["shoulder"]["name"];
			item.classList += findItemQuality(items["shoulder"]["quality"]);
			results.appendChild(shoulder);
			results.appendChild(item);
		}

		if (items["back"]) {
			const back = document.createElement("p");
			const item = document.createElement("p");
			back.innerHTML = "Back: ";
			item.innerHTML = items["back"]["name"];
			item.classList += findItemQuality(items["back"]["quality"]);
			results.appendChild(back);
			results.appendChild(item);
		}

		if (items["chest"]) {
			const chest = document.createElement("p");
			const item = document.createElement("p");
			chest.innerHTML = "Chest: ";
			item.innerHTML = items["chest"]["name"];
			item.classList += findItemQuality(items["chest"]["quality"]);
			results.appendChild(chest);
			results.appendChild(item);
		}

		if (items["wrist"]) {
			const wrist = document.createElement("p");
			const item = document.createElement("p");
			wrist.innerHTML = "Wrist: ";
			item.innerHTML =  items["wrist"]["name"];
			item.classList += findItemQuality(items["wrist"]["quality"]);
			results.appendChild(wrist);
			results.appendChild(item);
		}

		if (items["hands"]) {
			const hands = document.createElement("p");
			const item = document.createElement("p");
			hands.innerHTML = "Hands: ";
			item.innerHTML = items["hands"]["name"];
			item.classList += findItemQuality(items["hands"]["quality"]);
			results.appendChild(hands);
			results.appendChild(item);
		}

		if (items["waist"]) {
			const waist = document.createElement("p");
			const item = document.createElement("p");
			const image = document.createElement("img");
			image.src = "https://dl.dropboxusercontent.com/s/m0in7o0lvivro7l/INV_Belt_02.png?dl=0";
			waist.innerHTML = "Waist: ";
			item.innerHTML = items["waist"]["name"];
			item.classList += findItemQuality(items["waist"]["quality"]);
			item.appendChild(image);
			results.appendChild(waist);
			results.appendChild(item);
		}

		if (items["legs"]) {
			const legs = document.createElement("p");
			const item = document.createElement("p");
			legs.innerHTML = "Legs: ";
			item.innerHTML = items["legs"]["name"];
			item.classList += findItemQuality(items["legs"]["quality"]);
			results.appendChild(legs);
			results.appendChild(item);
		}

		if (items["feet"]) {
			const feet = document.createElement("p");
			const item = document.createElement("p");
			feet.innerHTML = "Feet: ";
			item.innerHTML = items["feet"]["name"];
			item.classList += findItemQuality(items["feet"]["quality"]);
			results.appendChild(feet);
			results.appendChild(item);
		}

		if (items["finger1"]) {
			const finger1 = document.createElement("p");
			const item = document.createElement("p");
			finger1.innerHTML = "Ring: ";
			item.innerHTML = items["finger1"]["name"];
			item.classList += findItemQuality(items["finger1"]["quality"]);
			results.appendChild(finger1);
			results.appendChild(item);
		}

		if (items["finger2"]) {
			const finger2 = document.createElement("p");
			const item = document.createElement("p");
			finger2.innerHTML = "Ring: ";
			item.innerHTML = items["finger2"]["name"];
			item.classList += findItemQuality(items["finger2"]["quality"]);
			results.appendChild(finger2);
			results.appendChild(item);
		}

		if (items["trinket1"]) {
			const trinket1 = document.createElement("p");
			const item = document.createElement("p");
			trinket1.innerHTML = "Trinket: ";
			item.innerHTML = items["trinket1"]["name"];
			item.classList += findItemQuality(items["trinket1"]["quality"]);
			results.appendChild(trinket1);
			results.appendChild(item);
		}

		if (items["trinket2"]) {
			const trinket2 = document.createElement("p");
			const item = document.createElement("p");
			trinket2.innerHTML = "Trinket: ";
			item.innerHTML = items["trinket2"]["name"];
			item.classList += findItemQuality(items["trinket2"]["quality"]);
			results.appendChild(trinket2);
			results.appendChild(item);
		}

		if (items["mainHand"]) {
			const mainhand = document.createElement("p");
			const item = document.createElement("p");
			mainhand.innerHTML = "Main Hand: ";
			item.innerHTML = items["mainHand"]["name"];
			item.classList += findItemQuality(items["mainHand"]["quality"]);
			results.appendChild(mainhand);
			results.appendChild(item);
		}

		if (items["offHand"]) {
			const offhand = document.createElement("p");
			const item = document.createElement("p");
			offhand.innerHTML = "Off Hand: ";
			item.innerHTML = items["offHand"]["name"];
			item.classList += findItemQuality(items["offHand"]["quality"]);
			results.appendChild(offhand);
			results.appendChild(item);
		}
	}

	/***************************************************************************
	findItemQuality()
	Takes an integer sent by Blizzard and translates it into a string that is 
	used to set the item's color in the CSS file.
	***************************************************************************/
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