const fs = require('fs');
const util = require('util');

const dir = util.promisify(fs.readdir);
const contentFile = util.promisify( fs.readFile ); 

module.exports = {
    getContentAllFiles: (folder) => {
        return dir( folder )
            .then(( files ) => {
                let allFiles = [];
                
                let content = files.reduce((promise, fileName) => {
                    return promise.then(res => {

                        return contentFile( folder + fileName, "utf-8" )
                            .then((content) => {
                                allFiles.push(JSON.parse(content));
                                return allFiles;
                            });

                        });
                    }, Promise.resolve());
    
                    return content;
            });
    }
};