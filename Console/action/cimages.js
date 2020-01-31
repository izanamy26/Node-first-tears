const fs = require('fs');
const util = require('util');
const params = require('../config/config');
const common = require('../helpers/common');
const cache = require('../helpers/cache');
const files = require('../helpers/files');
const drawer = require('../helpers/drawer');

const writeFile = util.promisify( fs.writeFile ); 
const contentFile = util.promisify( fs.readFile ); 

module.exports = {
    createFile: ( data ) => {
        const guid = common.getGuid();
        const fileName = process.cwd() + params.storageFolder + guid + params.fileExt;

        return writeFile(fileName, JSON.stringify({ ...data , guid }))    
        .then(result => {
            cache.set(guid, data);
            return guid;
        })
        .catch(error => {
           throw new Error('Writing error to file: ' + error);
        });
    },

    getAllGuids: () => {
        return files.getContentAllFiles(process.cwd() + params.storageFolder)
            .then(files => {
                return files.map( file => file.guid );
            })
            .catch(error => {
                throw new Error('Error of getting file content: ' + error);
            });
    },

    getUserGuids: ( user ) => {
        return files.getContentAllFiles(process.cwd() + params.storageFolder)
        .then(files => {
            return files
                .filter( file => file.user === user )
                .map( file => file.guid );
        })
        .catch(error => {
            throw new Error('Error of getting user file content: ' + error);
        });
    },

    getContentFile: ( id ) => {
        return cache.get(id)
            .catch(error => 
                contentFile( process.cwd() + params.storageFolder + id + params.fileExt, 'utf8'));
    },

    updateContentFile: ( id, updateData ) => {
        const path = process.cwd() + params.storageFolder + id + params.fileExt;

        return contentFile(path, "utf8")
            .then( data => {
                let content = JSON.parse(data);
                Object.assign(content, updateData);
    
                return writeFile(path, JSON.stringify(content));
            }).then((result) => {
                cache.set(id, result);
                return 'ok';
            });
    },

    getImage: function (id) {
       return this.getContentFile(id)
        .then(data => {
            const instructions = JSON.parse(data).text;

            return drawer.getFigures(instructions);
        });
    }
};
