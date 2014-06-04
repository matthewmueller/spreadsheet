var Spreadsheet = require('spreadsheet');
var spreadsheet = Spreadsheet();

console.log(spreadsheet);


function dir(object) {
    var s;
    stuff = [];
    for (s in object) {
        stuff.push(s);
    }
    stuff.sort();
    return stuff;
}

