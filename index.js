#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const thisPath = console.log(path.dirname(__filename));
const clear = require('clear');
const chalk = require('chalk');
const timestamp = require('unix-timestamp');
const uuid = require('uuid/v1');

const language = 'Phake';
const editor = 'ailot';
const un = editor;
const pw = require('./auth.js');

/* CouchDB */
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
var remoteDB = new PouchDB('http://' + un + ':' + pw + '@phonemica.net:5984/' + language.toLowerCase());
let insert = true;

/* everything else */
var progress = require('cli-progress');
var progressBar = new progress.Bar({
	barCompleteChar: '█',
	barIncompleteChar: ' ',
	fps: 5,
	stream: process.stdout,
	barsize: 65,
	format: chalk.green.bold('Progress: ') + '{bar} {percentage}%'
});

/* Load the Toolbox file */
const sourceFile = './source.txt';
let sourceData = fs.readFileSync(sourceFile).toString().split("\n");

clear();

var fullArray = [];
var tempEntry = {};
var fieldData = require('./fields');
console.log(chalk.green.bold('Ailot Dictionary Converter'));
console.log(chalk.green('(c)2016–2017 Phonemica'));
console.log("");
findSource(sourceFile);

// de-Banchob-ify the phonemic script, e.g. <N> converts to <ŋ>
var banchob = require('./banchob.js');

function ksort(object) {
	var keys = Object.keys(object).sort(),
		sorted = {};
	for (let i in keys) {
		sorted[keys[i]] = object[keys[i]];
	}
	return sorted;
}

function cleanIndicies(input) {
	let output = [];
	input.map(function(item) {
		output.push(item);
	})
	return output;
}

function fixBreaks(input) {
	let holder;
	let output = []
	console.log(chalk.red('Fixing line breaks...'));
	for (i in input) {
		if (input[i][0] != '\\' ) {
			if ((input[i].substring(0, 2) == "\\_" && i < 5) || input[i].trim() == '') {
				// skip
			} else {
				let e = i-1;
				output[e] = '' + output[e].replace(/[^\x00-\xFF]/g, "").toString().trim() + " " + input[i].replace(/[^\x00-\xFF]/g, "").toString().trim();
				//console.log(output[e]);
			}
		} else {
			input[i] = input[i].replace("( ","(").replace(" )",")");
			output[i] = input[i];
		}
	}
	console.log(chalk.red('Fixed.'));
	console.log("");
	return cleanIndicies(output);
}

function createArrays(limit) {
	sourceData = fixBreaks(sourceData);
	progressBar.start(limit, 0);
	var fieldSets = null,
		parentField = null,
		childField = null;
	for (i in sourceData) {
		progressBar.update(i);
		if (i < limit) {
			if (sourceData[i].substring(0, 2) == "\\_" && i < 5) {
				// ignore the header
			} else if (sourceData[i].trim() == '') {
				// ignore blank lines
			} else {
				let e = sourceData[i].indexOf(' ');
				let arrays = [sourceData[i].slice(0, e), sourceData[i].slice(e + 1)];
				let field = arrays[0];
					field = field.replace(/\\/g, "").replace(/\r/g, "");
				if (field == "lx" || field == "se") {
					if (Object.keys(tempEntry).length != 0 && tempEntry.constructor === Object) {
						// Doing this line by line instead of iterating so it doesn't mess up an array somewhere else
						tempEntry['gloss'] = ksort(tempEntry['gloss']);
						tempEntry['pos'] = [(tempEntry['pos'] + ".").replace(/\.\./g, ".")];

						let examples = [];
						if (tempEntry['example'] != null && tempEntry['example']['english'] != null) {
							for (let v = 0; v < tempEntry['example']['english'].length; v++) {

								examples[v] = {
									'english': tempEntry['example']['english'][v],
									'phonemic': banchob(tempEntry['example']['phonemic'][v]),
									'script': tempEntry['example']['script'][v],
								}
							}
						}

						tempEntry['sense'] = [{
							'gloss': tempEntry['gloss'],
							'definition': tempEntry['definition'],
							'pos': tempEntry['pos'],
							'example': examples
						}];

						delete tempEntry['gloss'];
						delete tempEntry['pos'];
						delete tempEntry['definition'];
						delete tempEntry['example'];

						tempEntry['notes'] = "";

						tempEntry['derivatives'] = [];
						tempEntry['editor'] = editor;

						for (let c = 0; c < tempEntry['sense'].length; c++) {
							tempEntry['sense'][c] = ksort(tempEntry['sense'][c]);
						}
						tempEntry = ksort(tempEntry);
						fullArray.push(tempEntry);
						if (insert == true) {
							remoteDB.put(tempEntry);
						}
					}
					tempEntry = {};
					tempEntry._id = uuid();
					tempEntry.image = [];
					tempEntry.gloss = {}
					tempEntry.sense = [];
				}
				if (field in fieldData) {
					var fieldName = fieldData[field];
					if (fieldName) {
						var fieldValue = arrays[1].replace(/\r/g, "");
						if (fieldName.indexOf('.') !== -1) {
							fieldSets = fieldName.split(".");
							parentField = fieldSets[0];
							childField = fieldSets[1];
							if (typeof tempEntry[parentField] !== 'object' && tempEntry[parentField] !== null) {
								tempEntry[parentField] = {};
							}
							if ("\\" + field != fieldValue) {
								if (parentField == 'gloss') {
									tempEntry[parentField][childField] = fieldValue;
								} else if (parentField == 'definition') {
									tempEntry[parentField] = [];
									tempEntry[parentField].push({
										'english': fieldValue
									});
								} else {
									tempEntry[parentField][childField] = [fieldValue];
								}
							} else {
								tempEntry[parentField][childField] = [];
							}
						} else {
							fieldSets = null,
								parentField = null,
								childField = null;
							if ("\\" + field != fieldValue) {
								if (fieldName == 'date') {
									tempEntry[fieldName] = {};
									tempEntry[fieldName]["date"] = fieldValue;
									tempEntry[fieldName]["unix"] = timestamp.fromDate(fieldValue);
								} else if (fieldName == 'phonemic') {
									tempEntry['phonemic'] = banchob(fieldValue);
								} else if (fieldName == 'subentry' || fieldName == 'lexeme') {
									tempEntry['lexeme'] = fieldValue; // remove later
								} else if (fieldName == 'image') {
									tempEntry['image'].push(fieldValue);
								} else {
									tempEntry[fieldName] = fieldValue;
								}
							} else {
								tempEntry[fieldName] = "";
							}
						}
					}
				}
			}
		}
	}
	progressBar.stop();
	console.log("");
	console.log(chalk.yellow('Done!'));
	console.log("");
	console.log(chalk.green.bold('Sample output:'));
	console.log(JSON.stringify(fullArray[0]));
	saveJSON(fullArray);
}

function saveJSON(fullArray) {
	console.log("");
	console.log(chalk.green.bold('Saving file…'));
	var saveData = JSON.stringify(fullArray, null, 2);
	fs.writeFile("./dictionary.json", saveData, function(err) {
		if (err) {
			console.log(chalk.red.bold('Error: ' + err));
		} else {
			console.log(chalk.green.bold('File saved'));
			console.log("");
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
