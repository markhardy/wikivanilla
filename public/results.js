/***************************************************************************
results.js

Handles client-side programming for Wiki Vanilla search results. 
This file's methods communicate with the vanilla_service.js backend which 
handle SQL queries that this file needs.

Created by: Mark Hardy
Last Updated: 5/10/2019
***************************************************************************/

"use strict";

(function(){
	function getHost() {
		const config = fs.readFileSync("files/config.txt", "utf8");
		const lines = config.split("\n");
		var host = "";
		for (var line of lines) {
			var new_line = line.split(" : ");
			if (new_line[0] == "host") {
				host = new_line[1];
			}
		}
		return host;
	}

	//const host = "http://127.0.0.1:3000";
	const host = "https://wikivanilla.herokuapp.com";

	/***************************************************************************
	get()
	Sends a search request to the web server and passes the results to be
	displayed to the client.
	***************************************************************************/
	function get() {
		var search = window.location.search.replace("?search=", "");

		// Validate input to prevent injections
		var new_search = search.replace("<", "");
		var validated = new_search.replace(">", "");

		var url = host + "/search?search=" + validated;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				displaySearchResults(json, search);
			})

			.catch(function(error) {
			});
	}

	/***************************************************************************
	findItemQuality(Integer)
	Takes an integer held in the database and assigns it an appropriate string
	so that the client can display the item's quality properly.
	Returns String
	***************************************************************************/
	function findItemQuality(quality) {
		switch (quality) {
			case 0:
				return "poor";
			case 1:
				return "common";
			case 2:
				return "uncommon";
			case 3:
				return "rare";
			case 4:
				return "epic";
			case 5:
				return "legendary";
			case 6:
				return "artifact";
			default:
				return "common";
		}
	}

	/***************************************************************************
	displaySearchResults(Dictionary, String)
	Takes JSON of all items that correspond to the user's search and organizes
	those items into a table.
	***************************************************************************/
	function displaySearchResults(json_results, requested) {
		var items_table = document.createElement("table");
		var creatures_table = document.createElement("table");
		var quests_table = document.createElement("table");
		var results = document.getElementById("results");
		var caption = document.createElement("h1");
		var tabs = document.createElement("div");
		items_table.classList += "search-table";
		creatures_table.classList += "search-table";
		quests_table.classList += "search-table";

		tabs.id = "tabs";
		caption.id = "caption";
		caption.innerHTML = "Results for " + requested.toUpperCase();

		// Clean up the page if needed
		if (results.hasChildNodes()) {
			results.removeChild(results.childNodes[0]);
		}

		var item_results = json_results["items"];
		var creature_results = json_results["creatures"];
		var quest_results = json_results["quests"];

		// If the results are empty, notify the user, otherwise iterate
		if (item_results.length == 0 && creature_results.length == 0 && quest_results.length == 0) {
			const not_found = document.createElement("p");
			not_found.innerHTML = requested + " not found in item database";
			results.appendChild(not_found);
		} else {
			if (item_results.length != 0) {
				var items_tab = document.createElement("p");
				items_tab.innerHTML = "Items";
				items_tab.addEventListener("click", function() {
					switchTabs("items_table");
				});
				tabs.appendChild(items_tab);

				const heading_row = document.createElement("tr");
				const heading_name = document.createElement("th");
				const heading_item = document.createElement("th");
				const heading_level = document.createElement("th");
				heading_row.classList += "search-tr";
				heading_name.classList += "search-th";
				heading_item.classList += "search-th";
				heading_level.classList += "search-th";
				heading_name.innerHTML += "Name";
				heading_item.innerHTML += "Item Level";
				heading_level.innerHTML += "Required Level";
				heading_row.appendChild(heading_name);
				heading_row.appendChild(heading_item);
				heading_row.appendChild(heading_level);
				items_table.appendChild(heading_row);
				items_table.id = "items_table";

				for (var item_result of item_results) {
					var row = document.createElement("tr");
					row.classList += "search-tr";
					const item_id = item_result["entry"];
					const name_column = document.createElement("td");
					var quality = findItemQuality(item_result["Quality"]);
					name_column.classList.add(quality);
					name_column.classList.add("search-td");
					name_column.innerHTML = "<a href='#' data-wowhead='item=" + item_id + "&amp;domain=classic'>[" + item_result["name"] + "]</a>";
					const item_level_column = document.createElement("td");
					item_level_column.classList += "search-td";
					item_level_column.innerHTML = item_result["ItemLevel"];
					const req_level_column = document.createElement("td");
					req_level_column.classList += "search-td";
					req_level_column.innerHTML = item_result["RequiredLevel"];

					name_column.classList += findItemQuality(item_result["Quality"]);
					row.appendChild(name_column);
					row.appendChild(item_level_column);
					row.appendChild(req_level_column);
					// This sets the row's .id attribute to be it's entry ID in the database
					// and adds a click event to each row
					row.id = item_id;
					row.addEventListener("click", function() {
						window.location.href = host + "/item.html?item=" + item_id;
					});

					items_table.appendChild(row);
					i++;
				}
				results.appendChild(items_table);
			}

			if (creature_results.length != 0) {
				var creatures_tab = document.createElement("p");
				creatures_tab.innerHTML = "NPCs";
				creatures_tab.addEventListener("click", function() {
					switchTabs("creatures_table");
				});
				tabs.appendChild(creatures_tab);

				const heading_row = document.createElement("tr");
				const heading_name = document.createElement("th");
				const heading_level = document.createElement("th");
				const heading_type = document.createElement("th");
				heading_row.classList += "search-tr";
				heading_name.classList += "search-th";
				heading_level.classList += "search-th";
				heading_type.classList += "search-th";
				heading_name.innerHTML += "Name";
				heading_level.innerHTML += "Level";
				heading_type.innerHTML += "Type";
				heading_row.appendChild(heading_name);
				heading_row.appendChild(heading_level);
				heading_row.appendChild(heading_type);
				creatures_table.appendChild(heading_row);
				creatures_table.id = "creatures_table";

				for (var creature_result of creature_results) {
					var row = document.createElement("tr");
					row.classList += "search-tr";
					const creature_id = creature_result["Entry"];

					const creature_column = document.createElement("td");
					creature_column.classList += "search-td";
					creature_column.innerHTML = "<a href='#' data-wowhead='npc=" + creature_id + "&amp;domain=classic'>[" + creature_result["Name"] + "]</a>";
					const creature_level_column = document.createElement("td");
					creature_level_column.classList += "search-td";

					if (creature_result["MinLevel"] != creature_result["MaxLevel"]) {
						creature_level_column.innerHTML = creature_result["MinLevel"] + "-" + creature_result["MaxLevel"];
					} else {
						creature_level_column.innerHTML = creature_result["MaxLevel"];
					}

					const type_column = document.createElement("td");
					type_column.classList += "search-td";
					type_column.innerHTML = creature_result["CreatureType"];

					row.appendChild(creature_column);
					row.appendChild(creature_level_column);
					row.appendChild(type_column);

					row.id = creature_result[creature_id];
					row.addEventListener("click", function() {
						window.location.href = host + "/npc.html?npc=" + creature_id;
					});

					creatures_table.appendChild(row);
					i++;
				}
				results.appendChild(creatures_table);
			}

			if (quest_results.length != 0) {
				var quests_tab = document.createElement("p");
				quests_tab.innerHTML = "Quests";
				quests_tab.addEventListener("click", function() {
					switchTabs("quests_table");
				});
				tabs.appendChild(quests_tab);

				const heading_row = document.createElement("tr");
				const heading_title = document.createElement("th");
				const heading_qlevel = document.createElement("th");
				const heading_rlevel = document.createElement("th");
				heading_row.classList += "search-tr";
				heading_title.classList += "search-th";
				heading_qlevel.classList += "search-th";
				heading_rlevel.classList += "search-th";
				heading_title.innerHTML += "Title";
				heading_qlevel.innerHTML += "Quest Level";
				heading_rlevel.innerHTML += "Req Level";
				heading_row.appendChild(heading_title);
				heading_row.appendChild(heading_qlevel);
				heading_row.appendChild(heading_rlevel);
				quests_table.appendChild(heading_row);

				quests_table.id = "quests_table";
				for (var quest_result of quest_results) {
					var row = document.createElement("tr");
					row.classList += "search-tr";
					const quest_id = quest_result["entry"];

					const quest_name_column = document.createElement("td");
					quest_name_column.classList += "search-td";
					quest_name_column.innerHTML = "<a href='#' data-wowhead='quest=" + quest_id + "&amp;domain=classic'>[" + quest_result["Title"] + "]</a>";

					const quest_level_column = document.createElement("td");
					quest_level_column.classList+= "search-td";
					quest_level_column.innerHTML = quest_result["QuestLevel"];

					const quest_req_level_column = document.createElement("td");
					quest_req_level_column.classList += "search-td";
					quest_req_level_column.innerHTML = quest_result["MinLevel"];

					row.appendChild(quest_name_column);
					row.appendChild(quest_level_column);
					row.appendChild(quest_req_level_column);

					row.id = quest_result[quest_id];
					row.addEventListener("click", function() {
						window.location.href = host + "/quest.html?quest=" + quest_id;
					});

					quests_table.appendChild(row);
					i++;
				}
				results.appendChild(quests_table);
			}
		}
		initTabs();

		results.insertBefore(tabs, results.childNodes[0]);
		results.insertBefore(caption, results.childNodes[0]);
	}

	function switchTabs(tab) {
		var results = document.getElementById("results");
		if (results.hasChildNodes()) {
			for (var child of results.childNodes){
				if (child.id != tab && child.id != "tabs" && child.id != "caption") {
					child.classList.add("hidden");
				} else {
					child.classList.remove("hidden");
				}
			}
		}
	}

	function initTabs(){
		var results = document.getElementById("results");
		if (results.hasChildNodes()) {
			for (var child of results.childNodes){
				child.classList.add("hidden");
			}
		}
		results.childNodes[0].classList.remove("hidden");
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
		get();
	}

}());