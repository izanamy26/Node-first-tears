const drawer = require('./console.js');

drawer.readFile('instructions.txt').then((res) => console.log(res()));