const drawer = require('./drawer.js');
const http = require('http');
const express = require('express');
const fs = require('fs');

const app = express();
const FOLDER = 'storage/';

/* drawer.readFile('instructions.txt').then((res) => console.log(res()));
 */

const jsonParser = express.json();

//   curl -H "Content-Type: application/json" -H "iv-user: nastya" -X POST -d '{"text":["rect 6 2 4 10 red"]}' http://localhost:3000/cimages
// Create the file with instruction
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


app.get('/cimages/', (request, response) => {
    const files = fs.readdirSync( FOLDER );
    let guids = files.map((file) => {
        return file.replace('.cimage', '');
    });

    response.send(guids);
});



// curl -H "Content-Type: application/json" -H "iv-user: nastya" http://localhost:3000/cimages/
// Get a content of file
app.get('/cimages/:id', (request, response) => {
    const id = request.params['id'];

    if (Object.keys(request.query).length > 0) {
        var requestGuids = request.query.user !== undefined; 
        var user = ( requestGuids ) 
                ? request.query.user
                : Object.keys(request.query)[0];
    }

    let path = FOLDER + id + '.cimage';

    if ( user !== undefined ) {
        let files = fs.readdirSync( FOLDER );

        let guids = files.reduce((packetGuid, fileName) => {
            let content = fs.readFileSync( FOLDER + fileName, "utf-8" );

            let jsonContent = JSON.parse(content);
        
            if (jsonContent.user === user) {
                packetGuid.push(jsonContent.guid);
            }

            return packetGuid;
        }, []);

        response.send( (requestGuids) ? guids : JSON.stringify({ user: user, count: guids.length }) );
        return;
    }



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

        response.send(data);      
    });


    // if (flag) {
    //     drawer.getFigures(path)
    //         .then((result) => response.send(result));
    // } else {
  
    // }
});

/*curl -X POST \
 http://localhost:3000/cimages/0C68042E7507-9C2FE1BD33E5-9093DA01 \
-H 'Content-Type: application/json' \
-d '{
  "text": [
      "rect 1 1 1 10 blue"
  ],
  "user": "margo"
}' */
// Change data file
app.post('/cimages/:id',  jsonParser, (request, response) => {
    const params = Object.keys(request.body); 
    const guid = request.params['id'];    

    if(params.length === 0) {
        return response.sendStatus(400);
    }

    let isUnknownParams = params.some((param) => !['text', 'user'].includes(param));

    if (isUnknownParams) {
        response.status(403).send('Unknown parameters');
    }

    const path = 'storage/' + guid + '.cimage';
    const fileContent = fs.readFileSync(path, "utf8");
    let jsonFileContent = JSON.parse( fileContent );
    Object.assign(jsonFileContent, request.body);
    fs.writeFileSync(path, JSON.stringify( jsonFileContent ));
    
    response.send('ok');
});







app.listen(3000);

const getGuid = () => {
    return [
        (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
        (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
        (Math.random().toString(16).substr(2, 8) + '0'.repeat(8)).substr(0, 8)
    ].join('-').toUpperCase();
};

