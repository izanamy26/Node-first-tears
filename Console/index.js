const drawer = require('./drawer.js');
const http = require('http');
const express = require('express');
const fs = require('fs');

const app = express();

/* drawer.readFile('instructions.txt').then((res) => console.log(res()));
 */

const jsonParser = express.json();

//   curl -H "Content-Type: application/json" -H "iv-user: nastya" -X POST -d '{"text":["rect 6 2 4 10 red"]}' http://localhost:3000/cimages
app.post('/cimages', jsonParser, (request, response)=> {
    console.log('request: ', request.body);


    if(!request.body) 
        return response.sendStatus(400);
    
    const text = request.body.text;
    const user = request.headers['iv-user'];     
    const guid = getGuid();

    response.send(guid);
    let path = './storage/' + guid + '.cimage';

    fs.writeFile(path, JSON.stringify({user, text, guid}), 'utf8', (err) => {
        console.log('Error: ', err);
    });
});


app.get('/cimages/:id', (request, response) => {
    const id = request.params['id'];

    let path = 'storage/' + id + '.cimage';
    let flag = request.query.image !== undefined;

    console.log('flag: ', flag);

    fs.access(path, (err) => {
        if (err) {
            response.sendStatus(404);
        }
    });

    fs.readFile(path, "utf8", (err, data) => {
        if (err) {

        }

       let instructions = JSON.parse(data); 

       console.log('instructions: ', instructions.text);

        if (flag) {
            data = drawer.getFigures(instructions.text)
                .then((result) => { 
                    response.send(result);
                });
        }

        response.send(data);      
    });


    // if (flag) {
    //     drawer.getFigures(path)
    //         .then((result) => response.send(result));
    // } else {
  
    // }
});


app.listen(3000);

const getGuid = () => {
    return [
        (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
        (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
        (Math.random().toString(16).substr(2, 8) + '0'.repeat(8)).substr(0, 8)
    ].join('-').toUpperCase();
};

