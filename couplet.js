#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const thisPath = console.log(path.dirname(__filename));
const clear = require('clear');
const chalk = require('chalk');
const timestamp = require('unix-timestamp');

/* Load the Toolbox file */
let sourceData = fs.readFileSync('./newsource.txt').toString().split("\n");

function ksort(object) {
	var keys = Object.keys(object).sort(),
		sorted = {};
	for (let i in keys) {
		sorted[keys[i]] = object[keys[i]];
	}
	return sorted;
}

let final = [];

let p = -1;
let last = -100;

for (i in sourceData) {
	let e = sourceData[i].indexOf(' ');
	if (e > 0) {
		let arrays = [sourceData[i].slice(0, e), sourceData[i].slice(e + 1)];
		let field = arrays[0];
			field = field.replace(/\\/g, "").replace(/\r/g, "");
		let fieldValue = arrays[1].replace(/\r/g, "");

		if (field == "se" || field == "pl" || field == "xv" || field == "lx") { // sense, couplet, example or lexeme
			if (fieldValue.trim != "") {
				if (fieldValue.trim() != '') {
					p++;
					final[p] = {};
					final[p].lexeme = fieldValue;
					last = i;
				}
				//console.log(fieldValue);
				//console.log(next);
			}
		}
		if (field == "so") {
			if (fieldValue.trim != "") {
				if (fieldValue.trim() != '')
				if (last == i -2 || last == i -3) {
					final[p].sound = fieldValue;
				}
				last = -10;
			}
		}
	}
	/*if (field == "pd") {
		final[p].phonemic = fieldValue;
	}*/
	/*if (field == "so" && ) {
		final[p].sound = fieldValue;
	}*/
	/*if (field == "pde") {
		final[p].english = fieldValue;
	}*/
}

console.log(JSON.stringify(final,null,2))

saveJSON(final);

function saveJSON(fullArray) {
	let newarray = [];
	for (let i = 0; i < fullArray.length; i++) {
		if (typeof fullArray[i].sound != 'undefined') {
			newarray.push(fullArray[i]);
			console.log(fullArray[i]);
		}
	}
	fullArray = newarray;
	console.log("");
	console.log(chalk.green.bold('Saving file…'));
	var saveData = JSON.stringify(fullArray, null, '\t');
	fs.writeFile("./couplets.json", saveData, function(err) {
		if (err) {
			console.log(chalk.red.bold('Error: ' + err));
		} else {
			console.log(chalk.green.bold('File saved'));
			console.log("");
			console.log(chalk.green.bold('Updating Database…'));
			//insertDB(fullArray);
		}
	});
}

function getFields(limit) {
	console.log(chalk.bold("getting fields…"));
	console.log(sourceData.length + " lines found…");
	limit = sourceData.length;
	console.log("");
	var fieldList = [];
	for (i in sourceData) {
		if (i < limit) {
			if (sourceData[i].substring(0, 2) == "\\_" && i < 5) {
				// ignore the header
			} else if (sourceData[i].trim() == '') {
				// ignore blanks
			} else {
				var arrays = sourceData[i].split(" ");
				var field = arrays[0].replace(/\\/g, "").replace(/\r/g, "");
				if (fieldList.indexOf(field) === -1) {
					fieldList.push(field);
				}
			}
		}
	}
	createArrays(limit);
}

function findSource(sourceFile) {
	fs.access(sourceFile, function(err) {
		if (err && err.code === 'ENOENT') {
			// This isn't throwing the error. Figure out why.
			console.log(chalk.red.bold('source data missing'));
			console.log(chalk.red.bold('This is not good.'));
		} else {
			console.log(chalk.bold('source data: ') + chalk.green(sourceFile));
			getFields(3000);
		}
	});
}
