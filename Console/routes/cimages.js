const express = require('express');
const action = require('../action/cimages');
const drawer = require('../helpers/drawer');

const router = express.Router();


/*
    Создание нового файла с инструкцией для отображения
    curl -H "Content-Type: application/json" -H "iv-user: nastya" -X POST -d '{"text":["rect 6 2 4 10 red"]}' http://localhost:3000/cimages
*/
router.post('/', (request, response, next)=> {
    if (!request.body) {
        return response.sendStatus(400);     
    }
        
    const text = request.body.text;
    const user = request.headers['iv-user'];    

    if (user === undefined || user === '') {
        return response.status(403).send('User isn\'t specified in the request');
    }

    if (text === undefined || text === '') {
        return response.status(400).send('No instructions for writing to file');
    }

    if (!drawer.validateInstruction(text)) {
        return response.send('Bad instruction');
    }

    action.createFile( { user, text } )
        .then(guid => {
            response.send(guid);
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
router.get('/', (request, response) => {
    const user = request.query.user;

    const guidList = (user === undefined) ? action.getAllGuids() : action.getUserGuids(user);

    guidList
        .then(guids => {
            response.send(guids);
        }).catch(error => {
            console.log('Getting guids error: ', error);
            response.status('401').send(error)
        });
});


/*
    Получение инструкции по гуиду
    curl -X GET http://localhost:3000/cimages/0C68042E7507-9C2FE1BD33E5-9093DA01
*/
router.get('/:id', ( request, response ) => {
    const id = request.params['id'];

    action.getContentFile(id)
        .then( data => {
            response.send(JSON.parse(data).text);
        }).catch( error => {
            response.status('404').send('Error of getting file content: ' + error);
        }); 
});


/*
    Получение изображения по гуиду
    curl -X GET http://localhost:3000/cimages/image/6FE49CF67012-1DF074CDCD81-9706122E
*/
router.get('/image/:id', ( request, response ) => {
    const id = request.params['id'];

    action.getImage(id)
        .then( data => {
            response.send(data);
        }).catch( error => {
            response.status('404').send('Error of getting image: ' + error);
        }); 
});


/*
    Изменение инструкций в файле
    curl -X POST http://localhost:3000/cimages/6FE49CF67012-1DF074CDCD81-9706122E -H 'Content-Type: application/json' -d '{ "text": ["rect 1 1 1 10 blue"], "user": "basil"}'
 */

router.post('/:id', (request, response) => {
    const params = Object.keys(request.body); 
    const guid = request.params['id'];    

    if (params.length === 0) {
        return response.status(400).send('Nothing to update');
    }

    let isUnknownParams = params.some((param) => !['text', 'user'].includes(param));

    if (isUnknownParams) {
        response.status(403).send('Unknown parameters');
    }

    action.updateContentFile(guid, request.body)
        .then(result => {
            response.send(result);
        })
        .catch(error => 
            response.status('404').send('Error of updating content file: ' + error));

});


 
module.exports = router;