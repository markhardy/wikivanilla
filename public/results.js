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

	//const host = getHost();
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
	getDroppedBy(Integer)
	Requests information on what creatures drop a particular item and gets data
	for those creatures.
	***************************************************************************/
	function getDroppedBy(item_id) {
		var url = host + "/loot?item_id=" + item_id;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				console.log(json);
				displayDroppedBy(json);
			})

			.catch(function(error) {

			});
	}

	/***************************************************************************
	displayItem(Dictionary, Integer)
	Takes the JSON from a server request and builds a display for an item's
	stats for the client.
	***************************************************************************/
	function displayItem(json_results, requested) {
		clearPage();
		// Set up the table
		var results = document.getElementById("results");
		var heading = document.createElement("h2");
		var stat_box = document.createElement("div");
		stat_box.id = "stat_box";

		const json = json_results["result"];
		const item_query = json[0];
		heading.innerHTML += item_query["name"];

		// Take each item attribute that needs to go into the stat_box and
		// find its value and put it into the stat_box
		var quality = findItemQuality(item_query["Quality"]);
		var item_title = document.createElement("p");
		item_title.classList += quality;
		item_title.innerHTML = item_query["name"];
		stat_box.appendChild(item_title);

		var item_bonding = document.createElement("p");
		item_bonding.innerHTML = findItemBonding(item_query["bonding"]);
		stat_box.appendChild(item_bonding);

		var item_slot = document.createElement("p");
		item_slot.innerHTML = findItemSlot(item_query["InventoryType"])[0];
		var img = document.createElement("img");
		img.src = findItemSlot(item_query["InventoryType"])[1];
		stat_box.appendChild(img);
		stat_box.appendChild(item_slot);

		var item_subclass = document.createElement("p");
		item_subclass.innerHTML = findItemSubclass(item_query["class"], item_query["subclass"]);
		item_subclass.classList += "subclass";
		stat_box.appendChild(item_subclass);

		if (item_query["armor"] > 0) {
			var item_armor = document.createElement("p");
			item_armor.innerHTML = String(item_query["armor"]) + " Armor";
			stat_box.appendChild(item_armor);
		}

		// Getting stat types (stamina, strength etc) from the JSON by incrementing
		// 1-10 and adding them
		for (var i = 1; i < 11; i++) {
			var current_stat_type = "stat_type" + String(i);
			var current_stat_value = "stat_value" + String(i);
			var stat_text = findItemStats(item_query[current_stat_type], item_query[current_stat_value]);
			var item_stats = document.createElement("p");
			item_stats.innerHTML = stat_text;
			stat_box.appendChild(item_stats);
		}
		
		for (var i = 1; i < 6; i++) {
			var item_damage = document.createElement("p");
			if (item_query["dmg_min" + String(i)] > 0) {
				const i_str = String(i);
				var dmg_type = findItemDamage(item_query["dmg_type" + i_str]);
				var out_dmg = "";
				if (dmg_type > 0) {
					out_dmg = " " + dmg_type;
					item_damage.innerHTML = item_query["dmg_min" + i_str] + " - " + item_query["dmg_max" + i_str] + out_dmg + " Damage";
					stat_box.appendChild(item_damage);
				}

				var item_attack_speed = document.createElement("p");
				const speed = item_query["delay"] / 1000;
				item_attack_speed.innerHTML = "Speed " + speed.toFixed(2);
				item_attack_speed.classList += "attackspeed";
				stat_box.appendChild(item_attack_speed);

				var dps = document.createElement("p");
				const mean_damage = ((Number(item_query["dmg_max" + i_str]) - Number(item_query["dmg_min" + i_str])) / 2) + Number(item_query["dmg_min" + i_str]);
				const damage_per_sec = mean_damage / speed;
				dps.innerHTML = "(" + damage_per_sec.toFixed(1) + " damage per second)";
				stat_box.appendChild(dps);

				i = 6;
				
			}
		}

		if (item_query["MaxDurability"] > 0) {
			var item_durability = document.createElement("p");
			var durability = String(item_query["MaxDurability"]);
			item_durability.innerHTML = "Durability " + durability + " / " + durability;
			stat_box.appendChild(item_durability);
		}

		var item_req_level = document.createElement("p");
		item_req_level.innerHTML = "Requires Level " + String(item_query["RequiredLevel"]);
		stat_box.appendChild(item_req_level);



		results.appendChild(heading);
		results.appendChild(stat_box);

		getDroppedBy(requested);   // what creatures drop the item?
	}

	function findItemDamage(dmg_type) {
		var type = "";
		switch (dmg_type) {
			case 0:
				type = "Physical";
				break;
			case 1:
				type = "Holy";
				break;
			case 2:
				type = "Fire";
				break;
			case 3:
				type = "Nature";
				break;
			case 4:
				type = "Frost";
				break;
			case 5:
				type = "Shadow";
				break;
			case 6:
				type = "Arcane";
				break;
			default:
				type = "Physical";
		}
	}

	/***************************************************************************
	findItemStats(String, Integer)
	This method translates integer based values that represent strings in the
	database and makes them into their proper strings.
	***************************************************************************/
	function findItemStats(stat_type, stat_value) {
		var stat = "";
		switch (stat_type) {
			case 3:
				stat = "Agility";
				break;
			case 4:
				stat = "Strength";
				break;
			case 5:
				stat = "Intellect";
				break;
			case 6:
				stat = "Spirit";
				break;
			case 7:
				stat = "Stamina";
				break;
			default:
				stat = "";
		}

		if (stat != "") {
			return "+" + String(stat_value) + " " + stat;
		} else {
			return stat;
		}
	}

	/***************************************************************************
	findItemSubclass(String, String)
	Translates integers that represent what type of item in the database to a
	string that users can understand. All items have both a class and a subclass
	and different classes will have different values linked to their subclasses.
	Returns String
	***************************************************************************/
	function findItemSubclass(item_class, item_subclass) {
		var subclass_name = "";

		switch (item_class) {
			case 0:
				subclass_name = "";
				break;

			case 1:
				// This item class contains many subclasses....
				switch (item_subclass) {
					case 0:
						subclass_name = "Container";
						break;
					case 1:
						subclass_name = "Soul Bag";
						break;
					case 2:
						subclass_name = "Herb Bag";
						break;
					case 3:
						subclass_name = "Enchanting Bag";
						break;
					case 4:
						subclass_name = "Engineering Bag";
						break;
					default:
						subclass_name = "Container";
				}
				break;

			case 2:
				switch (item_subclass) {
					case 0:
						subclass_name = "Axe";
						break;
					case 1:
						subclass_name = "Axe";
						break;
					case 2:
						subclass_name = "Bow";
						break;
					case 3:
						subclass_name = "Gun";
						break;
					case 4:
						subclass_name = "Mace";
						break;
					case 5:
						subclass_name = "Mace";
						break;
					case 6:
						subclass_name = "Polearm";
						break;
					case 7:
						subclass_name = "Sword";
						break;
					case 8:
						subclass_name = "Sword";
						break;
					case 10:
						subclass_name = "Staff";
						break;
					case 13:
						subclass_name = "Fist Weapon";
						break;
					case 14:
						subclass_name = "Miscellaneous";
						break;
					case 15:
						subclass_name = "Dagger";
						break;
					case 16:
						subclass_name = "Thrown";
						break;
					case 17:
						subclass_name = "Spear";
						break;
					case 18:
						subclass_name = "Crossbow";
						break;
					case 19:
						subclass_name = "Wand";
						break;
					case 20:
						subclass_name = "Fishing Pole";
						break;
					default:
						subclass_name = "Miscellaneous";
				}
				break;

			case 4:
				switch (item_subclass) {
					case 0:
						subclass_name = "Miscellaneous";
						break;
					case 1:
						subclass_name = "Cloth";
						break;
					case 2:
						subclass_name = "Leather";
						break;
					case 3:
						subclass_name = "Mail";
						break;
					case 4:
						subclass_name = "Plate";
						break;
					case 6:
						subclass_name = "Shield";
						break;
					case 7:
						subclass_name = "Libram";
						break;
					case 8:
						subclass_name = "Idol";
						break;
					case 9:
						subclass_name = "Totem";
						break;
					default:
						subclass_name = "Miscellaneous";
						break;
				}
				break;

			case 5:
				subclass_name = "Reagent";
				break;
			case 6:

				if (item_subclass == 2) {
					subclass_name = "Arrow";
				} else if (item_subclass == 3) {
					subclass_name = "Bullet";
				} else {
					subclass_name = "Miscellaneous";
				}
				break;

			case 7:
				subclass_name = ""; //Trade goods
				break;

			case 9:
				slot_name = ""; //Recipes
				break;

			case 11:
				if (item_subclass == 2) {
					subclass_name = "Quiver";
				} else if (item_subclass == 3) {
					subclass_name = "Ammo Pouch";
				} else {
					subclass_name = "Miscellaneous";
				}
				break;

			default:
				subclass_name = ""; //quest,key,lockpick,misc,junk
		}

		return subclass_name;
	}

	/***************************************************************************
	findItemSlot(Integer)
	Takes an integer value from the database and turns it into a string the
	user can understand representing the slot of the requested item.
	Returns String
	***************************************************************************/
	function findItemSlot(slot) {
		var slot_name = "";
		var image_url = "";

		switch (slot) {
			case 0:
				slot_name = "";
				break;
			case 1:
				slot_name = "Head";
				image_url = "https://dl.dropboxusercontent.com/s/o0480p1zmzz623s/INV_Helmet_17.png?dl=0";
				break;
			case 2:
				slot_name = "Neck";
				image_url = "https://dl.dropboxusercontent.com/s/skyovn2hv5fw0rp/INV_Jewelry_Amulet_05.png?dl=0";
				break;
			case 3:
				slot_name = "Shoulder";
				image_url = "https://dl.dropboxusercontent.com/s/rcgr7tcg84vojuj/INV_Shoulder_25.png?dl=0";
				break;
			case 4:
				slot_name = "Body";
				break;
			case 5:
				slot_name = "Chest";
				image_url = "https://dl.dropboxusercontent.com/s/ziheaa27ie4548w/INV_Chest_Chain_15.png?dl=0";
				break;
			case 6:
				slot_name = "Waist";
				image_url = "https://dl.dropboxusercontent.com/s/m0in7o0lvivro7l/INV_Belt_02.png?dl=0";
				break;
			case 7:
				slot_name = "Legs";
				image_url = "https://dl.dropboxusercontent.com/s/fvrhfrjnlltrsig/INV_Pants_01.png?dl=0";
				break;
			case 8:
				slot_name = "Feet";
				image_url = "https://dl.dropboxusercontent.com/s/0rp3ol14jwu1wry/INV_Boots_Plate_04.png?dl=0";
				break;
			case 9:
				slot_name = "Wrists";
				image_url = "https://dl.dropboxusercontent.com/s/tbpbzwzzwhozimx/INV_Bracer_13.png?dl=0";
				break;
			case 10:
				slot_name = "Hands";
				image_url = "https://dl.dropboxusercontent.com/s/6krajc4k6bcfpeb/INV_Gauntlets_09.png?dl=0";
				break;
			case 11:
				slot_name = "Finger";
				image_url = "https://dl.dropboxusercontent.com/s/iluy4hhjox90zjd/INV_Jewelry_Ring_14.png?dl=0";
				break;
			case 12:
				slot_name = "Trinket";
				image_url = "https://dl.dropboxusercontent.com/s/vcim2b0tgfhlt2o/INV_Jewelry_Talisman_09.png?dl=0";
				break;
			case 13:
				slot_name = "One-hand";
				break;
			case 14:
				slot_name = "Off hand";
				break;
			case 15:
				slot_name = "Ranged";
				break;
			case 16:
				slot_name = "Back";
				image_url = "https://dl.dropboxusercontent.com/s/xh4uua6b0vibngl/INV_Misc_Cape_20.png?dl=0";
				break;
			case 17:
				slot_name = "Two-hand";
				break;
			case 18:
				slot_name = ""; //Bag
				break;
			case 19:
				slot_name = "Tabard";
				image_url = "https://dl.dropboxusercontent.com/s/jbgkmdjiwy0a4c2/INV_Shirt_GuildTabard_01.png?dl=0";
				break;
			case 20:
				slot_name = "Chest";
				break;
			case 21:
				slot_name = "Main Hand";
				break;
			case 22:
				slot_name = "Held In Off-Hand";
				image_url = "https://dl.dropboxusercontent.com/s/h6i5ae2909ahkp5/INV_Shield_15.png?dl=0";
				break;
			case 23:
				slot_name = ""; // Holdable
				break;
			case 24:
				slot_name = "Projectile";
				break;
			case 25:
				slot_name = "Thrown";
				break;
			case 26:
				slot_name = "Ranged";
				break;
			case 27:
				slot_name = "Quiver";
				image_url = "https://dl.dropboxusercontent.com/s/rt5q5mjjoqzj9cb/INV_Misc_Quiver_05.png?dl=0";
				break;
			case 28:
				slot_name = "Relic";
				image_url = "https://www.dropbox.com/s/78rsoi4jbzi5z2j/INV_Jewelry_Talisman_14.png?dl=0";
				break;
			default:
				slot_name = "";
				image_url = "";
		}

		return [slot_name, image_url];
	}

	/***************************************************************************
	findItemQuality(Integer)
	Takes an integer held in the database and assigns it an appropriate string
	so that the client can display the item's quality properly.
	Returns String
	***************************************************************************/
	function findItemQuality(quality) {
		var quality_class = "";
		switch (quality) {
			case 0:
				quality_class = "poor";
				break;
			case 1:
				quality_class = "common";
				break;
			case 2:
				quality_class = "uncommon";
				break;
			case 3:
				quality_class = "rare";
				break;
			case 4:
				quality_class = "epic";
				break;
			case 5:
				quality_class = "legendary";
				break;
			case 6:
				quality_class = "artifact";
				break;
			default:
				quality_class = "common";
		}

		return quality_class;
	}

	/***************************************************************************
	findItemBonding(Integer)
	Translates the database's integer value for bonding to a string the user
	can understand.
	Returns String
	***************************************************************************/
	function findItemBonding(bonding) {
		var bonding_type = "";
		switch (bonding) {
			case 0:
				bonding_type = "";
				break;
			case 1:
				bonding_type = "Binds when picked up";
				break;
			case 2:
				bonding_type = "Binds when equipped";
				break;
			case 3:
				bonding_type = "Binds when used";
				break;
			case 4:
				bonding_type = "Quest Item";
				break;
			default:
				bonding_type = "";
		}

		return bonding_type;
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
		tabs.id = "tabs";
		caption.id = "caption";
		caption.innerHTML = "Results for " + requested.toUpperCase();
		// Clean up the page if needed
		if (results.hasChildNodes()) {
			results.removeChild(results.childNodes[0]);
		}

		var i = 0;
		var item_results = json_results["items"];
		var creature_results = json_results["creatures"];
		var quest_results = json_results["quests"];

		// If the results are empty, notify the user, otherwise iterate
		if (item_results.length == 0 && creature_results.length == 0 && quest_results.length == 0) {
			results.innerHTML = "<p>" + requested + " not found in item database</p>"
		} else {
			if (item_results.length != 0) {
				var items_tab = document.createElement("p");
				items_tab.innerHTML = "Items";
				items_tab.addEventListener("click", function() {
					switchTabs("items_table");
				});
				tabs.appendChild(items_tab);

				items_table.innerHTML = "<tr><th>Name</th><th>Item Level</th><th>Required Level</th></tr>";
				items_table.id = "items_table";
				for (var item_result of item_results) {
					var row = document.createElement("tr");
					row.innerHTML = "<td>" + item_result["name"] + "</td><td>" + item_result["ItemLevel"] + "</td><td>" + item_result["RequiredLevel"] + "</td>";

					// This sets the row's .id attribute to be it's entry ID in the database
					// and adds a click event to each row
					const item_id = item_result["entry"];
					row.id = item_id;
					row.addEventListener("click", function() {
						window.location.href = host + "/item.html?item=" + item_id;
					});

					// Make every other row a different color
					if (i % 2 == 0) {
						row.classList.add("even-row");
					} else {
						row.classList.add("odd-row");
					}
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

				i = 0;
				creatures_table.innerHTML = "<tr><th>Name</th><th>Level</th><th>Type</th></tr>";
				creatures_table.id = "creatures_table";
				for (var creature_result of creature_results) {
					var row = document.createElement("tr");
					row.innerHTML = "<td>" + creature_result["Name"] + "</td><td>" + creature_result["MinLevel"] + "-" + creature_result["MaxLevel"] + "</td><td>" + creature_result["CreatureType"] + "</td>";
					const creature_id = creature_result["Entry"];
					row.id = creature_result[creature_id];
					row.addEventListener("click", function() {
						window.location.href = host + "/npc.html?npc=" + creature_id;
					});
					// Make every other row a different color
					if (i % 2 == 0) {
						row.classList.add("even-row");
					} else {
						row.classList.add("odd-row");
					}
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

				i = 0;
				quests_table.innerHTML = "<tr><th>Title</th><th>Quest Level</th><th>Req Level</th></tr>";
				quests_table.id = "quests_table";
				for (var quest_result of quest_results) {
					var row = document.createElement("tr");
					row.innerHTML = "<td>" + quest_result["Title"] + "</td><td>" + quest_result["QuestLevel"] + "</td><td>" + quest_result["MinLevel"] + "</td>";
					const quest_id = quest_result["entry"];
					row.id = quest_result[quest_id];
					row.addEventListener("click", function() {
						window.location.href = host + "/quest.html?quest=" + quest_id;
					});
					// Make every other row a different color
					if (i % 2 == 0) {
						row.classList.add("even-row");
					} else {
						row.classList.add("odd-row");
					}
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