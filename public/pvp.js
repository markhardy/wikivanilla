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
		/*
		const head = document.createElement("p");
		const head = document.createElement("p");
		const head = document.createElement("p");
		const head = document.createElement("p");
		const head = document.createElement("p");
		const head = document.createElement("p");
		const head = document.createElement("p");
		const head = document.createElement("p");
*/

		char_name.innerHTML = character_json["name"];
		realm_name.innerHTML = character_json["realm"];
		level.innerHTML = character_json["level"];
		achievement_points.innerHTML = character_json["achievementPoints"];
		avg_item_level.innerHTML = character_json["averageItemLevel"];
		head.innerHTML = items["head"]["name"];


		results.appendChild(char_name);
		results.appendChild(realm_name);
		results.appendChild(level);
		results.appendChild(head);
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