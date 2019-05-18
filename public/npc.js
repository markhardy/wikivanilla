/***************************************************************************
npc.js

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
	getById(String)
	Sends a request to the web server for a specific item's information and
	forwards that data to be displayed by the client.
	***************************************************************************/
	function getCreature() {
		var npc_id = window.location.search.replace("?npc=", "");

		var url = host + "/npc?npc_id=" + npc_id;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				console.log(json);
				displayCreature(json, npc_id);
			})

			.catch(function(error) {

			});
	}

	function displayCreature(json_results, requested){
		const creature_query = json_results["result"][0];

		const results = document.getElementById("results");
		const heading = document.createElement("h1");
		const subname = document.createElement("h2");
		const type = document.createElement("p");
		const npcflags = document.createElement("p");
		const extraflags = document.createElement("p");
		const rank = document.createElement("p");
		const gold_range = document.createElement("p");
		const immunes = document.createElement("p");

		const trainer_type = document.createElement("p");
		const trainer_class = document.createElement("p");
		const trainer_race = document.createElement("p");
		const civilian = document.createElement("p");

		heading.innerHTML = creature_query["Name"];
		subname.innerHTML = creature_query["SubName"];
		results.appendChild(heading);
		results.appendChild(subname);

		const lvl_range_box = document.createElement("div");
		const lvl_txt = document.createElement("p");
		const level_range = document.createElement("p");
		lvl_txt.innerHTML = "LVL";
		level_range.innerHTML = creature_query["MinLevel"] + " - " + creature_query["MaxLevel"];
		lvl_range_box.classList += "small-box";
		lvl_range_box.appendChild(lvl_txt);
		lvl_range_box.appendChild(level_range);
		results.appendChild(lvl_range_box);

		const hp_range_box = document.createElement("div");
		const hp_txt = document.createElement("p");
		const hp_range = document.createElement("p");
		hp_txt.innerHTML = "HP";
		hp_range.innerHTML = creature_query["MinLevelHealth"] + " - " + creature_query["MaxLevelHealth"];
		hp_range_box.classList += "small-box";
		hp_range_box.appendChild(hp_txt);
		hp_range_box.appendChild(hp_range);
		results.appendChild(hp_range_box);

		const mana_range_box = document.createElement("div");
		const mana_txt = document.createElement("p");
		const mana_range = document.createElement("p");
		mana_txt.innerHTML = "MANA";
		mana_range.innerHTML = creature_query["MinLevelMana"] + " - " + creature_query["MaxLevelMana"];
		mana_range_box.classList += "small-box";
		mana_range_box.appendChild(mana_txt);
		mana_range_box.appendChild(mana_range);
		results.appendChild(mana_range_box);

		const melee_damage_range_box = document.createElement("div");
		const melee_damage_txt = document.createElement("p");
		const melee_damage_range = document.createElement("p");
		melee_damage_txt.innerHTML = "MELEE";
		melee_damage_range.innerHTML = creature_query["MinMeleeDmg"] + " - " + creature_query["MaxMeleeDmg"];
		melee_damage_range_box.classList += "small-box";
		melee_damage_range_box.appendChild(melee_damage_txt);
		melee_damage_range_box.appendChild(melee_damage_range);
		results.appendChild(melee_damage_range_box);

		const ranged_damage_range_box = document.createElement("div");
		const ranged_damage_txt = document.createElement("p");
		const ranged_damage_range = document.createElement("p");
		ranged_damage_txt.innerHTML = "RANGED";
		ranged_damage_range.innerHTML = creature_query["MinRangedDmg"] + " - " + creature_query["MaxRangedDmg"];
		ranged_damage_range_box.classList += "small-box";
		ranged_damage_range_box.appendChild(ranged_damage_txt);
		ranged_damage_range_box.appendChild(ranged_damage_range);
		results.appendChild(ranged_damage_range_box);

		const melee_ap_range_box = document.createElement("div");
		const melee_ap_txt = document.createElement("p");
		const melee_ap_range = document.createElement("p");
		melee_ap_txt.innerHTML = "AP";
		melee_ap_range.innerHTML = creature_query["MeleeAttackPower"];
		melee_ap_range_box.classList += "small-box";
		melee_ap_range_box.appendChild(melee_ap_txt);
		melee_ap_range_box.appendChild(melee_ap_range);
		results.appendChild(melee_ap_range_box);

		const ranged_ap_range_box = document.createElement("div");
		const ranged_ap_txt = document.createElement("p");
		const ranged_ap_range = document.createElement("p");
		ranged_ap_txt.innerHTML = "RNG-AP";
		ranged_ap_range.innerHTML = creature_query["RangedAttackPower"];
		ranged_ap_range_box.classList += "small-box";
		ranged_ap_range_box.appendChild(ranged_ap_txt);
		ranged_ap_range_box.appendChild(ranged_ap_range);
		results.appendChild(ranged_ap_range_box);

		const melee_attack_time_range_box = document.createElement("div");
		const melee_attack_time_txt = document.createElement("p");
		const melee_attack_time_range = document.createElement("p");
		melee_attack_time_txt.innerHTML = "SPEED";
		melee_attack_time_range.innerHTML = parseInt(creature_query["MeleeBaseAttackTime"]) / 1000 + " sec";
		melee_attack_time_range_box.classList += "small-box";
		melee_attack_time_range_box.appendChild(melee_attack_time_txt);
		melee_attack_time_range_box.appendChild(melee_attack_time_range);
		results.appendChild(melee_attack_time_range_box);

		const ranged_attack_time_range_box = document.createElement("div");
		const ranged_attack_time_txt = document.createElement("p");
		const ranged_attack_time_range = document.createElement("p");
		ranged_attack_time_txt.innerHTML = "R-SPEED";
		ranged_attack_time_range.innerHTML = parseInt(creature_query["RangedBaseAttackTime"]) / 1000 + " sec";
		ranged_attack_time_range_box.classList += "small-box";
		ranged_attack_time_range_box.appendChild(ranged_attack_time_txt);
		ranged_attack_time_range_box.appendChild(ranged_attack_time_range);
		results.appendChild(ranged_attack_time_range_box);

		const armor_range_box = document.createElement("div");
		const armor_txt = document.createElement("p");
		const armor_range = document.createElement("p");
		armor_txt.innerHTML = "ARMOR";
		armor_range.innerHTML = creature_query["Armor"];
		armor_range_box.classList += "small-box";
		armor_range_box.appendChild(armor_txt);
		armor_range_box.appendChild(armor_range);
		results.appendChild(armor_range_box);

		const school_box = document.createElement("div");
		const school_txt = document.createElement("p");
		const school = document.createElement("p");
		school_txt.innerHTML = "SCHOOL";
		school.innerHTML = getDamageSchool(creature_query["DamageSchool"]);
		school_box.classList += "small-box";
		school_box.appendChild(school_txt);
		school_box.appendChild(school);
		results.appendChild(school_box);

		const holy_resist = document.createElement("div");
		const fire_resist = document.createElement("div");
		const nature_resist = document.createElement("div");
		const frost_resist = document.createElement("div");
		const shadow_resist = document.createElement("div");
		const arcane_resist = document.createElement("div");
		const holy_text = document.createElement("p");
		const fire_text = document.createElement("p");
		const nature_text = document.createElement("p");
		const frost_text = document.createElement("p");
		const shadow_text = document.createElement("p");
		const arcane_text = document.createElement("p");
		const holy = document.createElement("p");
		const fire = document.createElement("p");
		const nature = document.createElement("p");
		const frost = document.createElement("p");
		const shadow = document.createElement("p");
		const arcane = document.createElement("p");
		holy_text.innerHTML = "HOLY";
		fire_text.innerHTML = "FIRE";
		nature_text.innerHTML = "NATURE";
		frost_text.innerHTML = "FROST";
		shadow_text.innerHTML = "SHADOW";
		arcane_text.innerHTML = "ARCANE";
		holy.innerHTML = creature_query["ResistanceHoly"];
		fire.innerHTML = creature_query["ResistanceFire"];
		nature.innerHTML = creature_query["ResistanceNature"];
		frost.innerHTML = creature_query["ResistanceFrost"];
		shadow.innerHTML = creature_query["ResistanceShadow"];
		arcane.innerHTML = creature_query["ResistanceArcane"];
		holy_resist.appendChild(holy_text);
		holy_resist.appendChild(holy);
		fire_resist.appendChild(fire_text);
		fire_resist.appendChild(fire);
		nature_resist.appendChild(nature_text);
		nature_resist.appendChild(nature);
		frost_resist.appendChild(frost_text);
		frost_resist.appendChild(frost);
		shadow_resist.appendChild(shadow_text);
		shadow_resist.appendChild(shadow);
		arcane_resist.appendChild(arcane_text);
		arcane_resist.appendChild(arcane);
		holy_resist.classList += "small-box";
		fire_resist.classList += "small-box";
		nature_resist.classList += "small-box";
		frost_resist.classList += "small-box";
		shadow_resist.classList += "small-box";
		arcane_resist.classList += "small-box";
		results.appendChild(holy_resist);
		results.appendChild(fire_resist);
		results.appendChild(nature_resist);
		results.appendChild(frost_resist);
		results.appendChild(shadow_resist);
		results.appendChild(arcane_resist);

		const faction_box = document.createElement("div");
		const faction_txt = document.createElement("p");
		const faction = document.createElement("p");
		faction_txt.innerHTML = "FACTION";
		faction.innerHTML = getFaction(creature_query["FactionAlliance"]);
		faction_box.classList += "objectives-box";
		faction_box.appendChild(faction_txt);
		faction_box.appendChild(faction);
		results.appendChild(faction_box);
		


		type.innerHTML = creature_query["CreatureType"];
		npcflags.innerHTML = creature_query["NpcFlags"];
		extraflags.innerHTML = creature_query["ExtraFlags"];
		rank.innerHTML = creature_query["Rank"];
		gold_range.innerHTML = creature_query["MinLootGold"] + " - " + creature_query["MaxLootGold"];
		immunes.innerHTML = creature_query["MechanicImmuneMask"];
		trainer_type.innerHTML = creature_query["TrainerType"];
		trainer_class.innerHTML = creature_query["TrainerClass"];
		trainer_race.innerHTML = creature_query["TrainerRace"];
		civilian.innerHTML = creature_query["Civilian"];

		results.appendChild(type);
		results.appendChild(npcflags);
		results.appendChild(extraflags);
		results.appendChild(rank);
		results.appendChild(gold_range);
		results.appendChild(immunes);

		results.appendChild(trainer_type);
		results.appendChild(trainer_class);
		results.appendChild(trainer_race);
		results.appendChild(civilian);

	}

	function getDamageSchool(school) {
		switch (school) {
			case 0:
				return "Normal";
			case 1:
				return "Holy";
			case 2:
				return "Fire";
			case 3:
				return "Nature";
			case 4:
				return "Frost";
			case 5:
				return "Shadow";
			case 6:
				return "Arcane";
			default:
				return "Normal"; 
		}
	}

	function getFaction(faction_id) {
		switch (faction_id - 1) {
			case 35:
				return "Friendly";
			case 168:
				return "Hostile";
			case 14:
				return "Unfriendly";
			case 7:
				return "Neutral";
			case 85:
				return "Orgrimmar";
			case 105:
				return "Thunder Bluff";
			case 68:
				return "Undercity";
			case 11:
				return "Stormwind City";
			case 79:
				return "Darnassus";
			case 55:
				return "Ironforge";
			case 120:
				return "Booty Bay";
			case 474:
				return "Gadgetzan";
			case 1625:
				return "Argent Dawn";
			case 529:
				return "Argent Dawn";
			case 87:
				return "Bloodsail Buccaneers";
			case 910:
				return "Brood of Nozdormu";
			case 609:
				return "Cenarion Circle";
			case 909:
				return "Darkmoon Faire";
			case 577:
				return "Everlook";
			case 729:
				return "Frostwolf Clan";
			case 369:
				return "Gadgetzan";
			case 92:
				return "Gelkis Clan Centaurs";
			case 749:
				return "Hydraxian Waterlords";
			case 93:
				return "Magram Clan Centaurs";
			case 470:
				return "Ratchet";
			case 349:
				return "Ravenhold";
			case 809:
				return "Shen'dralar";
			case 890:
				return "Silverwing Sentinels";
			case 730:
				return "Stormpike Guard";
			case 70:
				return "Syndicate";
			case 510:
				return "The Defilers";
			case 509:
				return "The League of Arathor";
			case 59:
				return "Thorium Brotherhood";
			case 576:
				return "Timbermaw Hold";
			case 889:
				return "Warsong Outriders";
			case 471:
				return "Wildhammer Clan";
			case 589:
				return "Wintersaber Trainers";
			case 270:
				return "Zandalar Tribe";
			default:
				return "None";
		}
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
	displayDroppedBy(Dictionary)
	Formats data as far as what creature or creatures drop an item. If no 
	creature drops the item, the table will not exist.
	***************************************************************************/
	function displayDroppedBy(npc_loot) {
		var loot = document.getElementById("loot");

		const npcs = npc_loot["result"];

		//  Setting up headings for a table
		const heading_row = document.createElement("tr");
		const heading_name = document.createElement("th");
		const heading_level = document.createElement("th");
		const heading_chance = document.createElement("th");

		heading_name.innerHTML = "Dropped By";
		heading_level.innerHTML = "Level";
		heading_chance.innerHTML = "%";

		heading_row.appendChild(heading_name);
		heading_row.appendChild(heading_level);
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
		
			name.innerHTML = npc["Name"];
			row.appendChild(name);
			
			// If Min and Max levels are the same just say it is that level
			// rather than a range of levels
			if (npc["MinLevel"] == npc["MaxLevel"]) {
				level.innerHTML = npc["MinLevel"];
			} else {
				level.innerHTML = npc["MinLevel"] + "-" + npc["MaxLevel"];
			}
			
			row.appendChild(level);
			drop.innerHTML = npc["ChanceOrQuestChance"];
			row.appendChild(drop);
			loot.appendChild(row);

		}
	}

	/***************************************************************************
	displayItem(Dictionary, Integer)
	Takes the JSON from a server request and builds a display for an item's
	stats for the client.
	***************************************************************************/
	function displayItem(json_results, requested) {
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
		getCreature();
	}

}());