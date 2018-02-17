#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const thisPath = console.log(path.dirname(__filename));
const clear = require('clear');
const chalk = require('chalk');
const timestamp = require('unix-timestamp');

/* Load the Toolbox file */
let sourceData = fs.readFileSync('./mos.txt').toString().split("\n");

let alldocs = []

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
	let line = sourceData[i].split('\t')
	if (line[0] != '') {
		let thisdoc = {}
		for (let e = 0; e < 7; e++) {
			if (typeof line[e] === 'undefined') {line[e] = '';}
		}
		thisdoc.lexeme = line[0];
		thisdoc.pairing = '';
		thisdoc.phonemic = line[1];
		thisdoc.song = {};
		thisdoc.song.word = '';
		thisdoc.song.source = '';
		thisdoc.sense = [];
		thisdoc.sense[0] = {};
		thisdoc.sense[0].definition = [];
		thisdoc.sense[0].definition[0] = {};
		thisdoc.sense[0].definition[0].english = line[4];
		thisdoc.sense[0].definition[0].muixshaungx = '';
		thisdoc.sense[0].definition[0].taxonomy = line[5];
		thisdoc.sense[0].example = [{"english":"","phonemic":"","script":"","sound":""}];
		thisdoc.sound = line[6];
		thisdoc.forms = {}
		if (line[2] == 1) {
			line[2] = line[0] + '-tueq'
		}
		thisdoc.forms.past = line[2]
		if (line[3] == 1) {
			line[3] = 'v' + line[0]
		}
		thisdoc.forms.nom = line[3]
		thisdoc.photo = '';
		thisdoc = ksort(thisdoc)
		final.push(thisdoc)
	}
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
	fs.writeFile("./mos.json", saveData, function(err) {
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
