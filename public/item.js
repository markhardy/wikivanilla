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
	getById(String)
	Sends a request to the web server for a specific item's information and
	forwards that data to be displayed by the client.
	***************************************************************************/
	function getItem() {
		var item_id = window.location.search.replace("?item=", "");
		console.log("get");

		var url = host + "/item?item_id=" + item_id;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				displayItemTable(json, item_id);
			})

			.catch(function(error) {

			});
	}

	function getSoldBy(item_id) {
		var url = host + "/soldby?item_id=" + item_id;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				displaySoldBy(json);
			})

			.catch(function(error) {

			});
	}

	function getSpells(spellid_1, spellid_2, spellid_3, spellid_4, spellid_5) {
		var url = host + "/spells?spellid_1=" + spellid_1 + "&spellid_2=" + spellid_2 + "&spellid_3=" + spellid_3 + "&spellid_4=" + spellid_4 + "&spellid_5=" + spellid_5;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				displaySpells(json);
			})

			.catch(function(error) {

			});
	}

	function displaySpells(json) {
		var item_table = document.getElementById("item_table");
		var i = 0;
		for (var spell of json) {
			var spell_text = "";
			var spell_dmg = "";
			var spell_duration = 0;
			const spell_item_row = document.createElement("tr");
			const spell_item = document.createElement("td");
			spell_item.classList.add("uncommon");
			if (json.length < 2) {
				spell_text = "Equip: " + String(spell["spell_description"]);
				spell_dmg = Number(spell["dmg"]) + 1;
				spell_duration = spell["duration"];
			} else {
				spell_text = "Equip: " + String(spell[0]["spell_description"]);
				spell_dmg = Number(spell[0]["dmg"]) + 1;
				spell_duration = spell["duration"];
			}
			var o1_replace = spell_text.replace("$o1", String(spell_dmg));
			var s1_replace = o1_replace.replace("$s1", String(spell_dmg));
			var d_replace = s1_replace.replace("$d", String(spell_duration / 1000) + " sec");
			spell_item.innerHTML = d_replace;
			spell_item_row.appendChild(spell_item);
			item_table.appendChild(spell_item_row);
			i++;
		}
	}

	/***************************************************************************
	displaySoldBy(JSON Array)
	Formats data for what NPCs sell the current item.
	***************************************************************************/
	function displaySoldBy(vendors) {
		var vendor_tab = document.createElement("table");

		const vendor_info = vendors[0][0];

		//  Setting up headings for a table
		const heading_row = document.createElement("tr");
		const heading_name = document.createElement("th");
		const heading_level = document.createElement("th");
		const heading_location = document.createElement("th");
		const heading_stock = document.createElement("th");
		const heading_cost = document.createElement("th");

		heading_row.classList += "search-tr";
		heading_name.classList += "search-th";
		heading_level.classList += "search-th";
		heading_location.classList += "search-th";
		heading_stock.classList += "search-th";
		heading_cost.classList += "search-th";

		heading_name.innerHTML = "Sold By";
		heading_level.innerHTML = "Level";
		heading_location.innerHTML = "Location";
		heading_stock.innerHTML = "Stock";
		heading_cost.innerHTML = "Cost";

		heading_row.appendChild(heading_name);
		heading_row.appendChild(heading_level);
		heading_row.appendChild(heading_location);
		heading_row.appendChild(heading_stock);
		heading_row.appendChild(heading_cost);
		
		loot.appendChild(heading_row);

		// For each creature that drops an item, display its name, level and
		// chance to drop the item into the table
		for (var vendor of vendors) {

			const row = document.createElement("tr");
			const name = document.createElement("td");
			const level = document.createElement("td");
			const location = document.createElement("td");
			const stock = document.createElement("td");
			const cost = document.createElement("td");

			row.classList += "search-tr";
			name.classList += "search-td";
			level.classList += "search-td";
			location.classList += "search-td";
			stock.classList += "search-td";
			cost.classList += "search-td";
		
			name.innerHTML = vendor["Name"];
			row.appendChild(name);

			level.innerHTML = vendor["MinLevel"];
			row.appendChild(level);

			location.innerHTML = "?";
			row.appendChild(location);

			stock.innerHTML = vendor["maxcount"];
			row.appendChild(stock);



			drop.innerHTML = npc["ChanceOrQuestChance"];
			row.appendChild(drop);
			loot.appendChild(row);
		}
	}

	function displayItemTable(json_results, requested) {
		const item_query = json_results[0][0][0];
		var results = document.getElementById("results");
		var heading = document.createElement("h2");

		heading.innerHTML += item_query["name"];

		results.insertBefore(heading, results.childNodes[0]);

		var item_table = document.getElementById("item_table");
		item_table.classList += "box";
		var head_row = document.createElement("tr");
		var item_name = document.createElement("td");
		var quality = findItemQuality(item_query["Quality"]);
		item_name.classList.add(quality);
		item_name.classList.add("box-title");
		item_name.innerHTML += item_query["name"];
		head_row.appendChild(item_name);
		item_table.appendChild(head_row);

		if (item_query["RequiredSkill"] > 0) {
			var required_skill = getRequiredSkill(item_query["RequiredSkill"]);
			var req_skill_row = document.createElement("tr");
			var req_skill = document.createElement("td");
			req_skill.innerHTML = "Requires " + required_skill + " (" + item_query["RequiredSkillRank"] + ")";
			req_skill_row.appendChild(req_skill);
			item_table.appendChild(req_skill_row);
		}

		var bind_on_row = document.createElement("tr");
		var item_bonding = document.createElement("td");
		item_bonding.innerHTML = findItemBonding(item_query["bonding"]);
		bind_on_row.appendChild(item_bonding);
		item_table.appendChild(bind_on_row);

		var second_row = document.createElement("tr");
		var slot = document.createElement("td");
		var subclass = document.createElement("td");
		slot.innerHTML += findItemSlot(item_query["InventoryType"]);
		subclass.innerHTML += findItemSubclass(item_query["class"], item_query["subclass"]);
		subclass.classList += "align-right";

		if (slot != "") {
			second_row.appendChild(slot);
		}

		if (subclass != "") {
			second_row.appendChild(subclass);
		}
		item_table.appendChild(second_row);

		if (item_query["armor"] > 0) {
			var armor_row = document.createElement("tr");
			var armor = document.createElement("td");
			armor.innerHTML = String(item_query["armor"]) + " Armor";
			armor_row.appendChild(armor);
			item_table.appendChild(armor_row);
		}

		// Getting stat types (stamina, strength etc) from the JSON by incrementing
		// 1-10 and adding them
		for (var i = 1; i < 11; i++) {
			var stat_row = document.createElement("tr");
			var current_stat_type = "stat_type" + String(i);
			var current_stat_value = "stat_value" + String(i);
			var stat_text = findItemStats(item_query[current_stat_type], item_query[current_stat_value]);
			var item_stats = document.createElement("td");
			if (item_query[current_stat_value]) {
				item_stats.innerHTML = stat_text;
				stat_row.appendChild(item_stats);
				item_table.appendChild(stat_row);
			}
		}

		var third_row = document.createElement("tr");
		var fourth_row = document.createElement("tr");
		// Items can have six possible types of damage for various schools of magic
		// So we have to iterate through each to find which one is active
		for (var i = 1; i < 6; i++) {
			var item_damage = document.createElement("td");

			// If this is the column that has damage in it then get the amount of damage and school
			if (item_query["dmg_min" + String(i)] > 0) {
				const i_str = String(i);
				var dmg_type = findItemDamage(item_query["dmg_type" + i_str]);
				var out_dmg = "";
				if (dmg_type) {
					out_dmg = " " + dmg_type;
					// 40 - 90 Fire Damage for example:
					item_damage.innerHTML += item_query["dmg_min" + i_str] + " - " + item_query["dmg_max" + i_str] + 
					out_dmg + " Damage";
					third_row.appendChild(item_damage);
					item_table.appendChild(third_row);
				} else {
					item_damage.innerHTML += item_query["dmg_min" + i_str] + " - " + item_query["dmg_max" + i_str] + " Damage";
					third_row.appendChild(item_damage);
					item_table.appendChild(third_row);
				}

				var item_attack_speed = document.createElement("td");
				const speed = item_query["delay"] / 1000;		// convert from ms
				item_attack_speed.innerHTML = "Speed " + speed.toFixed(2);	// round two decimal places
				item_attack_speed.classList += "align-right";
				third_row.appendChild(item_attack_speed);
				item_table.appendChild(third_row);

				var dps = document.createElement("td");
				// Find the mean amount of damage and then divide it by weapon speed to get dps
				const mean_damage = ((Number(item_query["dmg_max" + i_str]) - Number(item_query["dmg_min" + i_str])) / 2) + Number(item_query["dmg_min" + i_str]);
				const damage_per_sec = mean_damage / speed;
				dps.innerHTML = "(" + damage_per_sec.toFixed(1) + " damage per second)";
				fourth_row.appendChild(dps);
				item_table.appendChild(fourth_row);

				// We found the damage school we needed so end the loop so we don't overwrite
				i = 6;
			}
		}

		if (item_query["MaxDurability"] > 0) {
			var durability_row = document.createElement("tr");
			var durability = document.createElement("td");
			var durability_val = String(item_query["MaxDurability"]);
			durability.innerHTML = "Durability " + durability_val + " / " + durability_val;
			durability_row.appendChild(durability);
			item_table.appendChild(durability_row);
		}

		if (item_query["AllowableClass"] > 0 && item_query["AllowableClass"] != 32767) {
			var class_row = document.createElement("tr");
			var req_class = document.createElement("td");
			req_class.innerHTML = "Classes: " + getRequiredClasses(item_query["AllowableClass"]);
			class_row.appendChild(req_class);
			item_table.appendChild(class_row);
		}

		if (item_query["RequiredLevel"] > 0) {
			var req_level_row = document.createElement("tr");
			var req_level = document.createElement("td");
			req_level.innerHTML = "Requires Level " + item_query["RequiredLevel"];
			item_table.appendChild(req_level);
		}

		if (item_query["spellid_1"] > 0) {
			getSpells(item_query["spellid_1"], item_query["spellid_2"], item_query["spellid_3"], item_query["spellid_4"], item_query["spellid_5"]);
		}
		

		if (item_query["description"] != "") {
			var desc_row = document.createElement("tr");
			var desc = document.createElement("td");

			// Skill IDs for tradeskills/formulas
			var use = [129, 164, 165, 171, 185, 197, 202, 333];

			if (use.includes(item_query["RequiredSkill"])) {
				desc.innerHTML += "Use: ";
				desc.classList.add("uncommon");
			}

			desc.innerHTML += item_query["description"];
			desc_row.appendChild(desc);
			item_table.appendChild(desc_row);
		}

		if (item_query["icon1"]) {
			var icon_name = item_query["icon1"];
			var img = document.createElement("img");
			img.src = "/icons/" + icon_name + ".png";
			img.classList += "icon";
			results.insertBefore(img, results.childNodes[2]);
		}

		displayDroppedBy(json_results[0][1]);
	}

	/***************************************************************************
	displayDroppedBy(Dictionary)
	Formats data as far as what creature or creatures drop an item. If no 
	creature drops the item, the table will not exist.
	***************************************************************************/
	function displayDroppedBy(npcs) {
		var results = document.getElementById("results");
		var loot = document.createElement("table");
		loot.id = "loot";
		loot.classList.add("search-table");

		//  Setting up headings for a table
		const heading_row = document.createElement("tr");
		const heading_name = document.createElement("th");
		const heading_level = document.createElement("th");
		const heading_type = document.createElement("th");
		const heading_chance = document.createElement("th");
		heading_row.classList.add("search-tr");
		heading_name.classList.add("search-th");
		heading_level.classList.add("search-th");
		heading_type.classList.add("search-th");
		heading_chance.classList.add("search-th");

		heading_name.innerHTML = "Dropped By";
		heading_level.innerHTML = "Level";
		heading_type.innerHTML = "Type";
		heading_chance.innerHTML = "%";

		heading_row.appendChild(heading_name);
		heading_row.appendChild(heading_level);
		heading_row.appendChild(heading_type);
		heading_row.appendChild(heading_chance);
		
		loot.appendChild(heading_row);
		// For each creature that drops an item, display its name, level and
		// chance to drop the item into the table
		for (var npc of npcs) {
			const row = document.createElement("tr");
			const name = document.createElement("td");
			const level = document.createElement("td");
			const type = document.createElement("td");
			const drop = document.createElement("td");

			row.classList.add("search-tr");
			name.classList.add("search-td");
			level.classList.add("search-td");
			type.classList.add("search-td");
			drop.classList.add("search-td");
			name.id = "search";
			name.type = "search";
			name.name = "search";
			name.innerHTML = "<a href='#' data-wowhead='npc=" + String(npc["Entry"]) + "&amp;domain=classic'>" + npc["Name"] + "</a>";
			row.appendChild(name);
			
			// If Min and Max levels are the same just say it is that level
			// rather than a range of levels
			if (npc["MinLevel"] == npc["MaxLevel"]) {
				level.innerHTML = npc["MinLevel"];
			} else {
				level.innerHTML = npc["MinLevel"] + "-" + npc["MaxLevel"];
			}
			
			row.appendChild(level);

			type.innerHTML = findCreatureType(npc["CreatureType"]);
			row.appendChild(type);

			drop.innerHTML = npc["ChanceOrQuestChance"];
			row.appendChild(drop);

			row.addEventListener("click", function() {
				window.location.href = host + "/npc.html?npc=" + npc["Entry"];
			});

			loot.appendChild(row);

		}
		results.appendChild(loot);
	}

	function findCreatureType(creature_type) {
		switch (creature_type) {
			case 1:
				return "Beast";
			case 2:
				return "Dragonkin";
			case 3:
				return "Demon";
			case 4:
				return "Elemental";
			case 5:
				return "Giant";
			case 6:
				return "Undead";
			case 7:
				return "Humanoid";
			case 8:
				return "Critter";
			case 9:
				return "Mechanical";
			case 10:
				return "Not Specified";
			case 11:
				return "Totem";
			default:
				return "Not Specified";
		}
	}
	
	function getRequiredClasses(class_id) {
		switch (class_id) {
			case 1:
				return "Warrior";
			case 2:
				return "Paladin";
			case 3:
				return "Warrior, Paladin";
			case 4:
				return "Hunter";
			case 8:
				return "Rogue";
			case 9:
				return "Warrior, Rogue";
			case 15:
				return "Warrior, Paladin, Hunter, Rogue";
			case 16:
				return "Priest";
			case 21:
				return "Warrior, Hunter, Priest";
			case 28:
				return "Hunter, Rogue, Priest";
			case 29:
				return "Warrior, Hunter, Rogue, Priest";
			case 32:
				return "Druid";
			case 64:
				return "Shaman";
			case 68:
				return "Hunter";
			case 73:
				return "Warrior, Rogue, Shaman";
			case 79:
				return "Warrior, Paladin, Hunter, Rogue, Shaman";
			case 128:
				return "Mage";
			case 134:
				return "Paladin, Hunter, Mage";
			case 140:
				return "Hunter, Rogue, Mage";
			case 141:
				return "Warrior, Hunter, Rogue, Mage";
			case 153:
				return "Warrior, Rogue, Priest, Mage";
			case 210:
				return "Paladin, Priest, Shaman, Mage";
			case 256:
				return "Warlock";
			case 265:
				return "Warrior, Rogue, Warlock";
			case 284:
				return "Hunter, Rogue, Priest, Warlock";
			case 326:
				return "Paladin, Hunter, Shaman, Warlock";
			case 385:
				return "Warrior, Mage, Warlock";
			case 393:
				return "Warrior, Rogue, Mage, Warlock";
			case 400:
				return "Priest, Mage, Warlock";
			case 401:
				return "Warrior, Priest, Mage, Warlock";
			case 466:
				return "Paladin, Priest, Shaman, Mage, Warlock";
			case 1024:
				return "Druid";
			case 1032:
				return "Rogue, Druid";
			case 1037:
				return "Warrior, Hunter, Rogue, Druid";
			case 1090:
				return "Paladin, Shaman, Druid";
			case 1094:
				return "Paladin, Hunter, Shaman, Druid";
			case 1098:
				return "Paladin, Rogue, Shaman, Druid";
			case 1102:
				return "Paladin, Hunter, Rogue, Shaman, Druid";
			case 1110:
				return "Paladin, Hunter, Priest, Shaman, Druid";
			case 1153:
				return "Warrior, Mage, Druid";
			case 1219:
				return "Warrior, Paladin, Shaman, Mage, Druid";
			case 1296:
				return "Priest, Warlock, Druid";
			case 1350:
				return "Paladin, Hunter, Shaman, Warlock, Druid";
			case 1362:
				return "Paladin, Priest, Shaman, Warlock, Druid";
			case 1424:
				return "Priest, Mage, Warlock, Druid";
			case 1474:
				return "Paladin, Shaman, Mage, Warlock, Druid";
			case 1488:
				return "Priest, Shaman, Mage, Warlock, Druid";
			case 31233:
				return "Warrior";
			case 31234:
				return "Paladin";
			case 31236:
				return "Hunter";
			case 31240:
				return "Rogue";
			case 31248:
				return "Priest";
			case 31296:
				return "Shaman";
			case 31360:
				return "Mage";
			case 31488:
				return "Warlock";
			case 31632:
				return "Druid";
			case 32256:
				return "Druid";
			case 260623:
				return "Warrior, Paladin, Hunter, Rogue";
			case 261008:
				return "Priest, Mage, Warlock";
			case 262096:
				return "Priest, Shaman, Mage, Warlock, Druid";
			default:
				return "None";
		}
	}

	function getRequiredSkill(skill) {
		switch (skill) {
			case 129:
				return "First Aid";
			case 164:
				return "Blacksmithing";
			case 165:
				return "Leatherworking";
			case 171:
				return "Alchemy";
			case 185:
				return "Cooking";
			case 197:
				return "Tailoring";
			case 202:
				return "Engineering";
			case 333:
				return "Enchanting";
			default:
				return "Tradeskill";
		}
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
				subclass_name = ""; //Recipes
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
		switch (slot) {
			case 1:
				return "Head";
			case 2:
				return "Neck";
			case 3:
				return "Shoulder";
			case 4:
				return "Body";
			case 5:
				return "Chest";
			case 6:
				return "Waist";
			case 7:
				return "Legs";
			case 8:
				return "Feet";
			case 9:
				return "Wrists";
			case 10:
				return "Hands";
			case 11:
				return "Finger";
			case 12:
				return "Trinket";
			case 13:
				return "One-hand";
			case 14:
				return "Off hand";
			case 15:
				return "Ranged";
			case 16:
				return "Back";
			case 17:
				return "Two-hand";
			case 18:
				return ""; //Bag
			case 19:
				return "Tabard";
			case 20:
				return "Chest";
			case 21:
				return "Main Hand";
			case 22:
				return "Held In Off-Hand";
			case 23:
				return ""; // Holdable
			case 24:
				return "Projectile";
			case 25:
				return "Thrown";
			case 26:
				return "Ranged";
			case 27:
				return "Quiver";
			case 28:
				return "Relic";
			default:
				return "";
		}
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
		getItem();
	}

}());