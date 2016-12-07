
const fs = require('fs');
const path = require('path');
const thisPath = console.log(path.dirname(__filename));

const clear = require('clear');
const chalk = require('chalk');

const timestamp = require('unix-timestamp');

const sourceFile = './source.txt';

var fullArray = [];

clear();

const sourceData = fs.readFileSync(sourceFile).toString().split("\n");
var tempEntry = {};

// names as they appear in ToolBox
var fieldCodes = ["lx","ph","sn","ps","ge","de","notes","xv","xr","xe","dt"]
var fieldNames = ["lexeme","phonemic","sense","pos","gloss.english","definition.english","notes","example.script","example.phonemic","example.english","date"]
// ^ names as they need to be in AilotDict

console.log(chalk.green.bold('Ailot Dictionary Converter'));
console.log(chalk.green('(c)2016 Phonemica'));
console.log("");
findSource(sourceFile);

function createArrays(limit=30) {
	console.log("creating arrays…");
	var fieldSets = null,
		parentField = null,
		childField = null;
	for (i in sourceData) {
		if (i < limit) {
			if (sourceData[i].substring(0, 2) == "\\_" && i < 5) {
				// ignore the header
			} else if (sourceData[i].trim() == '') {
				// print the entry if it's not empty
				if (Object.keys(tempEntry).length != 0 && tempEntry.constructor === Object) {
					console.log("");
					//console.log(JSON.stringify(tempEntry));
					fullArray.push(tempEntry);
					console.log(chalk.green.bold('Output:'));
					console.log(JSON.stringify(fullArray));
				}
				tempEntry = {}; // start a new entry array
			} else {
				var e = sourceData[i].indexOf(' ');
				var arrays = [sourceData[i].slice(0,e), sourceData[i].slice(e+1)];
				var field = arrays[0].replace(/\\/g,"").replace(/\r/g,"");
				var fieldIndex = fieldCodes.indexOf(field);
				if (fieldIndex > -1) {
					var fieldName = fieldNames[fieldIndex];
					if (fieldName) {
						var fieldValue = arrays[1].replace(/\r/g,"");
						if (fieldName.indexOf('.') !== -1) {
							fieldSets = fieldName.split(".");
							parentField = fieldSets[0];
							childField = fieldSets[1];
							if (typeof tempEntry[parentField] !== 'object' && tempEntry[parentField] !== null) {
								tempEntry[parentField] = {};
							}
							if ("\\"+field != fieldValue) {
								tempEntry[parentField][childField] = fieldValue;
							} else {
								tempEntry[parentField][childField] = "";
							}
						} else {
							fieldSets = null,
							parentField = null,
							childField = null;
							if ("\\"+field != fieldValue) {
								// dates are special
								if (fieldName == 'date') {
									tempEntry[fieldName] = {};
									tempEntry[fieldName]["date"] = fieldValue;
									tempEntry[fieldName]["unix"] = timestamp.fromDate(fieldValue);
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
	console.log("");
	console.log(chalk.green.bold('Done'));
	console.log("");
}

function getFields(limit) {
	console.log(chalk.bold("getting fields…"));
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
				var field = arrays[0].replace(/\\/g,"").replace(/\r/g,"");
				if (fieldList.indexOf(field) === -1) {
					fieldList.push(field);
				}
			}
		}
	}
	console.log(JSON.stringify(fieldList));
	createArrays();
}

function findSource(sourceFile) {
	fs.access(sourceFile, function(err) {
		if (err && err.code === 'ENOENT') {
			// This isn't throwing the error. Figure out why.
			console.log(chalk.red.bold('source data missing'));
			console.log(chalk.red.bold('This is not good.'));
		} else {
			console.log(chalk.bold('source data: ') + chalk.green(sourceFile));
			getFields(200);
		}
	});
}
