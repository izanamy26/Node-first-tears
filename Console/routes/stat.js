const express = require('express');
const action = require('../action/stat');

const router = express.Router();

/*
    Получение количества файлов по данному пользователю
    curl -X GET 'http://localhost:3000/stat/cimages?user' -H 'Host: localhost:3000'
*/
router.get('/', ( request, response ) => {
    action.getUserStat()
        .then(result => 
            response.send(result))
        .catch(error => response.status(400).send('Stat error: ' + error));    
});

module.exports = router;