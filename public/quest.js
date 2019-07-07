/***************************************************************************
quest.js

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
	function getQuest() {
		var quest_id = window.location.search.replace("?quest=", "");

		var url = host + "/quest?quest_id=" + quest_id;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				displayQuest(json, quest_id);
			})

			.catch(function(error) {

			});
	}

	/***************************************************************************
	getById(String)
	Sends a request to the web server for a specific item's information and
	forwards that data to be displayed by the client.
	***************************************************************************/
	function getPrevQuest(prev_quest_id, directive) {
		var url = host + "/prev_quest?prev_quest_id=" + prev_quest_id;

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				const results = document.getElementById("results");
				const prev = document.createElement("div");
				prev.id = "links";
				const first_prev_text = document.createElement("p");
				const prev_quest = document.createElement("p");
				const prev_quest_title = document.createElement("p");
				first_prev_text.innerHTML = "You must " + directive + " ";
				prev_quest_title.innerHTML = json["result"][0]["Title"];
				prev_quest_title.classList += "questlink";
				prev.appendChild(first_prev_text);
				prev_quest_title.addEventListener("click", function() {
					location.replace(host + "/quest.html?quest=" + prev_quest_id);
				});
				prev.appendChild(prev_quest_title);
				prev_quest.innerHTML = " in order to accept this quest.";
				prev.appendChild(prev_quest);

				results.appendChild(prev);
			})

			.catch(function(error) {

			});
	}

	/***************************************************************************
	getRequiredItems(Array of Strings)
	Ask the web server for data to display required items for the quest.
	***************************************************************************/
	function getRequiredItems(item_ids) {
		var url = host + "/itemlink?item_id1=" + item_ids["item1"][0] + "&item_id2=" + item_ids["item2"][0] + "&item_id3=" + item_ids["item3"][0] + "&item_id4=" + item_ids["item4"][0];

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);

				const req_container = document.createElement("div");
				const req_grouping1 = document.createElement("div");
				const results = document.getElementById("results");

				const req_statement = document.createElement("p");
				req_statement.innerHTML += "Required items: ";

				const req_items1 = document.createElement("p");
				req_items1.innerHTML += json["item1"][0]["name"];
				req_items1.addEventListener("click", function() {
					location.replace(host + "/item.html?item=" + json["item1"][0]["entry"]);
				});

				var quality = findItemQuality(json["item1"][0]["Quality"]);
				req_items1.classList += quality;
				const item1_quantity = document.createElement("p");
				item1_quantity.innerHTML = "&nbsp; x" + item_ids["item1"][1];
				req_grouping1.classList += "push-left";
				req_container.appendChild(req_statement);
				req_grouping1.appendChild(req_items1);
				req_grouping1.appendChild(item1_quantity);
				req_container.appendChild(req_grouping1);

				if (item_ids["item2"][0] != "0") {
					const req_grouping2 = document.createElement("div");
					const req_items2 = document.createElement("p");
					req_items2.innerHTML += json["item2"][0]["name"];
					req_items2.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item2"][0]["entry"]);
					});
					quality = findItemQuality(json["item2"][0]["Quality"]);
					req_items2.classList += quality;
					const item2_quantity = document.createElement("p");
					item2_quantity.innerHTML = "&nbsp; x" + item_ids["item2"][1];
					req_grouping2.classList += "push-left";
					req_grouping2.appendChild(req_items2);
					req_grouping2.appendChild(item2_quantity);
					req_container.appendChild(req_grouping2);
				}

				if (item_ids["item3"][0] != "0") {
					const req_grouping3 = document.createElement("div");
					const req_items3 = document.createElement("p");
					req_items3.innerHTML += json["item3"][0]["name"];
					req_items3.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item3"][0]["entry"]);
					});
					quality = findItemQuality(json["item3"][0]["Quality"]);
					req_items3.classList += quality;
					const item3_quantity = document.createElement("p");
					item3_quantity.innerHTML = "&nbsp; x" + item_ids["item3"][1];
					req_grouping3.classList += "push-left";
					req_grouping3.appendChild(req_items3);
					req_grouping3.appendChild(item3_quantity);
					req_container.appendChild(req_grouping3);
				}

				if (item_ids["item4"][0] != "0") {
					const req_grouping4 = document.createElement("div");
					const req_items4 = document.createElement("p");
					req_items4.innerHTML += json["item4"][0]["name"];
					req_items4.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item4"][0]["entry"]);
					});
					quality = findItemQuality(json["item4"][0]["Quality"]);
					req_items4.classList += quality;
					const item4_quantity = document.createElement("p");
					item4_quantity.innerHTML = "&nbsp; x" + item_ids["item4"][1];
					req_grouping4.classList += "push-left";
					req_grouping4.appendChild(req_items4);
					req_grouping4.appendChild(item4_quantity);
					req_container.appendChild(req_grouping4);
				}

				req_container.classList += "item-box";
				results.appendChild(req_container);
			})

			.catch(function(error) {

			});
	}

	/***************************************************************************
	getRewardItems(Array of Strings)
	Queries database for information to display reward items for the quest.
	***************************************************************************/
	function getRewardItems(item_ids) {
		var url = host + "/itemlink?item_id1=" + item_ids["item1"][0] + "&item_id2=" + item_ids["item2"][0] + "&item_id3=" + item_ids["item3"][0] + "&item_id4=" + item_ids["item4"][0];

		fetch(url, {method : 'GET'})

			.then(checkStatus)
			.then(function(responseText) {
				var json = JSON.parse(responseText);
				const results = document.getElementById("results");
				const rew_container = document.createElement("div");
				rew_container.id = "rew_container";
				const rew_statement = document.createElement("p");
				rew_statement.innerHTML += "You will receive: ";

				const rew_grouping1 = document.createElement("div");
				const rew_items1 = document.createElement("p");
				rew_items1.innerHTML += json["item1"]["name"];
				rew_items1.addEventListener("click", function() {
					location.replace(host + "/item.html?item=" + json["item1"][0]["entry"]);
				});
				var quality = findItemQuality(json["item1"]["Quality"]);
				rew_items1.classList += quality;
				const item1_quantity = document.createElement("p");
				item1_quantity.innerHTML = "&nbsp; x" + item_ids["item1"][1];
				rew_container.appendChild(rew_statement);
				rew_grouping1.appendChild(rew_items1);
				rew_grouping1.appendChild(item1_quantity);
				rew_grouping1.classList += "push-left";
				rew_container.appendChild(rew_grouping1);

				if (item_ids["item2"][0] != "0") {
					const rew_grouping2 = document.createElement("div");
					const rew_items2 = document.createElement("p");
					rew_items2.innerHTML += json["item2"][0]["name"];
					rew_items2.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item2"][0]["entry"]);
					});
					quality = findItemQuality(json["item2"][0]["Quality"]);
					rew_items2.classList += quality;
					const item2_quantity = document.createElement("p");
					item2_quantity.innerHTML = "&nbsp; x" + item_ids["item2"][1];
					rew_grouping2.appendChild(rew_items2);
					rew_grouping2.appendChild(item2_quantity);
					rew_grouping2.classList += "push-left";
					rew_container.appendChild(rew_grouping2);
				}

				if (item_ids["item3"][0] != "0") {
					const rew_items3 = document.createElement("p");
					rew_items3.innerHTML += json["item3"][0]["name"];
					rew_items3.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item3"][0]["entry"]);
					});
					quality = findItemQuality(json["item3"][0]["Quality"]);
					rew_items3.classList += quality;
					const item3_quantity = document.createElement("p");
					item3_quantity.innerHTML = "&nbsp; x" + item_ids["item3"][1];
					rew_container.appendChild(rew_items3);
					rew_container.appendChild(item3_quantity);
				}

				if (item_ids["item4"][0] != "0") {
					const rew_items4 = document.createElement("p");
					rew_items4.innerHTML += json["item4"][0]["name"];
					rew_items4.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item4"][0]["entry"]);
					});
					quality = findItemQuality(json["item4"][0]["Quality"]);
					rew_items4.classList += quality;
					const item4_quantity = document.createElement("p");
					item4_quantity.innerHTML = "&nbsp; x" + item_ids["item4"][1];
					rew_container.appendChild(rew_items4);
					rew_container.appendChild(item4_quantity);
				}
				rew_container.classList += "item-box";
				results.appendChild(rew_container);
			})

			.catch(function(error) {

			});
	}

	/***************************************************************************
	getRewardChoiceItems(Array of Strings)
	Asks web server for data on items a player may choose for rewards for this
	quest.
	***************************************************************************/
	function getRewardChoiceItems(item_ids) {
		var url = host + "/itemlink?item_id1=" + item_ids["item1"][0] + "&item_id2=" + item_ids["item2"][0] + "&item_id3=" + item_ids["item3"][0] + "&item_id4=" + item_ids["item4"][0] + "&item_id5=" + item_ids["item5"][0] + "&item_id6" + item_ids["item6"][0];

		fetch(url, {method : 'GET'})
			.then(checkStatus)
			.then(function(responseText) {
				console.log(json);
				var json = JSON.parse(responseText);
				console.log(json);
				const results = document.getElementById("results");
				const choice_container = document.createElement("div");
				choice_container.id = "choice_container";
				const choice_statement = document.createElement("p");
				choice_statement.innerHTML += "You may choose from the following rewards: ";

				const choice_grouping1 = document.createElement("div");
				const choice_items1 = document.createElement("p");
				choice_items1.innerHTML += json["item1"][0]["name"];
				choice_items1.addEventListener("click", function() {
					location.replace(host + "/item.html?item=" + json["item1"][0]["entry"]);
				});
				var quality = findItemQuality(json["item1"][0]["Quality"]);
				choice_items1.classList += quality;
				const choice1_quantity = document.createElement("p");
				choice1_quantity.innerHTML = "&nbsp; x" + item_ids["item1"][1];
				choice_container.appendChild(choice_statement);
				choice_grouping1.appendChild(choice_items1);
				choice_grouping1.appendChild(choice1_quantity);
				choice_grouping1.classList += "push-left";
				choice_container.appendChild(choice_grouping1);

				if (item_ids["item2"][0] != "0") {
					const choice_grouping2 = document.createElement("div");
					const choice_items2 = document.createElement("p");
					choice_items2.innerHTML += json["item2"][0]["name"];
					choice_items2.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item2"][0]["entry"]);
					});
					quality = findItemQuality(json["item2"][0]["Quality"]);
					choice_items2.classList += quality;
					const choice2_quantity = document.createElement("p");
					choice2_quantity.innerHTML = "&nbsp; x" + item_ids["item2"][1];
					choice_grouping2.appendChild(choice_items2);
					choice_grouping2.appendChild(choice2_quantity);
					choice_grouping2.classList += "push-left";
					choice_container.appendChild(choice_grouping2);
				}

				if (item_ids["item3"][0] != "0") {
					const choice_grouping3 = document.createElement("div");
					const choice_items3 = document.createElement("p");
					choice_items3.innerHTML += json["item3"][0]["name"];
					choice_items3.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item3"][0]["entry"]);
					});
					quality = findItemQuality(json["item3"][0]["Quality"]);
					choice_items3.classList += quality;
					const choice3_quantity = document.createElement("p");
					choice3_quantity.innerHTML = "&nbsp; x" + item_ids["item3"][1];
					choice_grouping3.appendChild(choice_items3);
					choice_grouping3.appendChild(choice3_quantity);
					choice_grouping3.classList += "push-left";
					choice_container.appendChild(choice_grouping3);
				}

				if (item_ids["item4"][0] != "0") {
					const choice_grouping4 = document.createElement("div");
					const choice_items4 = document.createElement("p");
					choice_items4.innerHTML += json["item4"][0]["name"];
					choice_items4.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item4"][0]["entry"]);
					});
					quality = findItemQuality(json["item4"][0]["Quality"]);
					choice_items4.classList += quality;
					const choice4_quantity = document.createElement("p");
					choice4_quantity.innerHTML = "&nbsp; x" + item_ids["item4"][1];
					choice_grouping4.appendChild(choice_items4);
					choice_grouping4.appendChild(choice4_quantity);
					choice_grouping4.classList += "push-left";
					choice_container.appendChild(choice_grouping4);
				}

				if (item_ids["item5"][0] != "0") {
					const choice_grouping5 = document.createElement("div");
					const choice_items5 = document.createElement("p");
					choice_items5.innerHTML += json["item5"][0]["name"];
					choice_items5.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item5"][0]["entry"]);
					});
					quality = findItemQuality(json["item5"][0]["Quality"]);
					choice_items5.classList += quality;
					const choice5_quantity = document.createElement("p");
					choice5_quantity.innerHTML = "&nbsp; x" + item_ids["item5"][1];
					choice_grouping5.appendChild(choice_items5);
					choice_grouping5.appendChild(choice5_quantity);
					choice_grouping5.classList += "push-left";
					choice_container.appendChild(choice_grouping5);
				}

				if (item_ids["item6"][0] != "0") {
					const choice_grouping6 = document.createElement("div");
					const choice_items6 = document.createElement("p");
					choice_items6.innerHTML += json["item6"][0]["name"];
					choice_items6.addEventListener("click", function() {
						location.replace(host + "/item.html?item=" + json["item6"][0]["entry"]);
					});
					quality = findItemQuality(json["item6"][0]["Quality"]);
					choice_items6.classList += quality;
					const choice6_quantity = document.createElement("p");
					choice6_quantity.innerHTML = "&nbsp; x" + item_ids["item6"][1];
					choice_grouping6.appendChild(choice_items6);
					choice_grouping6.appendChild(choice6_quantity);
					choice_grouping6.classList += "push-left";
					choice_container.appendChild(choice_grouping6);
				}
				choice_container.classList += "item-box";
				results.appendChild(choice_container);
			})

			.catch(function(error) {

			});
	}

	/***************************************************************************
	displayQuest(Array, String)
	Displays data about the quest to the user.
	***************************************************************************/
	function displayQuest(json_results, requested){
		const quest_query = json_results["result"][0];

		const results = document.getElementById("results");

		const heading = document.createElement("h1");
		const objectives = document.createElement("p");

		const details = document.createElement("p");
		const offer_reward = document.createElement("p");
		const request_items = document.createElement("p");
		const end_text = document.createElement("p");
		const objective_1 = document.createElement("p");
		const objective_2 = document.createElement("p");
		const objective_3 = document.createElement("p");
		const objective_4 = document.createElement("p");

		const req_item_1 = document.createElement("p");
		const req_item_2 = document.createElement("p");
		const req_item_3 = document.createElement("p");
		const req_item_4 = document.createElement("p");
		const req_item_count_1 = document.createElement("p");
		const req_item_count_2 = document.createElement("p");
		const req_item_count_3 = document.createElement("p");
		const req_item_count_4 = document.createElement("p");

		const req_kill_1 = document.createElement("p");
		const req_kill_2 = document.createElement("p");
		const req_kill_3 = document.createElement("p");
		const req_kill_4 = document.createElement("p");
		const req_kill_count_1 = document.createElement("p");
		const req_kill_count_2 = document.createElement("p");
		const req_kill_count_3 = document.createElement("p");
		const req_kill_count_4 = document.createElement("p");

		const req_src = document.createElement("p");
		const rew_items = document.createElement("p");
		const rew_rep = document.createElement("p");

		const zone_or_sort = document.createElement("p");
		const min_level = document.createElement("p");
		const quest_level = document.createElement("p");
		const type = document.createElement("p");
		const suggested_players = document.createElement("p");
		const time_limit = document.createElement("p");
		const prev_quest = document.createElement("p");
		const next_quest = document.createElement("p");
		const next_in_chain = document.createElement("p");
		const given_item = document.createElement("p");
		const given_item_count = document.createElement("p");
		const rew_or_req_money = document.createElement("p");
		const rew_money_max = document.createElement("p");
		const rew_spell = document.createElement("p");
		const rew_cast = document.createElement("p");
		const rew_mail = document.createElement("p");
		const rew_mail_delay = document.createElement("p");

		var quest_type = getQuestType(quest_query["Type"]);
		if (quest_type == "Normal") {
			heading.innerHTML = quest_query["Title"];
		} else {
			heading.innerHTML = quest_query["Title"] + " (" + quest_type + ")";
		}

		var text = sanitizeText(quest_query["Details"]);
		details.innerHTML = text;

		objectives.innerHTML = quest_query["Objectives"];
		offer_reward.innerHTML = quest_query["OfferRewardText"];
		request_items.innerHTML = quest_query["RequestItemsText"];
		end_text.innerHTML = quest_query["EndText"];
		zone_or_sort.innerHTML = getZone(quest_query["ZoneOrSort"], json_results["zones"]);

		// Set Required Level Box
		const req_level_box = document.createElement("div");
		const req_level = document.createElement("p");
		const req_text = document.createElement("p");
		req_level.innerHTML = "REQ";
		min_level.innerHTML = quest_query["MinLevel"];
		req_text.innerHTML = "LVL";
		req_level_box.appendChild(req_level);
		req_level_box.appendChild(req_text);
		req_level_box.appendChild(min_level);
		req_level_box.classList += "small-box";

		// Set Quest Level Box
		const quest_level_box = document.createElement("div");
		const quest_txt_level = document.createElement("p");
		const lvl_text = document.createElement("p");
		quest_txt_level.innerHTML = "QUEST";
		quest_level.innerHTML = quest_query["QuestLevel"];
		lvl_text.innerHTML = "LVL";
		quest_level_box.appendChild(quest_txt_level);
		quest_level_box.appendChild(lvl_text);
		quest_level_box.appendChild(quest_level);
		quest_level_box.classList += "small-box";

		// Suggested Players
		if (quest_query["SuggestedPlayers"] != "0") {
			const players_box = document.createElement("div");
			const players_txt = document.createElement("p");
			const players = document.createElement("p");
			players_txt.innerHTML = "PLAYERS";
			players.innerHTML = quest_query["SuggestedPlayers"];
			players_box.appendChild(players_txt);
			players_box.appendChild(players);
		}

		// Time Limit
		if (quest_query["LimitTime"] != "0") {
			const time_box = document.createElement("div");
			const time_txt = document.createElement("p");
			const time = document.createElement("p");
			const seconds = document.createElement("p");
			time_txt.innerHTML = "LIMIT";
			time.innerHTML = quest_query["LimitTime"];
			time.innerHTML = "SECS"
			time_box.appendChild(time_txt);
			time_box.appendChild(time);
			time_box.appendChild(seconds);
		}

		if (parseInt(quest_query["PrevQuestId"]) > 0) {
			getPrevQuest(quest_query["PrevQuestId"], "complete");
		} else if (parseInt(quest_query["PrevQuestId"]) < 0) {
			getPrevQuest(requested, "accept");
		}

		if (parseInt(quest_query["NextQuestId"]) != 0) {
			next_quest.innerHTML = quest_query["NextQuestId"] + " is a follow up quest";
		}

		if (parseInt(quest_query["NextQuestInChain"]) != 0) {
			next_in_chain.innerHTML = quest_query["NextQuestInChain"] + " is the next quest in this chain";
		}

		if (quest_query["SrcItemId"] != "0") {
			var src_item = {};
			src_item["item1"] = [quest_query["SrcItemId"], quest_query["SrcItemCount"]];
			// this item will be given to complete quest
		}

		if (quest_query["ReqSourceId1"] != "0") {
			req_src.innerHTML = "You will need to use " + quest_query["ReqSourceId1"] + " x" + quest_query["ReqSourceCount1"];
		}

		if (quest_query["ReqSourceId2"] != "0") {
			req_src.innerHTML += ", " + quest_query["ReqSourceId2"] + " x" + quest_query["ReqSourceCount2"];
		}

		if (quest_query["ReqSourceId3"] != "0") {
			req_src.innerHTML += ", " + quest_query["ReqSourceId3"] + " x" + quest_query["ReqSourceCount3"];
		}

		if (quest_query["ReqSourceId4"] != "0") {
			req_src.innerHTML += ", " + quest_query["ReqSourceId3"] + " x" + quest_query["ReqSourceCount3"];
		}

		if (quest_query["ReqSourceId1"] != "0") {
			req_src.innerHTML += " to complete this quest";
		}

		if (parseInt(quest_query["RewOrReqMoney"]) > 0) {
			rew_or_req_money.innerHTML = quest_query["RewOrReqMoney"] + " copper will be awarded";
		} else if (parseInt(quest_query["RewOrReqMoney"]) < 0) {
			rew_or_req_money.innerHTML = "Completing this quest will require " + quest_query["RewOrReqMoney"] + " copper";
		}

		if (parseInt(quest_query["RewMoneyMaxLevel"]) > 0) {
			rew_money_max.innerHTML = quest_query["RewMoneyMaxLevel"] + " copper will be awarded at level 60";
		} else if (parseInt(quest_query["RewMoneyMaxLevel"]) < 0) {
			rew_money_max.innerHTML = "At level 60, completing this quest will require " + quest_query["RewMoneyMaxLevel"] + " copper";
		}

		if (quest_query["RewSpell"] != "0") {
			rew_spell.innerHTML = quest_query["RewSpell"] + " will be cast on your upon completing this quest";
		}

		if (quest_query["RewSpellCast"] != "0") {
			rew_cast.innerHTML = quest_query["RewSpellCast"] + " will be cast on your upon completing this quest";
		}

		if (quest_query["RewMailTemplateId"] != "0") {
			rew_mail.innerHTML = "You will receive something in the mail " + quest_query["RewMailDelaySecs"] + " seconds after completing this quest";
		}

		// Objective Text
		if (quest_query["ObjectiveText1"] != "") {
			const obj_box = document.createElement("div");
			const obj_txt = document.createElement("h3");
			const obj = document.createElement("ul");
			obj_txt.innerHTML = "Objectives";
			obj.innerHTML = "";
			obj_box.appendChild(obj_txt);
			players_box.appendChild(obj);

			const obj1 = document.createElement("li");
			obj1.innerHTML = quest_query["ObjectiveText1"];
			obj.appendChild(obj1);

			if (quest_query["ObjectiveText2"] != "") {
				const obj2 = document.createElement("li");
				obj2.innerHTML = quest_query["ObjectiveText2"];
				obj.appendChild(obj2);
			}
			if (quest_query["ObjectiveText3"] != "") {
				const obj3 = document.createElement("li");
				obj3.innerHTML = quest_query["ObjectiveText3"];
				obj.appendChild(obj3);
			}

			if (quest_query["ObjectiveText4"] != "") {
				const obj4 = document.createElement("li");
				obj4.innerHTML = quest_query["ObjectiveText4"];
				obj.appendChild(obj4);
			}
			obj_box.appendChild(obj_txt);
			obj_box.appendChild(obj);
		}

		// Required Items to complete the quest
		var required_items = {};
		if (quest_query["ReqItemId1"] != "0") {
			required_items["item1"] = [quest_query["ReqItemId1"], quest_query["ReqItemCount1"]];
		
			if (quest_query["ReqItemId2"] != "0") {
				required_items["item2"] = [quest_query["ReqItemId2"], quest_query["ReqItemCount2"]];
			} else {
				required_items["item2"] = ["0", "0"];
			}

			if (quest_query["ReqItemId3"] != "0") {
				required_items["item3"] = [quest_query["ReqItemId3"], quest_query["ReqItemCount3"]];
			} else {
				required_items["item3"] = ["0", "0"];
			}

			if (quest_query["ReqItemId4"] != "0") {
				required_items["item4"] = [quest_query["ReqItemId4"], quest_query["ReqItemCount4"]];
			} else {
				required_items["item4"] = ["0", "0"];
			}
			getRequiredItems(required_items);
		}

		// Kills, Casts and Game Objects Required
		const kill_box = document.createElement("div");
		const kill_list = document.createElement("ul");		
		if (parseInt(quest_query["ReqCreatureOrGOId1"]) > 0) {
			const kill1 = document.createElement("li");
			if (quest_query["ReqSpellCast1"] != "0") {
				kill1.innerHTML = "Cast spell on " + quest_query["ReqCreatureOrGOId1"] + " x" + quest_query["ReqCreatureOrGOCount1"];
			} else {
				kill1.innerHTML = "Kill " + quest_query["ReqCreatureOrGOId1"] + " x" + quest_query["ReqCreatureOrGOCount1"];
			}
			kill_list.appendChild(kill1);
		} else if (parseInt(quest_query["ReqCreatureOrGOId1"]) < 0) {
			const kill1 = document.createElement("li");
			kill1.innerHTML = "Use " + quest_query["ReqCreatureOrGOId1"] + " x" + quest_query["ReqCreatureOrGOCount1"];
			kill_list.appendChild(kill1);
		}

		if (parseInt(quest_query["ReqCreatureOrGOId2"]) > 0) {
			const kill2 = document.createElement("li");
			if (quest_query["ReqSpellCast2"] != "0") {
				kill2.innerHTML = "Cast spell on " + quest_query["ReqCreatureOrGOId2"] + " x" + quest_query["ReqCreatureOrGOCount2"];
			} else {
				kill2.innerHTML = "Kill " + quest_query["ReqCreatureOrGOId2"] + " x" + quest_query["ReqCreatureOrGOCount2"];
			}
			kill_list.appendChild(kill2);
		} else if (parseInt(quest_query["ReqCreatureOrGOId2"]) < 0) {
			const kill2 = document.createElement("li");
			kill2.innerHTML = "Use " + quest_query["ReqCreatureOrGOId2"] + " x" + quest_query["ReqCreatureOrGOCount2"];
			kill_list.appendChild(kill2);
		}

		if (parseInt(quest_query["ReqCreatureOrGOId3"]) > 0) {
			const kill3 = document.createElement("li");
			if (quest_query["ReqSpellCast3"] != "0") {
				kill3.innerHTML = "Cast spell on " + quest_query["ReqCreatureOrGOId3"] + " x" + quest_query["ReqCreatureOrGOCount3"];
			} else {
				kill3.innerHTML = "Kill " + quest_query["ReqCreatureOrGOId3"] + " x" + quest_query["ReqCreatureOrGOCount3"];
			}
			kill_list.appendChild(kill3);
		} else if (parseInt(quest_query["ReqCreatureOrGOId3"]) < 0) {
			const kill3 = document.createElement("li");
			kill3.innerHTML = "Use " + quest_query["ReqCreatureOrGOId3"] + " x" + quest_query["ReqCreatureOrGOCount3"];
			kill_list.appendChild(kill3);
		}

		if (parseInt(quest_query["ReqCreatureOrGOId4"]) > 0) {
			const kill4 = document.createElement("li");
			if (quest_query["ReqSpellCast4"] != "0") {
				kill4.innerHTML = "Cast spell on " + quest_query["ReqCreatureOrGOId4"] + " x" + quest_query["ReqCreatureOrGOCount4"];
			} else {
				kill4.innerHTML = "Kill " + quest_query["ReqCreatureOrGOId4"] + " x" + quest_query["ReqCreatureOrGOCount4"];
			}
			kill_list.appendChild(kill4);
		} else if (parseInt(quest_query["ReqCreatureOrGOId4"]) < 0) {
			const kill4 = document.createElement("li");
			kill_4.innerHTML = "Use " + quest_query["ReqCreatureOrGOId4"] + " x" + quest_query["ReqCreatureOrGOCount4"];
			kill_list.appendChild(kill4);
		}
		kill_box.appendChild(kill_list);

		// Reward Choices
		var rew_choices = {};
		if (quest_query["RewChoiceItemId1"] != "0") {
			rew_choices["item1"] = [quest_query["RewChoiceItemId1"], quest_query["RewChoiceItemCount1"]];
		
			if (quest_query["RewChoiceItemId2"] != "0") {
				rew_choices["item2"] = [quest_query["RewChoiceItemId2"], quest_query["RewChoiceItemCount2"]];
			} else {
				rew_choices["item2"] = ["0", "0"];
			}

			if (quest_query["RewChoiceItemId3"] != "0") {
				rew_choices["item3"] = [quest_query["RewChoiceItemId3"], quest_query["RewChoiceItemCount3"]];
			} else {
				rew_choices["item3"] = ["0", "0"];
			}

			if (quest_query["RewChoiceItemId4"] != "0") {
				rew_choices["item4"] = [quest_query["RewChoiceItemId4"], quest_query["RewChoiceItemCount4"]];
			} else {
				rew_choices["item4"] = ["0", "0"];
			}

			if (quest_query["RewChoiceItemId5"] != "0") {
				rew_choices["item5"] = [quest_query["RewChoiceItemId5"], quest_query["RewChoiceItemCount5"]];
			} else {
				rew_choices["item5"] = ["0", "0"];
			}

			if (quest_query["RewChoiceItemId6"] != "0") {
				rew_choices["item6"] = [quest_query["RewChoiceItemId6"], quest_query["RewChoiceItemCount6"]];
			} else {
				rew_choices["item6"] = ["0", "0"];
			}
			getRewardChoiceItems(rew_choices);
		}

		// Rewards
		var reward_items = {};
		if (quest_query["RewItemId1"] != "0") {
			reward_items["item1"] = [quest_query["RewItemId1"], quest_query["RewItemCount1"]];
		
			if (quest_query["RewItemId2"] != "0") {
				reward_items["item2"] = [quest_query["RewItemId2"], quest_query["RewItemCount2"]];
			} else {
				reward_items["item2"] = ["0", "0"];
			}

			if (quest_query["RewItemId3"] != "0") {
				reward_items["item3"] = [quest_query["RewItemId3"], quest_query["RewItemCount3"]];
			} else {
				reward_items["item3"] = ["0", "0"];
			}

			if (quest_query["RewItemId4"] != "0") {
				reward_items["item4"] = [quest_query["RewItemId4"], quest_query["RewItemCount4"]];
			} else {
				reward_items["item4"] = ["0", "0"];
			}
			getRewardItems(reward_items);
		}

		if (quest_query["RewRepFaction1"] != "0") {
			rew_rep.innerHTML = "+" + quest_query["RewRepValue1"] + quest_query["RewRepFaction1"] + " Reputation";
		}

		if (quest_query["RewRepFaction2"] != "0") {
			rew_rep.innerHTML += ", +" + quest_query["RewRepValue2"] + quest_query["RewRepFaction2"] + " Reputation";
		}

		if (quest_query["RewRepFaction3"] != "0") {
			rew_rep.innerHTML += ", +" + quest_query["RewRepValue3"] + quest_query["RewRepFaction3"] + " Reputation";
		}

		if (quest_query["RewRepFaction4"] != "0") {
			rew_rep.innerHTML += ", +" + quest_query["RewRepValue4"] + quest_query["RewRepFaction4"] + " Reputation";
		}

		if (quest_query["RewRepFaction5"] != "0") {
			rew_rep.innerHTML += ", +" + quest_query["RewRepValue5"] + quest_query["RewRepFaction5"] + " Reputation";
		}

		results.appendChild(heading);
		results.appendChild(objectives);
		results.appendChild(details);
		results.appendChild(zone_or_sort);
		results.appendChild(req_level_box);
		results.appendChild(quest_level_box);
		results.appendChild(players_box);
		results.appendChild(time_limit);
		results.appendChild(prev_quest);
		results.appendChild(next_quest);
		results.appendChild(next_in_chain);
		results.appendChild(given_item);
		results.appendChild(rew_or_req_money);
		results.appendChild(rew_money_max);
		results.appendChild(rew_spell);
		results.appendChild(rew_cast);
		results.appendChild(rew_mail);
		results.appendChild(rew_mail_delay);

		results.appendChild(obj);
		results.appendChild(req_src);
		results.appendChild(req_item_1);
		results.appendChild(req_item_2);
		results.appendChild(req_item_3);
		results.appendChild(req_item_4);
		results.appendChild(req_kill_1);
		results.appendChild(req_kill_2);
		results.appendChild(req_kill_3);
		results.appendChild(req_kill_4);
		results.appendChild(req_kill_count_1);
		results.appendChild(req_kill_count_2);
		results.appendChild(req_kill_count_3);
		results.appendChild(req_kill_count_4);
		results.appendChild(rew_items);
		results.appendChild(rew_rep);
	}

	/***************************************************************************
	getZone(Integer, Array of Strings)
	Figures out what zone the quest is in based on its location header in 
	quest logs. For instance, returns Elywnn Forest for Northshire Valley
	***************************************************************************/
	function getZone(areaID, zones) {
		var area = String(areaID);
		var zone_data = zones[area];
		var zone = "";
		if (zone_data[2] == 0) {
			zone = zone_data[0];
		} else {
			var new_zone_data = zones[zone_data[2]];
			zone = zone_data[0] + " in " + new_zone_data[0];
		}
		return zone;
	}

	/***************************************************************************
	sanitizeText(String)
	Gets rid of escape characters and replaces them inside quest text.
	***************************************************************************/
	function sanitizeText(text) {
		if (text.includes("$B")) {
			text = text.replace("$B$B$B", "<br /><br /><br />")
			text = text.replace("$B$B", "<br /><br />")
			text = text.replace("$B", "<br />");
		}
		return text;
	}

	/***************************************************************************
	getQuestType(Integer)
	Returns what type of quest based on an ID.
	***************************************************************************/
	function getQuestType(type) {
		switch (type) {
			case 1:
				return "Elite";
			case 21:
				return "Life";
			case 41:
				return "PvP";
			case 62:
				return "Raid";
			case 81:
				return "Dungeon";
			case 82:
				return "World Event";
			case 83:
				return "Legendary";
			default:
				return "Normal";
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
		getQuest();
	}

}());