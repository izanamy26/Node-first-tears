const drawer = require('./drawer.js');
const http = require('http');
const util = require('util');
const express = require('express');
const fs = require('fs');

const app = express();
const FOLDER = 'storage/';


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


/*
    Получение всех гуидов в папке вообще или конкретного пользователя
    curl -X GET http://localhost:3000/cimages/ -H 'Host: localhost:3000'
    curl -H "Content-Type: application/json" http://localhost:3000/cimages/?user=margo
*/
app.get('/cimages/', (request, response) => {
    const dir = util.promisify(fs.readdir);
    const user = request.query.user;
    
    dir( FOLDER )
    .then(( files ) => {
        if ( user !== undefined ) {
            let userFiles = [];  

            files.forEach((fileName, index) => {
                let contentFile = util.promisify( fs.readFile ); 
                contentFile( FOLDER + fileName, "utf-8" )
                .then(content => {
                    let jsonContent = JSON.parse(content);

                    if (jsonContent.user === user) {
                        userFiles.push(fileName);
                    }

                    if (index === files.length - 1) { // Уточнить этот вопрос, как в другом месте
                        response.send(userFiles);
                    }   
                }).catch( error => {
                    console.log('Error of getting content of file: ', error);
                });
            });    
        } else {
            let guids = files.map((file) => {
                return file.replace('.cimage', '');
            });
        
            response.send(guids);
        }    
    })
    .catch(( error ) => { 
        console.log('Error of reading dir: ', error)
    });
});


/*
    Получение количества файлов по данному пользователю
    curl -X GET 'http://localhost:3000/stat/cimages?nastya' -H 'Host: localhost:3000'
*/
app.get('/stat/cimages', ( request, response ) => {
    if ( Object.keys(request.query).length !== 1 ) {
        response.status('401').send('Неверный запрос');
    }

    const user = Object.keys( request.query )[0];    
    const dir = util.promisify(fs.readdir);

    dir( FOLDER )
    .then( files => {
        let contentFile = util.promisify( fs.readFile ); 
        let countUserFiles = 0;

        files.forEach(( fileName, index ) => {
            contentFile( FOLDER + fileName, "utf-8" )
                .then(content => {
                    let jsonContent = JSON.parse(content);

                    countUserFiles += Number(jsonContent.user === user);

                    if (index === files.length - 1) { // Уточнить этот вопрос, как в другом месте
                        response.send(JSON.stringify({ user: user, count: countUserFiles }));
                    }    
                }).catch( error => {
                    console.log('Error of getting content of file: ', error);
                });
        });
    }).catch(error => {
        console.log( 'Error of getting file\'s stat: ', error );
    });
});


/*
    Получение инструкции по гуиду
    curl -X GET http://localhost:3000/cimages/0C68042E7507-9C2FE1BD33E5-9093DA01
*/
app.get('/cimages/:id', ( request, response ) => {
    let id = request.params['id'];

    let contentFile = util.promisify( fs.readFile ); 

    contentFile(FOLDER + id + '.cimage', 'utf8')
    .then( content => {
        let jsonContent = JSON.parse(content);

        response.send(jsonContent.text);
    }).catch( error => {
        response.status('404').send('No file');
    });

    console.log(id);
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
    let contentFile = util.promisify( fs.readFile ); 

    contentFile(path, "utf8")
        .then( content => {
            let jsonContent = JSON.parse( content );
            Object.assign(jsonContent, request.body);

            let writeFile = util.promisify( fs.writeFile ); 
   
            writeFile(path, JSON.stringify( jsonContent ))
                .then(() => {
                    response.send('ok');
                }).catch( error => {
                    console.log('Error of writing file : ', error);
                    response.status('400').send('Writing error');
                });

        }).catch( error => {
            response.status('404').send('No file');
        });
    
});



app.listen(3000);

const getGuid = () => {
    return [
        (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
        (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
        (Math.random().toString(16).substr(2, 8) + '0'.repeat(8)).substr(0, 8)
    ].join('-').toUpperCase();
};

