const http = require('http');
const util = require('util');
const express = require('express');
const fs = require('fs');
const cache = require('./cache.js');
const drawer = require('./drawer.js');

const CACHE_TIME = 5 * 60 * 1000; //ms
const GUID_KEY = 'guids';
const FOLDER = __dirname + '/storage/';

const app = express();
const jsonParser = express.json();
const dir = util.promisify(fs.readdir);
const contentFile = util.promisify( fs.readFile ); 
const writeFile = util.promisify( fs.writeFile ); 

init();

/*
    Создание нового файла с инструкцией для отображения
    curl -H "Content-Type: application/json" -H "iv-user: nastya" -X POST -d '{"text":["rect 6 2 4 10 red"]}' http://localhost:3000/cimages
*/
app.post('/cimages', jsonParser, (request, response)=> {
    if (!request.body) {
        return response.sendStatus(400);     
    }
        
    const text = request.body.text;
    const user = request.headers['iv-user'];     
    const guid = getGuid();
    const data = {user, text, guid};

    let path = FOLDER + guid + '.cimage';

    writeFile(path, JSON.stringify(data))
        .then(result => {
            cache.set(guid, data);
            init();
            response.status('200').send(guid);
        })
        .catch(error => {
            console.log('Write error: ', error);
            response.status('401').send(error)
        });
});


/*
    Получение всех гуидов в папке вообще или конкретного пользователя
    curl -X GET http://localhost:3000/cimages/ -H 'Host: localhost:3000'
*/
app.get('/cimages/', (request, response) => {
    const user = request.query.user;

    cache.get(GUID_KEY)
        .then(cacheData => {
            return cacheData;
        }).catch(error => {
            return getContentAllFiles();
        }).then((result) => {
            let contents = !user ? result : result.filter((content) => content.user === user);  
            let guids = contents.map((content) => content.guid);
    
            response.status(200).send(guids);
        })
        .catch(( error ) => { 
            console.log('Error: ', error);
            response.status(401).send(`Error: ${error}`);    
        });;
});


/*
    Получение количества файлов по данному пользователю
    curl -X GET 'http://localhost:3000/stat/cimages?user' -H 'Host: localhost:3000'
*/
app.get('/stat/cimages', ( request, response ) => {
    cache.get(GUID_KEY)
        .then(cacheData => {
            return cacheData;
        })
        .catch(error => {
            return getContentAllFiles();
        }).then(allFiles => {
            let stat = allFiles.reduce((all, file) => {
                all[file.user] = !all[file.user] ? 1 : all[file.user] + 1;
                return all;
            }, {});

            response.status(200).send(JSON.stringify(stat));;
        });;        
});


/*
    Получение инструкции по гуиду
    curl -X GET http://localhost:3000/cimages/0C68042E7507-9C2FE1BD33E5-9093DA01
*/
app.get('/cimages/:id', ( request, response ) => {
    let id = request.params['id'];

    cache.get(id)
        .then(cacheData =>  cacheData
        ).catch(error => contentFile(FOLDER + id + '.cimage', 'utf8')
        ).then( data => {
            let content = JSON.parse(data);
            response.send(content.text);
        }).catch( error => {
            response.status('404').send('No file');
        });;        
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

    const path = FOLDER + guid + '.cimage';

    contentFile(path, "utf8")
        .then( data => {
            let content = JSON.parse(data);
            Object.assign(content, request.body);
   
            return writeFile(path, JSON.stringify(content));
        }).then((result) => {
            cache.set(guid, result);
            init();
            response.send('ok');
        }).catch( error => {
            console.log('Error of writing file : ', error);
            response.status('400').send('Writing error');
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

function getContentAllFiles() {
    return dir( FOLDER )
        .then(( files ) => {
            let allFiles = [];
            
            let content = files.reduce((promise, fileName) => {
                return promise.then(res => {
                    return contentFile( FOLDER + fileName, "utf-8" )
                        .then((content) => {
                            allFiles.push(JSON.parse(content));
                            return allFiles;
                        });
                    });
                }, Promise.resolve());

                return content;
        });
}


function init() {
    getContentAllFiles()
        .then(content => {
           cache.set(GUID_KEY, content, { inspiredIn: CACHE_TIME });
        });
} 