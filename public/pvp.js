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
	function get() {
		// Removing < and > to prevent SQL injections
		var char_search = document.getElementById("character").value.replace("<", "");
		var realm_search = document.getElementById("realm").value.replace("<", "");
		const character = char_search.replace(">", "");
		const realm = realm_search.replace(">", "");

		var url = "https://wikivanilla.herokuapp.com/search?search=" + validated;
		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
			})

			.catch(function(error) {
			});
	}

	window.onload = function() {
		var search_btn = document.getElementById("search_btn");
		search_btn.onclick = get;
	}

}());