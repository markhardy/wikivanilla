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

	//const host = "http://127.0.0.1:3000";
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
				displayCreature(json, npc_id);
			})

			.catch(function(error) {

			});
	}

	function getLoot(loot_id) {
		var url = host + "/npc_loot?loot_id=" + loot_id;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				displayLoot(json);
			})

			.catch(function(error) {

			});
	}

	function displayLoot(json) {
		var loot = json[0];
		var results = document.getElementById("results");
		var loot_table = document.createElement("table");
		const loot_caption = document.createElement("caption");
		loot_caption.innerHTML = "Loot Table";
		loot_table.id = "loot";
		loot_table.classList.add("search-table");
		loot_table.appendChild(loot_caption);

		//  Setting up headings for a table
		const heading_row = document.createElement("tr");
		const heading_name = document.createElement("th");
		const heading_req_level = document.createElement("th");
		const heading_item_level = document.createElement("th");
		const heading_type = document.createElement("th");
		const heading_chance = document.createElement("th");
		heading_row.classList.add("search-tr");
		heading_name.classList.add("search-th");
		heading_req_level.classList.add("search-th");
		heading_item_level.classList.add("search-th");
		heading_type.classList.add("search-th");
		heading_chance.classList.add("search-th");

		heading_name.innerHTML = "Name";
		heading_req_level.innerHTML = "Required Level";
		heading_item_level.innerHTML = "Item Level";
		heading_type.innerHTML = "Type";
		heading_chance.innerHTML = "%";

		heading_row.appendChild(heading_name);
		heading_row.appendChild(heading_req_level);
		heading_row.appendChild(heading_item_level);
		heading_row.appendChild(heading_type);
		heading_row.appendChild(heading_chance);
		loot_table.appendChild(heading_row);

		// For each creature that drops an item, display its name, level and
		// chance to drop the item into the table
		for (var item of loot) {
			const row = document.createElement("tr");
			const name = document.createElement("td");
			const req_level = document.createElement("td");
			const item_level = document.createElement("td");
			const type = document.createElement("td");
			const drop = document.createElement("td");
			row.classList.add("search-tr");
			name.classList.add("search-td");
			req_level.classList.add("search-td");
			item_level.classList.add("search-td");
			type.classList.add("search-td");
			drop.classList.add("search-td");
			name.classList.add(findItemQuality(item["Quality"]));
			name.id = "search";
			name.type = "search";
			name.name = "search";
			name.innerHTML = "<a href='#' data-wowhead='item=" + String(item["entry"]) + "&amp;domain=classic'>[" + item["name"] + "]</a>";
			row.appendChild(name);
			req_level.innerHTML = item["RequiredLevel"];
			item_level.innerHTML = item["ItemLevel"];
			
			row.appendChild(req_level);
			row.append(item_level);

			type.innerHTML = findItemSubclass(item["class"], item["subclass"]);
			row.appendChild(type);

			drop.innerHTML = item["ChanceOrQuestChance"];
			row.appendChild(drop);

			row.addEventListener("click", function() {
				window.location.href = host + "/item.html?item=" + item["entry"];
			});
			loot_table.appendChild(row);

		}
		results.appendChild(loot_table);
	}

	function displayCreature(json_results, requested){
		const creature_query = json_results["result"][0];

		const results = document.getElementById("results");
		const heading = document.createElement("h1");
		const subname = document.createElement("h2");

		const immunes = document.createElement("p");

		const trainer_type = document.createElement("p");
		const trainer_class = document.createElement("p");
		const trainer_race = document.createElement("p");
		const civilian = document.createElement("p");

		heading.innerHTML = creature_query["Name"];
		subname.innerHTML = creature_query["SubName"];
		results.appendChild(heading);
		results.appendChild(subname);

		const hp_range_box = document.createElement("div");
		const hp_txt = document.createElement("p");
		const hp_range = document.createElement("p");
		hp_txt.innerHTML = "HP";
		hp_range.innerHTML = creature_query["MinLevelHealth"] + " - " + creature_query["MaxLevelHealth"];
		hp_range_box.classList += "HP-box";
		hp_range_box.appendChild(hp_range);
		results.appendChild(hp_range_box);

		if (creature_query["MaxLevelMana"] > 0) {
			const mana_range_box = document.createElement("div");
			const mana_txt = document.createElement("p");
			const mana_range = document.createElement("p");
			mana_txt.innerHTML = "MANA";
			mana_range.innerHTML = creature_query["MinLevelMana"] + " - " + creature_query["MaxLevelMana"];
			mana_range_box.classList += "mana-box";
			mana_range_box.appendChild(mana_range);
			results.appendChild(mana_range_box);
		}

		var melee_dmg = "0";
		if (creature_query["MaxMeleeDmg"] > 0) {
			melee_dmg = +creature_query["MinMeleeDmg"].toFixed(2) + " - " + +creature_query["MaxMeleeDmg"].toFixed(2);
		}

		var ranged_dmg = "0";
		if (creature_query["MaxRangedDmg"] > 0) {
			ranged_dmg = +creature_query["MinRangedDmg"].toFixed(2) + " - " + +creature_query["MaxRangedDmg"].toFixed(2);
		}

		var level = "";
		if (creature_query["MinLevel"] == creature_query["MaxLevel"]) {
			level = creature_query["MinLevel"];
		} else {
			level = creature_query["MinLevel"] + " - " + creature_query["MaxLevel"];
		}

		var armor_val = creature_query["Armor"];
		const stat_names = ["Level", "Melee Damage", "Ranged Damage", "Armor", "Holy Resistance", "Fire Resistance", "Frost Resistance", "Nature Resistance", "Shadow Resistance", "Arcane Resistance"];
		const stats = [level, melee_dmg, ranged_dmg, armor_val, creature_query["ResistanceHoly"], creature_query["ResistanceFire"], creature_query["ResistanceFrost"], creature_query["ResistanceNature"], creature_query["ResistanceShadow"], creature_query["ResistanceArcane"]];
		const stat_icons = ["INV_Mushroom_11.png", "INV_Sword_24.png", "INV_Weapon_Bow_05.png", "INV_Shield_06.png", "Spell_Holy_HolyProtection.png", "Spell_Fire_Fire.png", "Spell_Frost_FrostShock.png", "Spell_Nature_ProtectionformNature.png", "Spell_Shadow_AntiShadow.png", "Spell_Nature_WispSplode.png"]
		const stats_box = document.createElement("table");
		const caption = document.createElement("caption");
		caption.innerHTML = "Stats";
		stats_box.appendChild(caption);

		for (var i = 0; i < stats.length; i++) {
			const tooltip_text = document.createElement("span");
			tooltip_text.classList.add("tooltiptext")
			tooltip_text.innerHTML += stat_names[i];
			const stat_row = document.createElement("tr");
			const stat = document.createElement("td");
			const stat_val = document.createElement("td");
			stat_row.classList.add("tooltip");
			stat.classList.add("resistance-td");
			stat_val.classList.add("resistance-td");
			const stat_icon = document.createElement("img");
			stats_box.classList.add("resistance-box");
			stat_icon.classList.add("resistance-icon");
			stat_icon.src = "/icons/" + stat_icons[i];
			stat_icon.alt = stat_names[i];
			stat.appendChild(stat_icon);
			stat_val.innerHTML += stats[i];

			stat_row.appendChild(stat);
			stat_row.appendChild(stat_val);
			stat_row.appendChild(tooltip_text);

			stats_box.append(stat_row);
		}

		const min_money = creature_query["MinLootGold"];
		const max_money = creature_query["MaxLootGold"];

		const avg_money = ((min_money + max_money) / 2).toFixed(0);

		const wealth = document.createElement("div");

		const gold_icon = document.createElement("img");
		gold_icon.classList.add("money-icon");
		gold_icon.src = "/icons/INV_Misc_Coin_02.png";
		gold_icon.alt = "Gold";
		wealth.appendChild(gold_icon);
		wealth.innerHTML += Math.floor(avg_money / 10000);

		const silver_icon = document.createElement("img");
		silver_icon.classList.add("money-icon");
		silver_icon.src = "/icons/INV_Misc_Coin_04.png";
		silver_icon.alt = "Silver";
		wealth.appendChild(silver_icon);
		wealth.innerHTML += Math.floor(avg_money / 100);

		const copper_icon = document.createElement("img");
		copper_icon.classList.add("money-icon");
		copper_icon.src = "/icons/INV_Misc_Coin_06.png";
		copper_icon.alt = "Copper";
		wealth.appendChild(copper_icon);
		wealth.innerHTML += Math.floor(avg_money);

		const tooltip_text = document.createElement("span");
		tooltip_text.classList.add("tooltiptext")
		tooltip_text.innerHTML += "Wealth";
		wealth.classList.add("tooltip");
		wealth.appendChild(tooltip_text);

		if (creature_query["MechanicImmuneMask"] > 0) {
			immunes.innerHTML = "Immunities: " + getImmunities(creature_query["MechanicImmuneMask"]);
		}

		if (creature_query["TrainerType"] > 0) {
			trainer_type.innerHTML = getTrainerType(creature_query["TrainerType"], creature_query["TrainerRace"]) + " Trainer";
		}

		if (creature_query["TrainerClass"] > 0) {
			trainer_class.innerHTML = getTrainerClass(creature_query["TrainerClass"]) + " Trainer";
		}

		stats_box.appendChild(wealth);

		results.appendChild(stats_box);


		if (creature_query["FactionAlliance"] > 0) {

		}

		var faction_name = getFaction(creature_query["FactionAlliance"]);
		if (faction_name != "None") {
			const faction = document.createElement("p");
			faction.innerHTML = "Faction: " + faction_name;
		}

		if (creature_query["CreatureType"] > 0) {
			const type_npc = document.createElement("p");
			type_npc.innerHTML = getType(creature_query["CreatureType"]);
		}

		if (creature_query["NpcFlags"] > 0) {
			const npcflags = document.createElement("p");
			npcflags.innerHTML = getFlags(creature_query["NpcFlags"]);
		}

		if (creature_query["Rank"] > 0) {
			const rank = document.createElement("p");
			rank.innerHTML = getRank(creature_query["Rank"]);
		}

		results.appendChild(immunes);

		results.appendChild(trainer_type);
		results.appendChild(trainer_class);
		results.appendChild(trainer_race);
		results.appendChild(civilian);

		getLoot(creature_query["LootId"]);
	}

	function getTrainerClass(trainer_class) {
		switch (trainer_class) {
			case 1:
				return "Warrior";
			case 2:
				return "Paladin";
			case 3:
				return "Hunter";
			case 4:
				return "Rogue";
			case 5:
				return "Priest";
			case 7:
				return "Shaman";
			case 8:
				return "Mage";
			case 9:
				return "Warlock";
			case 11:
				return "Druid";
			default:
				return "Class";

		}
	}

	function getTrainerType(trainer_type, trainer_race) {
		switch (trainer_type) {
			case 1:
				switch (trainer_race) {
					case 1:
						return "Human Riding";
					case 2:
						return "Orcish Riding";
					case 3:
						return "Dwarven Riding";
					case 4:
						return "Night Elf Riding";
					case 5:
						return "Undead Riding";
					case 6:
						return "Tauren Riding";
					case 7:
						return "Gnomish Riding";
					case 8:
						return "Troll Riding";
					default:
						return "Riding";
				}

			case 2:
				return "Trade Skill";
			case 3:
				return "Pet";
			default:
				return "";
		}
	}

	function getImmunities(immune_mask) {
		switch (immune_mask) {
			case 0:
				return "";
			case 1:
				return "Charm";
			case 2:
				return "Confused";
			case 4:
				return "Disarm";
			case 8:
				return "Distract";
			case 16:
				return "Fear";
			case 32:
				return "Fumble";
			case 64:
				return "Root";
			case 128:
				return "Pacify";
			case 256:
				return "Silence";
			case 512:
				return "Sleep";
			case 1024:
				return "Snare";
			case 2048:
				return "Stun";
			case 4096:
				return "Freeze";
			case 8192:
				return "Knockdown";
			case 16384:
				return "Bleed";
			case 32768:
				return "Bandage";
			case 65536:
				return "Polymorph";
			case 131072:
				return "Banish";
			case 262144:
				return "Shield";
			case 524288:
				return "Shackle";
			case 1048576:
				return "Mount";
			case 2097152:
				return "Persuade";
			case 4194304:
				return "Turn";
			case 8388608:
				return "Horror";
			case 16777216:
				return "Invulnerability";
			case 33554432:
				return "Interrupt";
			case 67108864:
				return "Daze";
			case 134217728:
				return "Discovery";
			case 536870912:
				return "Sap";
			default:
				return "";
		}
	}

	function getReact(faction_id) {
		if (faction_id == 35 || faction_id == 776 || faction_id == 914 || faction_id == 874 || faction_id == 875 || faction_id == 814 || faction_id == 855 || faction_id == 854 || faction_id == 794 || faction_id == 735 || faction_id == 695 || faction_id == 674 || faction_id == 69 || faction_id == 390 || faction_id == 120 || faction_id == 121 || faction_id == 474 || faction_id == 1625 || faction_id == 529 || faction_id == 474 || faction_id == 475 || faction_id == 476) {
			return ["friendly", "friendly"];
		}
		else if (faction_id == 11 || faction_id == 774 || faction_id == 694 || faction_id == 412 || faction_id == 124 || faction_id == 123 || faction_id == 122 || faction_id == 12 || faction_id == 55 || faction_id == 56 || faction_id == 57) {
			return ["friendly", "hostile"];

		} else if (faction_id == 104 || faction_id == 877 || faction_id == 714 || faction_id == 125 || faction_id == 126 || faction_id == 68 || faction_id == 105 || faction_id == 85) {
			return ["hostile", "friendly"];
		} else if (faction_id == 15 || faction_id == 31){
			return ["neutral", "neutral"];
		}
		}

	function getRank(rank) {
		switch(rank) {
			case 0:
				return "Normal";
			case 1:
				return "Elite";
			case 2:
				return "Rare Elite";
			case 3:
				return "World Boss";
			case 4:
				return "Rare";
			default:
				return "Normal";
		}
	}

	function getFlags(flag) {
		switch(flag) {
			case 2:
				return "Questgiver";
			case 3:
				return "Questgiver";
			case 4:
				return "Vendor";
			case 5:
				return "Vendor";
			case 6:
				return "Vendor";
			case 7:
				return "Vendor";
			case 11:
				return "Flightmaster";
			case 16:
				return "Trainer";
			case 17:
				return "Trainer";
			case 18:
				return "Trainer";
			case 19:
				return "Trainer";
			case 21:
				return "Trainer";
			case 23:
				return "Trainer";
			case 33:
				return "Spirit Healer"; 
			case 64:
				return "Spirit Healer";
			case 85:
				return "Vendor";
			case 133:
				return "Innkeeper";
			case 135:
				return "Innkeeper";
			case 256:
				return "Banker";
			case 257:
				return "Banker";
			case 258:
				return "Banker";
			case 259:
				return "Banker";
			case 1029:
				return "Tabard Vendor";
			case 1537:
				return "Guild Master";
			case 2049:
				return "Battlemaster";
			case 4096:
				return "Auctioneer";
			case 4224:
				return "Vendor";
			case 8193:
				return "Stable Master";
			case 8195:
				return "Stable Master";
			case 16388:
				return "Repair";
			case 16389:
				return "Repair";
			case 16390:
				return "Repair";
			case 16391:
				return "Repair";
			case 524288:
				return "Tabard Designer";
			case 268435456:
				return "PvP";
			case 268435457:
				return "PvP";
			case 268435458:
				return "PvP";
			case 268435459:
				return "PvP";
			default:
				return "None";
		}
	}

	function getType(type_id) {
		switch(type_id) {
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
				return "Not specified";
			case 11:
				return "Totem";
			default:
				return "Not specified"; 
		}
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
		switch (faction_id) {
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
				switch (item_subclass) {
					case 0:
						return "Refreshment"
					case 3:
						return "Potion"
					case 4:
						return "Scroll";
					case 5:
						return "Bandage";
					case 6:
						return "Healthstone";
					default:
						return "";
				}

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
				return "Trade Good";

			case 9:
				return "Recipe";
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

			case 12:
				return "Quest";

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
		getCreature();
	}

}());